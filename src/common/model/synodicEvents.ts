/**
 * synodicEvents.ts
 *
 * When does a target planet reach each configuration, as seen from an observer planet?
 *
 * Everything follows from the heliocentric phase φ = θ_target − θ_observer. On circular
 * orbits φ changes at the constant rate 2π/S (S = synodic period), so each configuration
 * sits at a fixed phase and its times are evenly spaced, exactly one synodic period apart.
 *
 * To make the phase always increase, use u = φ for an inferior target (it moves faster
 * than the observer) and u = −φ for a superior one. Then, with α as defined below:
 *
 *   u          inferior target            superior target
 *   0          inferior conjunction       opposition
 *   α          greatest elongation (W)    quadrature (E)
 *   π          superior conjunction       conjunction
 *   2π − α     greatest elongation (E)    quadrature (W)
 *
 * α = acos(a_t / a_o) for an inferior target and acos(a_o / a_t) for a superior one.
 * Retrograde motion runs from u = 2π − φ_s to u = φ_s, where φ_s is the stationary phase.
 * See doc/model.md.
 */

import { ConfigurationEvent } from "./ConfigurationEvent.js";
import { mod2pi, siderealPeriod, stationaryPhase, synodicPeriod, TWO_PI, wrapPi } from "./orbitalMath.js";

/** An observer planet and a target planet on circular orbits; longitudes at t = 0 in radians. */
export type PlanetPair = {
  readonly aObserver: number;
  readonly aTarget: number;
  readonly observerEpochLongitude: number;
  readonly targetEpochLongitude: number;
};

export type EventPhase = { readonly event: ConfigurationEvent; readonly phase: number };

export type TimedEvent = { readonly event: ConfigurationEvent; readonly time: number };

/** Which events to consider: named configurations, stationary points, or both. */
export type EventFilter = { readonly configurations: boolean; readonly stationaryPoints: boolean };

export const ALL_EVENTS: EventFilter = { configurations: true, stationaryPoints: true };

/** Phases this close (rad) count as the same phase. */
const PHASE_EPSILON = 1e-9;

export function isInferior(aObserver: number, aTarget: number): boolean {
  return aTarget < aObserver;
}

/** The events of one synodic cycle and the monotonic phase u at which each occurs, sorted by phase. */
export function eventPhases(aObserver: number, aTarget: number): EventPhase[] {
  const inferior = isInferior(aObserver, aTarget);
  const alpha = Math.acos(inferior ? aTarget / aObserver : aObserver / aTarget);
  const station = stationaryPhase(aObserver, aTarget);
  const phases: EventPhase[] = inferior
    ? [
        { event: ConfigurationEvent.INFERIOR_CONJUNCTION, phase: 0 },
        { event: ConfigurationEvent.GREATEST_ELONGATION_WEST, phase: alpha },
        { event: ConfigurationEvent.SUPERIOR_CONJUNCTION, phase: Math.PI },
        { event: ConfigurationEvent.GREATEST_ELONGATION_EAST, phase: TWO_PI - alpha },
      ]
    : [
        { event: ConfigurationEvent.OPPOSITION, phase: 0 },
        { event: ConfigurationEvent.QUADRATURE_EAST, phase: alpha },
        { event: ConfigurationEvent.CONJUNCTION, phase: Math.PI },
        { event: ConfigurationEvent.QUADRATURE_WEST, phase: TWO_PI - alpha },
      ];
  phases.push(
    { event: ConfigurationEvent.RETROGRADE_ENDS, phase: station },
    { event: ConfigurationEvent.RETROGRADE_BEGINS, phase: TWO_PI - station },
  );
  return phases.sort((p, q) => p.phase - q.phase);
}

/** Monotonic phase u ∈ [0, 2π) for a heliocentric phase φ = θ_target − θ_observer. */
export function monotonicPhaseFromHeliocentric(aObserver: number, aTarget: number, phi: number): number {
  return mod2pi(isInferior(aObserver, aTarget) ? phi : -phi);
}

