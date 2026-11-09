/**
 * SynodicMotionModel.ts
 *
 * The Planetary Configurations simulator of the NAAP handout (Q4–Q12, Q14–Q16).
 *
 * An observer planet and a target planet orbit the Sun on circular, coplanar orbits.
 * The whole state is one number, the time t (years since J2000): every position,
 * elongation, configuration and the motion-history trail are derived from it. So
 * dragging a planet, stepping backward, or jumping to the next configuration all just
 * set t, and the counter (t minus the time of the last Zero Counter) stays exact.
 *
 * "Pause at" stops playback exactly at the next configuration (or stationary point),
 * so the counter reads the synodic period to the precision of the model.
 */

import {
  BooleanProperty,
  DerivedProperty,
  Emitter,
  EnumerationProperty,
  NumberProperty,
  Property,
  type TReadOnlyProperty,
} from "scenerystack/axon";
import type { Vector2 } from "scenerystack/dot";
import type { TModel } from "scenerystack/joist";
import { TimeSpeed } from "scenerystack/scenery-phet";
import { ConfigurationEvent } from "../../common/model/ConfigurationEvent.js";
import {
  apparentLongitude,
  apparentMotionRate,
  daysToYears,
  heliocentricLongitude,
  heliocentricPosition,
  siderealPeriod,
  signedElongation,
  sunLongitude,
  TWO_PI,
  toRadians,
  wrapPi,
} from "../../common/model/orbitalMath.js";
import { PlanetChoice } from "../../common/model/PlanetChoice.js";
import {
  ALL_EVENTS,
  type EventFilter,
  eventAt,
  heliocentricPhase,
  nextEvent,
  type PlanetPair,
  pairSynodicPeriod,
  previousEvent,
  type TimedEvent,
} from "../../common/model/synodicEvents.js";
import type { TrailSample } from "../../common/model/TrailSample.js";
import {
  DAYS_PER_SECOND,
  DAYS_PER_YEAR,
  EVENT_EPSILON_YEARS,
  EVENT_NOW_TOLERANCE_DAYS,
  HYPOTHETICAL_A_DEFAULT,
  HYPOTHETICAL_A_RANGE,
  MIN_ORBIT_SEPARATION,
  SNAP_TOLERANCE_DAYS,
  STEP_DAYS,
  TRAIL_SAMPLES,
} from "../../PlanetaryConfigurationsConstants.js";
import PlanetaryConfigurationsNamespace from "../../PlanetaryConfigurationsNamespace.js";

/** Which of the two planets a drag or key press moves. */
export type PlanetRole = "observer" | "target";

/** Trail length bounds (yr): about one and a quarter synodic periods, clamped to these. */
const TRAIL_MIN_YEARS = 0.4;
const TRAIL_MAX_YEARS = 2.5;
const TRAIL_SYNODIC_FRACTION = 1.25;

export class SynodicMotionModel implements TModel {
  public readonly observerChoiceProperty = new EnumerationProperty(PlanetChoice.EARTH);
  public readonly targetChoiceProperty = new EnumerationProperty(PlanetChoice.MARS);

  /** Semimajor axis (AU) of the hypothetical planet, when one is chosen. */
  public readonly hypotheticalAProperty = new NumberProperty(HYPOTHETICAL_A_DEFAULT, {
    range: HYPOTHETICAL_A_RANGE,
    units: "AU",
  });

  /** Model time (yr since J2000). */
  public readonly timeProperty = new NumberProperty(0);

  /** Model time (yr) at the last Zero Counter. */
  public readonly counterStartProperty = new NumberProperty(0);

  public readonly isPlayingProperty = new BooleanProperty(false);
  public readonly timeSpeedProperty = new EnumerationProperty(TimeSpeed.NORMAL);

  public readonly pauseAtConfigurationsProperty = new BooleanProperty(false);
  public readonly pauseAtStationaryProperty = new BooleanProperty(false);
  public readonly snapProperty = new BooleanProperty(true);

  public readonly showSightLinesProperty = new BooleanProperty(true);
  public readonly showElongationArcProperty = new BooleanProperty(true);
  public readonly showLabelsProperty = new BooleanProperty(true);

  /** Apparent longitudes (rad) of the Sun and target at the last Zero Counter, for the zodiac reference ticks. */
  public readonly referenceSunLongitudeProperty = new Property<number | null>(null);
  public readonly referenceTargetLongitudeProperty = new Property<number | null>(null);

