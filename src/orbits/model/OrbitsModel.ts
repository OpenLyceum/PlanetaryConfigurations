/**
 * OrbitsModel.ts
 *
 * Handout Q1: the Copernican solar system in motion. Mercury through Saturn orbit the
 * Sun on circular orbits obeying P = a^1.5, so a student can see that planets farther
 * from the Sun move more slowly, both in angle and in speed (v ∝ 1/√a).
 */

import { BooleanProperty, EnumerationProperty, NumberProperty } from "scenerystack/axon";
import type { Vector2 } from "scenerystack/dot";
import type { TModel } from "scenerystack/joist";
import { Enumeration, EnumerationValue } from "scenerystack/phet-core";
import { TimeSpeed } from "scenerystack/scenery-phet";
import { heliocentricLongitude, heliocentricPosition, toRadians } from "../../common/model/orbitalMath.js";
import type { PlanetChoice } from "../../common/model/PlanetChoice.js";
import { DAYS_PER_YEAR } from "../../PlanetaryConfigurationsConstants.js";
import PlanetaryConfigurationsNamespace from "../../PlanetaryConfigurationsNamespace.js";

/** Animation rates (days of model time per second) for the slow / normal / fast speeds. */
const ORBITS_DAYS_PER_SECOND = { slow: 15, normal: 60, fast: 240 } as const;

/** Which planets the view frames: just the inner four, or all six. */
export class OrbitScale extends EnumerationValue {
  public static readonly INNER = new OrbitScale(1.7);
  public static readonly ALL = new OrbitScale(10.2);

  public static readonly enumeration = new Enumeration(OrbitScale);

  /** Radius (AU) that fits the view at this scale. */
  public readonly radius: number;

  public constructor(radius: number) {
    super();
    this.radius = radius;
  }
}

export class OrbitsModel implements TModel {
  /** Model time (yr since J2000). */
  public readonly timeProperty = new NumberProperty(0);
  public readonly isPlayingProperty = new BooleanProperty(true);
  public readonly timeSpeedProperty = new EnumerationProperty(TimeSpeed.NORMAL);
  public readonly scaleProperty = new EnumerationProperty(OrbitScale.INNER);
  public readonly showSpeedArrowsProperty = new BooleanProperty(true);
  public readonly showLabelsProperty = new BooleanProperty(true);

  /** Heliocentric position (AU) of a real planet at the current time. */
  public positionOf(planet: PlanetChoice): Vector2 {
    const a = planet.axis(1);
    return heliocentricPosition(
      a,
      heliocentricLongitude(a, toRadians(planet.epochLongitudeDegrees), this.timeProperty.value),
    );
  }

  public daysPerSecond(): number {
    const speed = this.timeSpeedProperty.value;
    if (speed === TimeSpeed.SLOW) {
      return ORBITS_DAYS_PER_SECOND.slow;
    }
    return speed === TimeSpeed.FAST ? ORBITS_DAYS_PER_SECOND.fast : ORBITS_DAYS_PER_SECOND.normal;
  }

  /** Advances time by `days` (negative goes back). */
  public advanceDays(days: number): void {
    this.timeProperty.value += days / DAYS_PER_YEAR;
  }

  public reset(): void {
    this.timeProperty.reset();
    this.isPlayingProperty.reset();
    this.timeSpeedProperty.reset();
    this.scaleProperty.reset();
    this.showSpeedArrowsProperty.reset();
    this.showLabelsProperty.reset();
  }

  public step(dt: number): void {
    if (this.isPlayingProperty.value) {
      this.advanceDays(dt * this.daysPerSecond());
    }
  }
}

PlanetaryConfigurationsNamespace.register("OrbitsModel", OrbitsModel);