export function pairSynodicPeriod(pair: PlanetPair): number {
  return synodicPeriod(siderealPeriod(pair.aObserver), siderealPeriod(pair.aTarget));
}

/** Heliocentric phase φ = θ_target − θ_observer (rad, (−π, π]) at time t (yr). */
export function heliocentricPhase(pair: PlanetPair, t: number): number {
  const theta = (a: number, epoch: number): number => epoch + (TWO_PI * t) / siderealPeriod(a);
  return wrapPi(theta(pair.aTarget, pair.targetEpochLongitude) - theta(pair.aObserver, pair.observerEpochLongitude));
}

/** Monotonic phase u ∈ [0, 2π) at time t (yr). It grows by 2π every synodic period. */
export function monotonicPhase(pair: PlanetPair, t: number): number {
  return monotonicPhaseFromHeliocentric(pair.aObserver, pair.aTarget, heliocentricPhase(pair, t));
}

function passesFilter(event: ConfigurationEvent, filter: EventFilter): boolean {
  return event.isStationaryPoint ? filter.stationaryPoints : filter.configurations;
}

/** The first event strictly after time t (yr) that passes the filter, or null if none can occur. */
export function nextEvent(pair: PlanetPair, t: number, filter: EventFilter = ALL_EVENTS): TimedEvent | null {
  return findEvent(pair, t, filter, 1);
}

/** The last event strictly before time t (yr) that passes the filter, or null if none can occur. */
export function previousEvent(pair: PlanetPair, t: number, filter: EventFilter = ALL_EVENTS): TimedEvent | null {
  return findEvent(pair, t, filter, -1);
}

function findEvent(pair: PlanetPair, t: number, filter: EventFilter, direction: 1 | -1): TimedEvent | null {
  const synodic = pairSynodicPeriod(pair);
  if (!Number.isFinite(synodic)) {
    return null;
  }
  const u = monotonicPhase(pair, t);
  let best: TimedEvent | null = null;
  for (const { event, phase } of eventPhases(pair.aObserver, pair.aTarget)) {
    if (!passesFilter(event, filter)) {
      continue;
    }
    let delta = mod2pi(direction * (phase - u));
    if (delta < PHASE_EPSILON || TWO_PI - delta < PHASE_EPSILON) {
      delta = TWO_PI;
    }
    const time = t + (direction * delta * synodic) / TWO_PI;
    if (best === null || direction * (time - best.time) < 0) {
      best = { event, time };
    }
  }
  return best;
}

/** The event (passing the filter) within `toleranceYears` of time t, or null. */
export function eventAt(
  pair: PlanetPair,
  t: number,
  toleranceYears: number,
  filter: EventFilter = ALL_EVENTS,
): ConfigurationEvent | null {
  const synodic = pairSynodicPeriod(pair);
  if (!Number.isFinite(synodic)) {
    return null;
  }
  const tolerance = (TWO_PI * toleranceYears) / synodic;
  return eventNearPhase(pair.aObserver, pair.aTarget, monotonicPhase(pair, t), tolerance, filter);
}

/** The event (passing the filter) whose phase is within `tolerance` (rad) of monotonic phase u, or null. */
export function eventNearPhase(
  aObserver: number,
  aTarget: number,
  u: number,
  tolerance: number,
  filter: EventFilter = ALL_EVENTS,
): ConfigurationEvent | null {
  let best: ConfigurationEvent | null = null;
  let bestDistance = Number.POSITIVE_INFINITY;
  for (const { event, phase } of eventPhases(aObserver, aTarget)) {
    const distance = Math.abs(wrapPi(phase - u));
    if (passesFilter(event, filter) && distance <= tolerance && distance < bestDistance) {
      best = event;
      bestDistance = distance;
    }
  }
  return best;
}
