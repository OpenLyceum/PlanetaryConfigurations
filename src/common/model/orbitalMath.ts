/**
 * orbitalMath.ts
 *
 * Pure functions for the heliocentric model the NAAP handout uses: coplanar,
 * circular, counter-clockwise orbits (seen from ecliptic north) with Kepler's
 * third law in solar units, P = a^1.5 (P in years, a in AU).
 *
 * Angles are radians. Ecliptic longitude increases counter-clockwise, which is
 * eastward on the sky. A positive elongation means the planet is EAST of the Sun
 * (evening sky); negative means WEST (morning sky).
 *
 * See doc/model.md for the derivations.
 */

import { Vector2 } from "scenerystack/dot";
import { DAYS_PER_YEAR, EARTH_ORBITAL_SPEED_KM_S } from "../../PlanetaryConfigurationsConstants.js";

export const TWO_PI = 2 * Math.PI;

/** Wraps an angle into [0, 2π). */
export function mod2pi(angle: number): number {
  const wrapped = angle % TWO_PI;
  return wrapped < 0 ? wrapped + TWO_PI : wrapped;
}

/** Wraps an angle into (−π, π]. */
export function wrapPi(angle: number): number {
  const wrapped = mod2pi(angle);
  return wrapped > Math.PI ? wrapped - TWO_PI : wrapped;
}

export function toDegrees(radians: number): number {
  return (radians * 180) / Math.PI;
}

export function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

export function yearsToDays(years: number): number {
  return years * DAYS_PER_YEAR;
}

export function daysToYears(days: number): number {
  return days / DAYS_PER_YEAR;
}

/** Sidereal period (yr) of a circular orbit of semimajor axis a (AU): Kepler's third law. */
export function siderealPeriod(a: number): number {
  return a ** 1.5;
}

/** Semimajor axis (AU) for a sidereal period P (yr): the inverse of {@link siderealPeriod}. */
export function semimajorAxis(period: number): number {
  return period ** (2 / 3);
}

/** Mean orbital speed (km/s) on a circular orbit of radius a (AU). */
export function orbitalSpeed(a: number): number {
  return EARTH_ORBITAL_SPEED_KM_S / Math.sqrt(a);
}

/** Heliocentric longitude (rad) at time t (yr), given the longitude at t = 0. */
export function heliocentricLongitude(a: number, longitudeAtEpoch: number, t: number): number {
  return mod2pi(longitudeAtEpoch + (TWO_PI * t) / siderealPeriod(a));
}

/** Heliocentric position (AU) of a planet at longitude θ on an orbit of radius a. */
export function heliocentricPosition(a: number, longitude: number): Vector2 {
  return new Vector2(a * Math.cos(longitude), a * Math.sin(longitude));
}

/** Ecliptic longitude (rad, [0, 2π)) of `target` as seen from `observer`. */
export function apparentLongitude(observer: Vector2, target: Vector2): number {
  return mod2pi(Math.atan2(target.y - observer.y, target.x - observer.x));
}

/** Ecliptic longitude (rad) of the Sun as seen from `observer`. */
export function sunLongitude(observer: Vector2): number {
  return mod2pi(Math.atan2(-observer.y, -observer.x));
}

/**
 * Signed elongation (rad, (−π, π]) of `target` seen from `observer`: the angle from
 * the Sun to the target on the sky. Positive is east of the Sun, negative is west.
 */
export function signedElongation(observer: Vector2, target: Vector2): number {
  return wrapPi(apparentLongitude(observer, target) - sunLongitude(observer));
}

/** Synodic period (yr) of two planets with sidereal periods p1 and p2 (yr). Infinite if equal. */
export function synodicPeriod(p1: number, p2: number): number {
  const rate = Math.abs(1 / p1 - 1 / p2);
  return rate === 0 ? Number.POSITIVE_INFINITY : 1 / rate;
}

/**
 * Sidereal period P (yr) from a synodic period S (yr) measured from Earth (E = 1 yr).
 * Inferior planet: 1/S = 1/P − 1/E, so P = S / (1 + S).
 * Superior planet: 1/S = 1/E − 1/P, so P = S / (S − 1); needs S > 1 yr, else null.
 */
