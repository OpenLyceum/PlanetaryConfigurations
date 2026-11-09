/**
 * PeriodsModel.ts
 *
 * Handout Q13 (and the trends asked in Q6, Q10, Q11): convert between a planet's synodic
 * period S, measured from Earth, and its sidereal period P:
 *
 *   inferior planet   1/S = 1/P − 1/E
 *   superior planet   1/S = 1/E − 1/P        (E = 1 yr, Earth's sidereal period)
 *
 * A hypothetical planet on the chart shows how S depends on distance from the Sun:
 * it grows without bound near Earth's orbit and approaches one year far from it.
 */

import {
  BooleanProperty,
  DerivedProperty,
  EnumerationProperty,
  NumberProperty,
  type TReadOnlyProperty,
} from "scenerystack/axon";
import { Range } from "scenerystack/dot";
import type { TModel } from "scenerystack/joist";
import { Enumeration, EnumerationValue } from "scenerystack/phet-core";
import {
  semimajorAxis,
  siderealFromSynodic,
  siderealPeriod,
  synodicFromSidereal,
  synodicPeriod,
} from "../../common/model/orbitalMath.js";
import { PlanetType } from "../../common/model/PlanetType.js";
import { DAYS_PER_YEAR } from "../../PlanetaryConfigurationsConstants.js";
import PlanetaryConfigurationsNamespace from "../../PlanetaryConfigurationsNamespace.js";

/** Which period the calculator computes. */
export class SolveFor extends EnumerationValue {
  /** Enter the synodic period S, compute the sidereal period P (Copernicus's problem). */
  public static readonly SIDEREAL = new SolveFor();
  /** Enter the sidereal period P, compute the synodic period S. */
  public static readonly SYNODIC = new SolveFor();

  public static readonly enumeration = new Enumeration(SolveFor);
}

/** Units of the calculator's input and result. */
export class TimeUnit extends EnumerationValue {
  public static readonly YEARS = new TimeUnit(1);
  public static readonly DAYS = new TimeUnit(DAYS_PER_YEAR);

  public static readonly enumeration = new Enumeration(TimeUnit);

  /** How many of this unit make one year. */
  public readonly perYear: number;

  public constructor(perYear: number) {
    super();
    this.perYear = perYear;
  }
}

/** The calculator accepts periods up to this many years. */
const MAX_PERIOD_YEARS = 200;

/** Chart range of the hypothetical planet's distance (AU), stored as log10. */
export const MARKER_LOG_A_RANGE = new Range(Math.log10(0.2), Math.log10(30));

/** Where a calculator result sits on the chart: distance (AU) and synodic period (yr). */
export type ChartPoint = { readonly a: number; readonly synodic: number };

export class PeriodsModel implements TModel {
  public readonly planetTypeProperty = new EnumerationProperty(PlanetType.SUPERIOR);
  public readonly solveForProperty = new EnumerationProperty(SolveFor.SIDEREAL);
  public readonly unitProperty = new EnumerationProperty(TimeUnit.YEARS);

  /** The value typed into the calculator, in `unitProperty` units. Defaults to the handout's Jupiter example. */
  public readonly inputProperty = new NumberProperty(1.09);

  /** log10 of the hypothetical planet's distance (AU). */
  public readonly markerLogAProperty = new NumberProperty(Math.log10(2.5), { range: MARKER_LOG_A_RANGE });
  public readonly showSiderealProperty = new BooleanProperty(true);

  /** The input converted to years. */
  public readonly inputYearsProperty: TReadOnlyProperty<number>;
  /** The computed period in years, or null if no planet of the chosen type has that period. */
  public readonly resultYearsProperty: TReadOnlyProperty<number | null>;
  /** The calculator's planet on the chart, or null without a solution. */
  public readonly calculatorPointProperty: TReadOnlyProperty<ChartPoint | null>;

  public readonly markerAProperty: TReadOnlyProperty<number>;
  public readonly markerSiderealProperty: TReadOnlyProperty<number>;
  public readonly markerSynodicProperty: TReadOnlyProperty<number>;

  public constructor() {
    // Switching units converts the entered value so it still means the same period.
    this.unitProperty.lazyLink((unit, oldUnit) => {
      this.inputProperty.value = (this.inputProperty.value / oldUnit.perYear) * unit.perYear;
    });

    this.inputYearsProperty = new DerivedProperty(
      [this.inputProperty, this.unitProperty],
      (value, unit) => value / unit.perYear,
    );
    this.resultYearsProperty = new DerivedProperty(
      [this.inputYearsProperty, this.planetTypeProperty, this.solveForProperty],
      (input, type, solveFor) => {
        const inferior = type === PlanetType.INFERIOR;
        return solveFor === SolveFor.SIDEREAL
          ? siderealFromSynodic(input, inferior)
          : synodicFromSidereal(input, inferior);
      },
    );
    this.calculatorPointProperty = new DerivedProperty(
      [this.inputYearsProperty, this.resultYearsProperty, this.solveForProperty],
      (input, result, solveFor) => {
        if (result === null) {
          return null;
        }
        const sidereal = solveFor === SolveFor.SIDEREAL ? result : input;
        const synodic = solveFor === SolveFor.SIDEREAL ? input : result;
        return { a: semimajorAxis(sidereal), synodic };
      },
    );

    this.markerAProperty = new DerivedProperty([this.markerLogAProperty], (logA) => 10 ** logA);
    this.markerSiderealProperty = new DerivedProperty([this.markerAProperty], (a) => siderealPeriod(a));
    this.markerSynodicProperty = new DerivedProperty([this.markerSiderealProperty], (p) => synodicPeriod(1, p));
  }

  /** Valid input range in the current unit. */
  public inputRange(): Range {
    const perYear = this.unitProperty.value.perYear;
    return new Range(0.01 * perYear, MAX_PERIOD_YEARS * perYear);
  }

  public reset(): void {
    this.planetTypeProperty.reset();
    this.solveForProperty.reset();
    // Reset the unit before the input so the unit listener cannot rescale the default.
    this.unitProperty.reset();
    this.inputProperty.reset();
    this.markerLogAProperty.reset();
    this.showSiderealProperty.reset();
  }

  public step(_dt: number): void {
    // Nothing moves on its own on this screen.
  }
}

PlanetaryConfigurationsNamespace.register("PeriodsModel", PeriodsModel);