  /** Fires when playback pauses at a configuration or stationary point. */
  public readonly eventReachedEmitter = new Emitter<[ConfigurationEvent]>({
    parameters: [{ valueType: ConfigurationEvent }],
  });

  public readonly pairProperty: TReadOnlyProperty<PlanetPair>;
  public readonly observerPositionProperty: TReadOnlyProperty<Vector2>;
  public readonly targetPositionProperty: TReadOnlyProperty<Vector2>;
  /** Heliocentric longitudes (rad). */
  public readonly observerLongitudeProperty: TReadOnlyProperty<number>;
  public readonly targetLongitudeProperty: TReadOnlyProperty<number>;
  /** Apparent ecliptic longitudes (rad) seen from the observer. */
  public readonly sunApparentLongitudeProperty: TReadOnlyProperty<number>;
  public readonly targetApparentLongitudeProperty: TReadOnlyProperty<number>;
  /** Signed elongation (rad); positive is east of the Sun. */
  public readonly elongationProperty: TReadOnlyProperty<number>;
  /** Time (yr) since the last Zero Counter. */
  public readonly elapsedProperty: TReadOnlyProperty<number>;
  /** The configuration or stationary point the planets are at now (within a fraction of a day), or null. */
  public readonly currentEventProperty: TReadOnlyProperty<ConfigurationEvent | null>;
  /** The next configuration or stationary point. */
  public readonly nextEventProperty: TReadOnlyProperty<TimedEvent | null>;
  /** True while the target moves westward (retrograde) against the stars. */
  public readonly isRetrogradeProperty: TReadOnlyProperty<boolean>;
  /** Length (yr) of the motion-history trail. */
  public readonly trailDurationProperty: TReadOnlyProperty<number>;
  /** The target's apparent path over the trail duration. */
  public readonly trailProperty: TReadOnlyProperty<readonly TrailSample[]>;
  /** True when either planet is the hypothetical one (shows its orbit-radius control). */
  public readonly hasHypotheticalProperty: TReadOnlyProperty<boolean>;

  public constructor() {
    // Choosing the planet already on the other side swaps the two.
    this.observerChoiceProperty.lazyLink((observer, oldObserver) => {
      if (observer === this.targetChoiceProperty.value) {
        this.targetChoiceProperty.value = oldObserver;
      }
      this.clearReferences();
    });
    this.targetChoiceProperty.lazyLink((target, oldTarget) => {
      if (target === this.observerChoiceProperty.value) {
        this.observerChoiceProperty.value = oldTarget;
      }
      this.clearReferences();
    });
    this.hypotheticalAProperty.lazyLink(() => this.clearReferences());

    this.hasHypotheticalProperty = new DerivedProperty(
      [this.observerChoiceProperty, this.targetChoiceProperty],
      (observer, target) => observer === PlanetChoice.HYPOTHETICAL || target === PlanetChoice.HYPOTHETICAL,
    );

    this.pairProperty = new DerivedProperty(
      [this.observerChoiceProperty, this.targetChoiceProperty, this.hypotheticalAProperty],
      (observer, target, hypotheticalA) => SynodicMotionModel.createPair(observer, target, hypotheticalA),
    );

    this.observerLongitudeProperty = new DerivedProperty([this.pairProperty, this.timeProperty], (pair, t) =>
      heliocentricLongitude(pair.aObserver, pair.observerEpochLongitude, t),
    );
    this.targetLongitudeProperty = new DerivedProperty([this.pairProperty, this.timeProperty], (pair, t) =>
      heliocentricLongitude(pair.aTarget, pair.targetEpochLongitude, t),
    );
    this.observerPositionProperty = new DerivedProperty(
      [this.pairProperty, this.observerLongitudeProperty],
      (pair, longitude) => heliocentricPosition(pair.aObserver, longitude),
    );
    this.targetPositionProperty = new DerivedProperty(
      [this.pairProperty, this.targetLongitudeProperty],
      (pair, longitude) => heliocentricPosition(pair.aTarget, longitude),
    );
    this.sunApparentLongitudeProperty = new DerivedProperty([this.observerPositionProperty], (observer) =>
      sunLongitude(observer),
    );
    this.targetApparentLongitudeProperty = new DerivedProperty(
      [this.observerPositionProperty, this.targetPositionProperty],
      (observer, target) => apparentLongitude(observer, target),
    );
    this.elongationProperty = new DerivedProperty(
      [this.observerPositionProperty, this.targetPositionProperty],
      (observer, target) => signedElongation(observer, target),
    );
    this.elapsedProperty = new DerivedProperty([this.timeProperty, this.counterStartProperty], (t, start) => t - start);
    this.currentEventProperty = new DerivedProperty([this.pairProperty, this.timeProperty], (pair, t) =>
      eventAt(pair, t, daysToYears(EVENT_NOW_TOLERANCE_DAYS)),
    );
    this.nextEventProperty = new DerivedProperty([this.pairProperty, this.timeProperty], (pair, t) =>
      nextEvent(pair, t + daysToYears(EVENT_NOW_TOLERANCE_DAYS)),
    );
    this.isRetrogradeProperty = new DerivedProperty(
      [this.pairProperty, this.timeProperty],
      (pair, t) => apparentMotionRate(pair.aObserver, pair.aTarget, heliocentricPhase(pair, t)) < 0,
    );
    this.trailDurationProperty = new DerivedProperty([this.pairProperty], (pair) =>
      Math.min(TRAIL_MAX_YEARS, Math.max(TRAIL_MIN_YEARS, TRAIL_SYNODIC_FRACTION * pairSynodicPeriod(pair))),
    );
    this.trailProperty = new DerivedProperty(
      [this.pairProperty, this.timeProperty, this.trailDurationProperty],
      (pair, t, duration) => SynodicMotionModel.sampleTrail(pair, t, duration),
    );
  }

