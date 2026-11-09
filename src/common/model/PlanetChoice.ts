/**
 * PlanetChoice.ts
 *
 * The planets a student can pick: Mercury through Saturn on circular orbits with the
 * handout's semimajor axes, plus one hypothetical planet whose orbit the student sets.
 *
 * Each planet starts at its J2000 mean heliocentric longitude, so t = 0 is roughly
 * 1 January 2000 and the zodiac positions look familiar (the Sun in Sagittarius /
 * Capricorn as seen from Earth).
 */

import { Enumeration, EnumerationValue } from "scenerystack/phet-core";
import PlanetaryConfigurationsNamespace from "../../PlanetaryConfigurationsNamespace.js";

export type PlanetKey = "mercury" | "venus" | "earth" | "mars" | "jupiter" | "saturn" | "hypothetical";

export class PlanetChoice extends EnumerationValue {
  public static readonly MERCURY = new PlanetChoice("mercury", 0.387, 252.25);
  public static readonly VENUS = new PlanetChoice("venus", 0.723, 181.98);
  public static readonly EARTH = new PlanetChoice("earth", 1, 100.46);
  public static readonly MARS = new PlanetChoice("mars", 1.524, 355.45);
  public static readonly JUPITER = new PlanetChoice("jupiter", 5.203, 34.4);
  public static readonly SATURN = new PlanetChoice("saturn", 9.537, 49.94);
  /** A planet whose semimajor axis the student chooses (Q7: "create a hypothetical 3rd inferior planet"). */
  public static readonly HYPOTHETICAL = new PlanetChoice("hypothetical", null, 300);

  public static readonly enumeration = new Enumeration(PlanetChoice);

  /** The six real planets, innermost first. */
  public static readonly REAL_PLANETS: readonly PlanetChoice[] = [
    PlanetChoice.MERCURY,
    PlanetChoice.VENUS,
    PlanetChoice.EARTH,
    PlanetChoice.MARS,
    PlanetChoice.JUPITER,
    PlanetChoice.SATURN,
  ];

  /** Key into the planet-name strings and planet colors. */
  public readonly key: PlanetKey;

  /** Semimajor axis (AU), or null for the hypothetical planet (its axis is a model Property). */
  public readonly semimajorAxis: number | null;

  /** Heliocentric longitude (degrees) at t = 0. */
  public readonly epochLongitudeDegrees: number;

  public constructor(key: PlanetKey, semimajorAxis: number | null, epochLongitudeDegrees: number) {
    super();
    this.key = key;
    this.semimajorAxis = semimajorAxis;
    this.epochLongitudeDegrees = epochLongitudeDegrees;
  }

  /** Semimajor axis (AU), using `hypotheticalA` for the hypothetical planet. */
  public axis(hypotheticalA: number): number {
    return this.semimajorAxis ?? hypotheticalA;
  }
}

PlanetaryConfigurationsNamespace.register("PlanetChoice", PlanetChoice);