export function siderealFromSynodic(synodic: number, isInferior: boolean, earthPeriod = 1): number | null {
  if (!(synodic > 0)) {
    return null;
  }
  const inverse = isInferior ? 1 / synodic + 1 / earthPeriod : 1 / earthPeriod - 1 / synodic;
  return inverse > 0 ? 1 / inverse : null;
}

/**
 * Synodic period S (yr) from a sidereal period P (yr), seen from Earth (E = 1 yr).
 * Inferior planets need P < E and superior planets P > E, else null.
 */
export function synodicFromSidereal(sidereal: number, isInferior: boolean, earthPeriod = 1): number | null {
  if (!(sidereal > 0)) {
    return null;
  }
  const inverse = isInferior ? 1 / sidereal - 1 / earthPeriod : 1 / earthPeriod - 1 / sidereal;
  return inverse > 0 ? 1 / inverse : null;
}

/** Greatest elongation (rad) of an inferior planet: asin(a_inner / a_outer). */
export function greatestElongation(aInner: number, aOuter: number): number {
  return Math.asin(Math.min(1, aInner / aOuter));
}

/** Angular speed (rad/yr) of a circular orbit of radius a. */
function angularSpeed(a: number): number {
  return TWO_PI / siderealPeriod(a);
}

/**
 * Numerator of the rate of change of the target's apparent longitude seen from the
 * observer, as a function of the heliocentric phase φ = θ_target − θ_observer:
 *
 *   dλ/dt ∝ r_o²ω_o + r_t²ω_t − r_o r_t (ω_o + ω_t) cos φ
 *
 * Positive is direct (eastward) motion against the stars; negative is retrograde.
 */
export function apparentMotionRate(aObserver: number, aTarget: number, phase: number): number {
  const wo = angularSpeed(aObserver);
  const wt = angularSpeed(aTarget);
  return aObserver * aObserver * wo + aTarget * aTarget * wt - aObserver * aTarget * (wo + wt) * Math.cos(phase);
}

/**
 * Heliocentric phase |φ| (rad) at which the target is stationary against the stars.
 * Retrograde motion happens while |φ| is smaller than this, centred on inferior
 * conjunction (inferior target) or opposition (superior target). The formula is
 * symmetric in observer and target.
 */
export function stationaryPhase(aObserver: number, aTarget: number): number {
  const wo = angularSpeed(aObserver);
  const wt = angularSpeed(aTarget);
  const cosine = (aObserver * aObserver * wo + aTarget * aTarget * wt) / (aObserver * aTarget * (wo + wt));
  return Math.acos(Math.min(1, cosine));
}

/** Length (yr) of one retrograde loop: the fraction 2φ_s / 2π of a synodic period. */
export function retrogradeDuration(aObserver: number, aTarget: number): number {
  const synodic = synodicPeriod(siderealPeriod(aObserver), siderealPeriod(aTarget));
  return (synodic * stationaryPhase(aObserver, aTarget)) / Math.PI;
}

/** Where a planet at a given elongation appears in the observer's sky around sunrise and sunset. */
export type SkyVisibility = "glare" | "evening" | "morning" | "allNight";

/** Elongation (rad) below which a planet is lost in the Sun's glare. */
const GLARE_ELONGATION = toRadians(15);

/** Elongation (rad) beyond which a planet is up essentially all night. */
const ALL_NIGHT_ELONGATION = toRadians(150);

/**
 * Classifies a signed elongation: near the Sun the planet is lost in its glare; east of the
 * Sun it is in the evening sky (it sets after the Sun); west of it, the morning sky; and
 * near opposition it is up all night.
 */
export function skyVisibility(elongation: number): SkyVisibility {
  const magnitude = Math.abs(elongation);
  if (magnitude < GLARE_ELONGATION) {
    return "glare";
  }
  if (magnitude > ALL_NIGHT_ELONGATION) {
    return "allNight";
  }
  return elongation > 0 ? "evening" : "morning";
}
