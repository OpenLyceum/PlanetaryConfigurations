/**
 * ConfigurationsModel.ts
 *
 * Handout Q2–Q3: name the configurations of a hypothetical superior or inferior planet.
 *
 * The Sun is at the origin and Earth is held fixed directly below it (heliocentric
 * longitude −90°), so "up" from Earth is toward the Sun and east on Earth's sky is to the
 * left. The student moves one planet around its circular orbit; the model reports its
 * signed elongation and the configuration it is in. No time passes on this screen.
 */

import {
  BooleanProperty,
  DerivedProperty,
  EnumerationProperty,
  NumberProperty,
  type TReadOnlyProperty,
} from "scenerystack/axon";
import { Range, type Vector2 } from "scenerystack/dot";
import type { TModel } from "scenerystack/joist";
import type { ConfigurationEvent } from "../../common/model/ConfigurationEvent.js";
import { heliocentricPosition, mod2pi, signedElongation, toRadians, wrapPi } from "../../common/model/orbitalMath.js";
import { PlanetType } from "../../common/model/PlanetType.js";
import { eventNearPhase, eventPhases, monotonicPhaseFromHeliocentric } from "../../common/model/synodicEvents.js";
import PlanetaryConfigurationsNamespace from "../../PlanetaryConfigurationsNamespace.js";

/** Earth's fixed heliocentric longitude: directly below the Sun on screen. */
export const EARTH_LONGITUDE = -Math.PI / 2;

/** Orbit-radius ranges (AU) and defaults for each kind of hypothetical planet. */
export const SUPERIOR_A_RANGE = new Range(1.2, 4);
export const INFERIOR_A_RANGE = new Range(0.2, 0.9);
const SUPERIOR_A_DEFAULT = 2;
const INFERIOR_A_DEFAULT = 0.6;

/** The planet starts here (heliocentric longitude, rad): no named configuration. */
const INITIAL_LONGITUDE = toRadians(20);

/** A drag ends on a configuration within this angle (rad, in heliocentric phase). */
const SNAP_ANGLE = toRadians(4);

/** The planet "is at" a configuration within this angle (rad, in heliocentric phase). */
const AT_EVENT_ANGLE = toRadians(0.6);

/** Where a named configuration lies on the current planet's orbit. */
export type ConfigurationPosition = { readonly event: ConfigurationEvent; readonly position: Vector2 };

const CONFIGURATIONS_ONLY = { configurations: true, stationaryPoints: false } as const;

export class ConfigurationsModel implements TModel {
  public readonly planetTypeProperty = new EnumerationProperty(PlanetType.SUPERIOR);
  public readonly superiorAProperty = new NumberProperty(SUPERIOR_A_DEFAULT, { range: SUPERIOR_A_RANGE });
  public readonly inferiorAProperty = new NumberProperty(INFERIOR_A_DEFAULT, { range: INFERIOR_A_RANGE });

  /** The planet's heliocentric longitude (rad). */
  public readonly planetLongitudeProperty = new NumberProperty(INITIAL_LONGITUDE);

  public readonly snapProperty = new BooleanProperty(true);
  public readonly showSightLinesProperty = new BooleanProperty(true);
  public readonly showElongationArcProperty = new BooleanProperty(true);
  public readonly showSidesProperty = new BooleanProperty(true);
  public readonly showConfigurationPositionsProperty = new BooleanProperty(false);
  public readonly showLabelsProperty = new BooleanProperty(true);

  public readonly earthPosition: Vector2 = heliocentricPosition(1, EARTH_LONGITUDE);

  /** Semimajor axis (AU) of the planet of the current type. */
  public readonly aProperty: TReadOnlyProperty<number>;
  public readonly planetPositionProperty: TReadOnlyProperty<Vector2>;
  /** Signed elongation (rad), positive east of the Sun. */
  public readonly elongationProperty: TReadOnlyProperty<number>;
  /** The named configuration the planet is in, or null between configurations. */
  public readonly configurationProperty: TReadOnlyProperty<ConfigurationEvent | null>;
  /** Where each named configuration lies on the current orbit. */
  public readonly configurationPositionsProperty: TReadOnlyProperty<readonly ConfigurationPosition[]>;

  public constructor() {
    this.aProperty = new DerivedProperty(
      [this.planetTypeProperty, this.superiorAProperty, this.inferiorAProperty],
      (type, superiorA, inferiorA) => (type === PlanetType.SUPERIOR ? superiorA : inferiorA),
    );
    this.planetPositionProperty = new DerivedProperty([this.aProperty, this.planetLongitudeProperty], (a, longitude) =>
      heliocentricPosition(a, longitude),
    );
    this.elongationProperty = new DerivedProperty([this.planetPositionProperty], (planet) =>
      signedElongation(this.earthPosition, planet),
    );
    this.configurationProperty = new DerivedProperty([this.aProperty, this.planetLongitudeProperty], (a, longitude) =>
      eventNearPhase(1, a, this.phaseOf(a, longitude), AT_EVENT_ANGLE, CONFIGURATIONS_ONLY),
    );
    this.configurationPositionsProperty = new DerivedProperty([this.aProperty], (a) =>
      eventPhases(1, a)
        .filter(({ event }) => !event.isStationaryPoint)
        .map(({ event, phase }) => ({ event, position: heliocentricPosition(a, this.longitudeForPhase(a, phase)) })),
    );
  }

  /** Monotonic phase u of a planet at heliocentric longitude `longitude` (see synodicEvents.ts). */
  private phaseOf(a: number, longitude: number): number {
    return monotonicPhaseFromHeliocentric(1, a, longitude - EARTH_LONGITUDE);
  }

  /** Heliocentric longitude at which a planet of orbit a has monotonic phase u. */
  private longitudeForPhase(a: number, u: number): number {
    const phi = a < 1 ? u : -u;
    return mod2pi(EARTH_LONGITUDE + phi);
  }

  /** Moves the planet to `longitude` (rad), snapping to a nearby configuration when snapping is on. */
  public setPlanetLongitude(longitude: number): void {
    let target = mod2pi(longitude);
    if (this.snapProperty.value) {
      const a = this.aProperty.value;
      const u = this.phaseOf(a, target);
      for (const { event, phase } of eventPhases(1, a)) {
        if (!event.isStationaryPoint && Math.abs(wrapPi(phase - u)) < SNAP_ANGLE) {
          target = this.longitudeForPhase(a, phase);
          break;
        }
      }
    }
    this.planetLongitudeProperty.value = target;
  }

  /** Moves the planet along its orbit by `delta` (rad), without snapping. */
  public rotatePlanet(delta: number): void {
    this.planetLongitudeProperty.value = mod2pi(this.planetLongitudeProperty.value + delta);
  }

  public reset(): void {
    this.planetTypeProperty.reset();
    this.superiorAProperty.reset();
    this.inferiorAProperty.reset();
    this.planetLongitudeProperty.reset();
    this.snapProperty.reset();
    this.showSightLinesProperty.reset();
    this.showElongationArcProperty.reset();
    this.showSidesProperty.reset();
    this.showConfigurationPositionsProperty.reset();
    this.showLabelsProperty.reset();
  }

  public step(_dt: number): void {
    // Nothing moves on its own on this screen.
  }
}

PlanetaryConfigurationsNamespace.register("ConfigurationsModel", ConfigurationsModel);
