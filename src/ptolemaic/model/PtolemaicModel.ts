/**
 * PtolemaicModel.ts
 *
 * Ptolemy's geocentric model, the background to the handout. Earth sits at the centre.
 * The planet rides a small circle (the epicycle) whose centre moves around a larger,
 * off-centre circle (the deferent). Its motion is uniform as seen from the equant, a
 * point opposite Earth across the deferent's centre.
 *
 * Superior planet: the epicycle centre moves around the deferent at the planet's mean
 * motion, and the planet's position on the epicycle stays parallel to the Earth–Sun
 * line. Inferior planet: the epicycle centre stays on the Earth–Sun line, and the planet
 * moves around the epicycle at its mean motion. Either way the planet loops backward
 * (retrograde) when it is on the near side of its epicycle.
 *
 * Geometry ported from the SolarSystemModels sim (NAAP Flash `ptolemaic.swf`):
 * `computeDeferentCenter` and `computeEpicycleCenter` are unchanged. Unlike that port,
 * all state here is derived from one time Property, so the planet's path can be
 * resampled at any moment.
 */

import {
  BooleanProperty,
  DerivedProperty,
  EnumerationProperty,
  NumberProperty,
  type TReadOnlyProperty,
} from "scenerystack/axon";
import { Vector2 } from "scenerystack/dot";
import type { TModel } from "scenerystack/joist";
import { Enumeration, EnumerationValue } from "scenerystack/phet-core";
import { TimeSpeed } from "scenerystack/scenery-phet";
import { mod2pi, toRadians, wrapPi } from "../../common/model/orbitalMath.js";
import type { PlanetKey } from "../../common/model/PlanetChoice.js";
import { PlanetType } from "../../common/model/PlanetType.js";
import type { TrailSample } from "../../common/model/TrailSample.js";
import {
  APOGEE_ANGLE_RANGE,
  ECCENTRICITY_RANGE,
  EPICYCLE_SIZE_RANGE,
  MOTION_RATE_RANGE,
  PTOLEMAIC_DEFERENT_RADIUS,
  PTOLEMAIC_SUN_ORBIT_RADIUS,
  PTOLEMAIC_SUN_RATE_DEGREES_PER_DAY,
  TRAIL_SAMPLES,
} from "../../PlanetaryConfigurationsConstants.js";
import PlanetaryConfigurationsNamespace from "../../PlanetaryConfigurationsNamespace.js";

/** Animation rates (days of model time per second) for the slow / normal / fast speeds. */
const PTOLEMAIC_DAYS_PER_SECOND = { slow: 20, normal: 60, fast: 180 } as const;

/** The Sun's ecliptic longitude (degrees) at t = 0. */
const SUN_EPOCH_DEGREES = 280;

/** Days stepped by one press of the step buttons. */
const STEP_DAYS = 2;

/** Length (days) of the drawn path and motion-history trail. */
const PATH_DAYS = 900;

/** Ptolemy's parameters for one planet (values from the NAAP simulator). */
export class PtolemaicPreset extends EnumerationValue {
  public static readonly VENUS = new PtolemaicPreset("venus", 0.719444, 0.020833, 46.167, 1.6021, PlanetType.INFERIOR);
  public static readonly MARS = new PtolemaicPreset("mars", 0.658333, 0.1, 106.667, 0.52406, PlanetType.SUPERIOR);
  public static readonly JUPITER = new PtolemaicPreset(
    "jupiter",
    0.191667,
    0.045833,
    152.15,
    0.0831224,
    PlanetType.SUPERIOR,
  );
  public static readonly SATURN = new PtolemaicPreset(
    "saturn",
    0.108333,
    0.056944,
    224.167,
    0.0334883,
    PlanetType.SUPERIOR,
  );
  /** Whatever the sliders say: selected automatically when a slider moves off a preset. */
  public static readonly CUSTOM = new PtolemaicPreset("custom", 0, 0, 0, 0, PlanetType.SUPERIOR);

  public static readonly enumeration = new Enumeration(PtolemaicPreset);

