/**
 * PlanetaryConfigurationsPreferencesModel.ts
 *
 * Model for the simulation-specific preferences shown in Preferences →
 * Simulation. Each preference Property takes its initial value from the
 * corresponding query parameter in planetaryConfigurationsQueryParameters.
 *
 * The single instance is exported as `planetaryConfigurationsPreferences`.
 */

import { BooleanProperty } from "scenerystack/axon";
import { Tandem } from "scenerystack/tandem";
import PlanetaryConfigurationsNamespace from "../PlanetaryConfigurationsNamespace.js";
import planetaryConfigurationsQueryParameters from "./planetaryConfigurationsQueryParameters.js";

export class PlanetaryConfigurationsPreferencesModel {
  /**
   * Also list each planet's measured synodic period in the Orbits table, so students can
   * compare the circular-orbit model with reality. Initial value: `?showRealPeriods`.
   */
  public readonly showRealPeriodsProperty: BooleanProperty;

  public constructor(tandem?: Tandem) {
    this.showRealPeriodsProperty = new BooleanProperty(
      planetaryConfigurationsQueryParameters.showRealPeriods,
      tandem ? { tandem: tandem.createTandem("showRealPeriodsProperty") } : undefined,
    );
  }

  public reset(): void {
    this.showRealPeriodsProperty.reset();
  }
}

/** The sim-wide preferences, shared by main.ts (the Preferences dialog) and the screen views. */
export const planetaryConfigurationsPreferences = new PlanetaryConfigurationsPreferencesModel(
  Tandem.ROOT.createTandem("preferences"),
);

PlanetaryConfigurationsNamespace.register(
  "PlanetaryConfigurationsPreferencesModel",
  PlanetaryConfigurationsPreferencesModel,
);