  /** The planet pair for a choice of observer and target, keeping a hypothetical orbit off the other one. */
  public static createPair(observer: PlanetChoice, target: PlanetChoice, hypotheticalA: number): PlanetPair {
    const separate = (a: number, other: number): number =>
      Math.abs(a - other) >= MIN_ORBIT_SEPARATION ? a : other + (a >= other ? 1 : -1) * MIN_ORBIT_SEPARATION;
    let aObserver = observer.axis(hypotheticalA);
    let aTarget = target.axis(hypotheticalA);
    if (observer === PlanetChoice.HYPOTHETICAL) {
      aObserver = separate(aObserver, aTarget);
    } else if (target === PlanetChoice.HYPOTHETICAL) {
      aTarget = separate(aTarget, aObserver);
    }
    return {
      aObserver,
      aTarget,
      observerEpochLongitude: toRadians(observer.epochLongitudeDegrees),
      targetEpochLongitude: toRadians(target.epochLongitudeDegrees),
    };
  }

  /** The target's apparent longitude over [t − duration, t], oldest first. */
  public static sampleTrail(pair: PlanetPair, t: number, duration: number): TrailSample[] {
    const samples: TrailSample[] = [];
    for (let i = 0; i <= TRAIL_SAMPLES; i++) {
      const age = 1 - i / TRAIL_SAMPLES;
      const ti = t - age * duration;
      const observer = heliocentricPosition(
        pair.aObserver,
        heliocentricLongitude(pair.aObserver, pair.observerEpochLongitude, ti),
      );
      const target = heliocentricPosition(
        pair.aTarget,
        heliocentricLongitude(pair.aTarget, pair.targetEpochLongitude, ti),
      );
      samples.push({
        longitude: apparentLongitude(observer, target),
        age,
        retrograde: apparentMotionRate(pair.aObserver, pair.aTarget, heliocentricPhase(pair, ti)) < 0,
      });
    }
    return samples;
  }

  /** The events "Pause at" should stop at, or null when pausing is off. */
  private pauseFilter(): EventFilter | null {
    const configurations = this.pauseAtConfigurationsProperty.value;
    const stationaryPoints = this.pauseAtStationaryProperty.value;
    return configurations || stationaryPoints ? { configurations, stationaryPoints } : null;
  }

  /**
   * Moves time by `deltaYears`, stopping exactly at the first enabled "Pause at" event
   * crossed on the way (in either direction).
   */
  public advance(deltaYears: number): void {
    const t = this.timeProperty.value;
    const filter = this.pauseFilter();
    if (filter !== null && deltaYears !== 0) {
      const pair = this.pairProperty.value;
      const event = deltaYears > 0 ? nextEvent(pair, t, filter) : previousEvent(pair, t, filter);
      if (event !== null && Math.abs(event.time - t) <= Math.abs(deltaYears) + EVENT_EPSILON_YEARS) {
        this.timeProperty.value = event.time;
        this.isPlayingProperty.value = false;
        this.eventReachedEmitter.emit(event.event);
        return;
      }
    }
    this.timeProperty.value = t + deltaYears;
  }