  public readonly key: "venus" | "mars" | "jupiter" | "saturn" | "custom";
  /** The planet whose name and color this preset uses; the hypothetical planet's for Custom. */
  public readonly planetKey: PlanetKey;
  /** Epicycle radius in deferent radii. */
  public readonly epicycleSize: number;
  /** Distance from Earth to the deferent centre, in deferent radii. */
  public readonly eccentricity: number;
  /** Direction of the deferent centre (and equant) from Earth, degrees. */
  public readonly apogeeAngle: number;
  /** Mean motion, degrees per day. */
  public readonly motionRate: number;
  public readonly planetType: PlanetType;

  public constructor(
    key: PtolemaicPreset["key"],
    epicycleSize: number,
    eccentricity: number,
    apogeeAngle: number,
    motionRate: number,
    planetType: PlanetType,
  ) {
    super();
    this.key = key;
    this.planetKey = key === "custom" ? "hypothetical" : key;
    this.epicycleSize = epicycleSize;
    this.eccentricity = eccentricity;
    this.apogeeAngle = apogeeAngle;
    this.motionRate = motionRate;
    this.planetType = planetType;
  }
}

/** Instantaneous geometry of the construction, in deferent units with Earth at the origin. */
export type PtolemaicGeometry = {
  readonly deferentCenter: Vector2;
  readonly equant: Vector2;
  readonly epicycleCenter: Vector2;
  readonly planet: Vector2;
  readonly sun: Vector2;
};

type Parameters = {
  readonly epicycleSize: number;
  readonly eccentricity: number;
  readonly apogeeAngle: number;
  readonly motionRate: number;
  readonly planetType: PlanetType;
};

export class PtolemaicModel implements TModel {
  public readonly presetProperty = new EnumerationProperty(PtolemaicPreset.MARS);
  public readonly epicycleSizeProperty = new NumberProperty(PtolemaicPreset.MARS.epicycleSize, {
    range: EPICYCLE_SIZE_RANGE,
  });
  public readonly eccentricityProperty = new NumberProperty(PtolemaicPreset.MARS.eccentricity, {
    range: ECCENTRICITY_RANGE,
  });
  public readonly apogeeAngleProperty = new NumberProperty(PtolemaicPreset.MARS.apogeeAngle, {
    range: APOGEE_ANGLE_RANGE,
  });
  public readonly motionRateProperty = new NumberProperty(PtolemaicPreset.MARS.motionRate, {
    range: MOTION_RATE_RANGE,
  });
  public readonly planetTypeProperty = new EnumerationProperty(PtolemaicPreset.MARS.planetType);

  /** Model time (days). */
  public readonly timeProperty = new NumberProperty(0);
  public readonly isPlayingProperty = new BooleanProperty(false);
  public readonly timeSpeedProperty = new EnumerationProperty(TimeSpeed.NORMAL);

  public readonly showDeferentProperty = new BooleanProperty(true);
  public readonly showEpicycleProperty = new BooleanProperty(true);
  public readonly showEquantProperty = new BooleanProperty(true);
  public readonly showPathProperty = new BooleanProperty(true);
  public readonly showSunLineProperty = new BooleanProperty(true);
  public readonly showPlanetLineProperty = new BooleanProperty(true);

  public readonly geometryProperty: TReadOnlyProperty<PtolemaicGeometry>;
  /** The planet's ecliptic longitude seen from Earth (rad). */
  public readonly planetLongitudeProperty: TReadOnlyProperty<number>;
  public readonly sunLongitudeProperty: TReadOnlyProperty<number>;
  public readonly isRetrogradeProperty: TReadOnlyProperty<boolean>;
  /** The planet's recent path in the Earth-centred frame (deferent units), oldest first. */
  public readonly pathProperty: TReadOnlyProperty<readonly Vector2[]>;
  /** The planet's recent apparent longitude, for the zodiac strip's history lane. */
  public readonly trailProperty: TReadOnlyProperty<readonly TrailSample[]>;
  /** Length of the path and trail (yr). */
  public readonly pathYears = PATH_DAYS / 365.25;

