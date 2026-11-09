/**
 * ConfigurationEvent.ts
 *
 * Named planetary configurations (handout Q2–Q3) and the two stationary points that
 * bracket a retrograde loop (Q16).
 *
 * Inferior target (inside the observer's orbit): inferior conjunction, greatest
 * western elongation, superior conjunction, greatest eastern elongation.
 * Superior target (outside it): opposition, eastern quadrature, conjunction,
 * western quadrature.
 */

import { Enumeration, EnumerationValue } from "scenerystack/phet-core";
import PlanetaryConfigurationsNamespace from "../../PlanetaryConfigurationsNamespace.js";

export type ConfigurationEventKey =
  | "inferiorConjunction"
  | "greatestElongationWest"
  | "superiorConjunction"
  | "greatestElongationEast"
  | "opposition"
  | "quadratureEast"
  | "conjunction"
  | "quadratureWest"
  | "retrogradeBegins"
  | "retrogradeEnds";

export class ConfigurationEvent extends EnumerationValue {
  public static readonly INFERIOR_CONJUNCTION = new ConfigurationEvent("inferiorConjunction", false);
  public static readonly GREATEST_ELONGATION_WEST = new ConfigurationEvent("greatestElongationWest", false);
  public static readonly SUPERIOR_CONJUNCTION = new ConfigurationEvent("superiorConjunction", false);
  public static readonly GREATEST_ELONGATION_EAST = new ConfigurationEvent("greatestElongationEast", false);
  public static readonly OPPOSITION = new ConfigurationEvent("opposition", false);
  public static readonly QUADRATURE_EAST = new ConfigurationEvent("quadratureEast", false);
  public static readonly CONJUNCTION = new ConfigurationEvent("conjunction", false);
  public static readonly QUADRATURE_WEST = new ConfigurationEvent("quadratureWest", false);
  public static readonly RETROGRADE_BEGINS = new ConfigurationEvent("retrogradeBegins", true);
  public static readonly RETROGRADE_ENDS = new ConfigurationEvent("retrogradeEnds", true);

  public static readonly enumeration = new Enumeration(ConfigurationEvent);

  /** Key into the configuration-name strings. */
  public readonly key: ConfigurationEventKey;

  /** True for the stationary points (start / end of retrograde motion), false for named configurations. */
  public readonly isStationaryPoint: boolean;

  public constructor(key: ConfigurationEventKey, isStationaryPoint: boolean) {
    super();
    this.key = key;
    this.isStationaryPoint = isStationaryPoint;
  }
}

PlanetaryConfigurationsNamespace.register("ConfigurationEvent", ConfigurationEvent);