  public stepForward(): void {
    this.advance(daysToYears(STEP_DAYS));
  }

  public stepBackward(): void {
    this.advance(-daysToYears(STEP_DAYS));
  }

  private periodOf(role: PlanetRole): number {
    const pair = this.pairProperty.value;
    return siderealPeriod(role === "observer" ? pair.aObserver : pair.aTarget);
  }

  private longitudeOf(role: PlanetRole): number {
    return role === "observer" ? this.observerLongitudeProperty.value : this.targetLongitudeProperty.value;
  }

  /**
   * Drags one planet to heliocentric longitude `longitude` (rad). Time moves by the
   * amount that planet needs to get there the short way round, so the other planet moves
   * too. With snapping on, a configuration within a few days captures the drag.
   */
  public dragPlanetTo(role: PlanetRole, longitude: number): void {
    const delta = wrapPi(longitude - this.longitudeOf(role));
    let t = this.timeProperty.value + (delta * this.periodOf(role)) / TWO_PI;
    if (this.snapProperty.value) {
      t = this.snapTime(t);
    }
    this.timeProperty.value = t;
  }

  /** Moves one planet along its orbit by `delta` (rad, counter-clockwise positive), without snapping. */
  public rotatePlanet(role: PlanetRole, delta: number): void {
    this.isPlayingProperty.value = false;
    this.timeProperty.value += (delta * this.periodOf(role)) / TWO_PI;
  }

  /** The time of a configuration within the snap tolerance of t, or t itself. */
  private snapTime(t: number): number {
    const pair = this.pairProperty.value;
    const tolerance = daysToYears(SNAP_TOLERANCE_DAYS);
    const candidates = [nextEvent(pair, t, ALL_EVENTS), previousEvent(pair, t, ALL_EVENTS)];
    let best = t;
    let bestDistance = tolerance;
    for (const candidate of candidates) {
      if (candidate !== null && !candidate.event.isStationaryPoint && Math.abs(candidate.time - t) < bestDistance) {
        best = candidate.time;
        bestDistance = Math.abs(candidate.time - t);
      }
    }
    return best;
  }

  /** Jumps to the next configuration or stationary point. */
  public jumpToNextEvent(): void {
    this.jump(nextEvent(this.pairProperty.value, this.timeProperty.value));
  }

  /** Jumps to the previous configuration or stationary point. */
  public jumpToPreviousEvent(): void {
    this.jump(previousEvent(this.pairProperty.value, this.timeProperty.value));
  }

  private jump(event: TimedEvent | null): void {
    this.isPlayingProperty.value = false;
    if (event !== null) {
      this.timeProperty.value = event.time;
    }
  }

  /** Restarts the counter and drops reference ticks at the current Sun and target longitudes. */
  public zeroCounter(): void {
    this.counterStartProperty.value = this.timeProperty.value;
    this.referenceSunLongitudeProperty.value = this.sunApparentLongitudeProperty.value;
    this.referenceTargetLongitudeProperty.value = this.targetApparentLongitudeProperty.value;
  }

  private clearReferences(): void {
    this.referenceSunLongitudeProperty.value = null;
    this.referenceTargetLongitudeProperty.value = null;
  }

  /** Animation rate in days of model time per second of real time. */
  public daysPerSecond(): number {
    const speed = this.timeSpeedProperty.value;
    if (speed === TimeSpeed.SLOW) {
      return DAYS_PER_SECOND.slow;
    }
    return speed === TimeSpeed.FAST ? DAYS_PER_SECOND.fast : DAYS_PER_SECOND.normal;
  }

  public reset(): void {
    this.isPlayingProperty.reset();
    this.observerChoiceProperty.reset();
    this.targetChoiceProperty.reset();
    this.hypotheticalAProperty.reset();
    this.timeProperty.reset();
    this.counterStartProperty.reset();
    this.timeSpeedProperty.reset();
    this.pauseAtConfigurationsProperty.reset();
    this.pauseAtStationaryProperty.reset();
    this.snapProperty.reset();
    this.showSightLinesProperty.reset();
    this.showElongationArcProperty.reset();
    this.showLabelsProperty.reset();
    this.clearReferences();
  }

  public step(dt: number): void {
    if (this.isPlayingProperty.value) {
      this.advance((dt * this.daysPerSecond()) / DAYS_PER_YEAR);
    }
  }
}

PlanetaryConfigurationsNamespace.register("SynodicMotionModel", SynodicMotionModel);