  private applyingPreset = false;

  public constructor() {
    const parameterProperties = [
      this.epicycleSizeProperty,
      this.eccentricityProperty,
      this.apogeeAngleProperty,
      this.motionRateProperty,
      this.planetTypeProperty,
    ] as const;

    // Choosing a preset loads its parameters; moving a parameter switches to Custom.
    this.presetProperty.lazyLink((preset) => {
      if (preset !== PtolemaicPreset.CUSTOM) {
        this.applyPreset(preset);
      }
    });
    for (const property of parameterProperties) {
      property.lazyLink(() => {
        if (!this.applyingPreset) {
          this.presetProperty.value = PtolemaicPreset.CUSTOM;
        }
      });
    }

    const parametersProperty = new DerivedProperty(
      parameterProperties,
      (epicycleSize, eccentricity, apogeeAngle, motionRate, planetType): Parameters => ({
        epicycleSize,
        eccentricity,
        apogeeAngle,
        motionRate,
        planetType,
      }),
    );

    this.geometryProperty = new DerivedProperty([parametersProperty, this.timeProperty], (parameters, t) =>
      PtolemaicModel.geometryAt(parameters, t),
    );
    this.planetLongitudeProperty = new DerivedProperty([this.geometryProperty], (g) =>
      mod2pi(Math.atan2(g.planet.y, g.planet.x)),
    );
    this.sunLongitudeProperty = new DerivedProperty([this.geometryProperty], (g) =>
      mod2pi(Math.atan2(g.sun.y, g.sun.x)),
    );
    this.isRetrogradeProperty = new DerivedProperty([parametersProperty, this.timeProperty], (parameters, t) =>
      PtolemaicModel.isRetrogradeAt(parameters, t),
    );
    this.pathProperty = new DerivedProperty([parametersProperty, this.timeProperty], (parameters, t) => {
      const points: Vector2[] = [];
      for (let i = 0; i <= TRAIL_SAMPLES; i++) {
        points.push(PtolemaicModel.geometryAt(parameters, t - PATH_DAYS * (1 - i / TRAIL_SAMPLES)).planet);
      }
      return points;
    });
    this.trailProperty = new DerivedProperty(
      [parametersProperty, this.pathProperty, this.timeProperty],
      (parameters, path, t) =>
        path.map((point, i) => {
          const age = 1 - i / TRAIL_SAMPLES;
          return {
            longitude: mod2pi(Math.atan2(point.y, point.x)),
            age,
            retrograde: PtolemaicModel.isRetrogradeAt(parameters, t - PATH_DAYS * age),
          };
        }),
    );
  }

  /** Centre of the deferent: offset from Earth by the eccentricity toward the apogee. */
  public static computeDeferentCenter(eccentricity: number, apogeeDegrees: number): Vector2 {
    const apogee = toRadians(apogeeDegrees);
    return new Vector2(eccentricity * Math.cos(apogee), eccentricity * Math.sin(apogee));
  }

  /**
   * Centre of the epicycle on the deferent, placed so that its motion is uniform as seen
   * from the equant (at twice the deferent-centre offset). `drive` is the mean angle.
   */
  public static computeEpicycleCenter(eccentricity: number, apogeeDegrees: number, drive: number): Vector2 {
    const apogee = toRadians(apogeeDegrees);
    const deferentCenter = PtolemaicModel.computeDeferentCenter(eccentricity, apogeeDegrees);
    const phi = drive - apogee;
    const sine = Math.max(-1, Math.min(1, (eccentricity / PTOLEMAIC_DEFERENT_RADIUS) * Math.sin(Math.PI - phi)));
    const theta = apogee + phi - Math.asin(sine);
    return deferentCenter.plusXY(
      PTOLEMAIC_DEFERENT_RADIUS * Math.cos(theta),
      PTOLEMAIC_DEFERENT_RADIUS * Math.sin(theta),
    );
  }

