/**
 * PlanetType.ts
 *
 * Whether a planet orbits inside the observer's orbit (inferior) or outside it
 * (superior). The two kinds go through different configurations and use different
 * synodic-period formulas.
 */

import { Enumeration, EnumerationValue } from "scenerystack/phet-core";
import PlanetaryConfigurationsNamespace from "../../PlanetaryConfigurationsNamespace.js";

export class PlanetType extends EnumerationValue {
  public static readonly SUPERIOR = new PlanetType();
  public static readonly INFERIOR = new PlanetType();

  public static readonly enumeration = new Enumeration(PlanetType);
}

PlanetaryConfigurationsNamespace.register("PlanetType", PlanetType);