  /** Mean angles (rad) at time t (days): the Sun's, and the planet's own mean motion. */
  private static anglesAt(parameters: Parameters, t: number): { sun: number; anomaly: number } {
    return {
      sun: toRadians(SUN_EPOCH_DEGREES + PTOLEMAIC_SUN_RATE_DEGREES_PER_DAY * t),
      anomaly: toRadians(parameters.motionRate * t),
    };
  }

  public static geometryAt(parameters: Parameters, t: number): PtolemaicGeometry {
    const { sun, anomaly } = PtolemaicModel.anglesAt(parameters, t);
    const superior = parameters.planetType === PlanetType.SUPERIOR;
    // Superior: deferent follows the planet's mean motion, epicycle follows the Sun. Inferior: the reverse.
    const deferentDrive = superior ? anomaly : sun;
    const epicycleDrive = superior ? sun : anomaly;
    const deferentCenter = PtolemaicModel.computeDeferentCenter(parameters.eccentricity, parameters.apogeeAngle);
    const epicycleCenter = PtolemaicModel.computeEpicycleCenter(
      parameters.eccentricity,
      parameters.apogeeAngle,
      deferentDrive,
    );
    return {
      deferentCenter,
      equant: deferentCenter.timesScalar(2),
      epicycleCenter,
      planet: epicycleCenter.plusXY(
        parameters.epicycleSize * Math.cos(epicycleDrive),
        parameters.epicycleSize * Math.sin(epicycleDrive),
      ),
      sun: new Vector2(PTOLEMAIC_SUN_ORBIT_RADIUS * Math.cos(sun), PTOLEMAIC_SUN_ORBIT_RADIUS * Math.sin(sun)),
    };
  }

  /** True when the planet's ecliptic longitude is decreasing at time t (days). */
  public static isRetrogradeAt(parameters: Parameters, t: number): boolean {
    const h = 0.25;
    const before = PtolemaicModel.geometryAt(parameters, t - h).planet;
    const after = PtolemaicModel.geometryAt(parameters, t + h).planet;
    return wrapPi(Math.atan2(after.y, after.x) - Math.atan2(before.y, before.x)) < 0;
  }

  private applyPreset(preset: PtolemaicPreset): void {
    this.applyingPreset = true;
    this.epicycleSizeProperty.value = preset.epicycleSize;
    this.eccentricityProperty.value = preset.eccentricity;
    this.apogeeAngleProperty.value = preset.apogeeAngle;
    this.motionRateProperty.value = preset.motionRate;
    this.planetTypeProperty.value = preset.planetType;
    this.applyingPreset = false;
  }

  public daysPerSecond(): number {
    const speed = this.timeSpeedProperty.value;
    if (speed === TimeSpeed.SLOW) {
      return PTOLEMAIC_DAYS_PER_SECOND.slow;
    }
    return speed === TimeSpeed.FAST ? PTOLEMAIC_DAYS_PER_SECOND.fast : PTOLEMAIC_DAYS_PER_SECOND.normal;
  }

  public stepForward(): void {
    this.timeProperty.value += STEP_DAYS;
  }

  public stepBackward(): void {
    this.timeProperty.value -= STEP_DAYS;
  }

  public resetTime(): void {
    this.isPlayingProperty.value = false;
    this.timeProperty.reset();
  }

  public reset(): void {
    this.isPlayingProperty.reset();
    this.timeSpeedProperty.reset();
    this.timeProperty.reset();
    this.presetProperty.reset();
    this.applyPreset(PtolemaicPreset.MARS);
    this.showDeferentProperty.reset();
    this.showEpicycleProperty.reset();
    this.showEquantProperty.reset();
    this.showPathProperty.reset();
    this.showSunLineProperty.reset();
    this.showPlanetLineProperty.reset();
  }

  public step(dt: number): void {
    if (this.isPlayingProperty.value) {
      this.timeProperty.value += dt * this.daysPerSecond();
    }
  }
}

PlanetaryConfigurationsNamespace.register("PtolemaicModel", PtolemaicModel);
