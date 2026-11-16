import { PLANETARY_CONFIGURATIONS_PREFERENCES_NODE_SETTINGS } from "../PlanetaryConfigurationsConstants.js";
/**
 * PlanetaryConfigurationsPreferencesNode.ts
 *
 * Custom preferences UI shown in Preferences → Simulation. Controls are bound
 * to PlanetaryConfigurationsPreferencesModel Properties (whose initial values come from
 * planetaryConfigurationsQueryParameters).
 */

import { Text, VBox } from "scenerystack/scenery";
import { PhetFont } from "scenerystack/scenery-phet";
import { Checkbox } from "scenerystack/sun";
import type { Tandem } from "scenerystack/tandem";
import { StringManager } from "../i18n/StringManager.js";
import PlanetaryConfigurationsColors from "../PlanetaryConfigurationsColors.js";
import PlanetaryConfigurationsNamespace from "../PlanetaryConfigurationsNamespace.js";
import type { PlanetaryConfigurationsPreferencesModel } from "./PlanetaryConfigurationsPreferencesModel.js";

export class PlanetaryConfigurationsPreferencesNode extends VBox {
  public constructor(preferencesModel: PlanetaryConfigurationsPreferencesModel, tandem?: Tandem) {
    const prefStrings = StringManager.getInstance().getPreferences();

    // The Preferences dialog is always white, so use the dark "light control surface"
    // colors (readable on white in both default and projector profiles), not textColorProperty
    // (which is near-white in default mode and would be invisible on the white dialog).
    const header = new Text(prefStrings.titleStringProperty, {
      font: new PhetFont({ size: PLANETARY_CONFIGURATIONS_PREFERENCES_NODE_SETTINGS.HEADER_FONT_SIZE, weight: "bold" }),
      fill: PlanetaryConfigurationsColors.controlSurfaceTextColorProperty,
    });

    const showRealPeriodsCheckbox = new Checkbox(
      preferencesModel.showRealPeriodsProperty,
      new Text(prefStrings.showRealPeriodsStringProperty, {
        font: new PhetFont(PLANETARY_CONFIGURATIONS_PREFERENCES_NODE_SETTINGS.SHOW_REAL_PERIODS_CHECKBOX_FONT_SIZE),
        fill: PlanetaryConfigurationsColors.controlSurfaceTextColorProperty,
      }),
      {
        checkboxColor: PlanetaryConfigurationsColors.controlSurfaceTextColorProperty,
        checkboxColorBackground: PlanetaryConfigurationsColors.controlSurfaceColorProperty,
        spacing: PLANETARY_CONFIGURATIONS_PREFERENCES_NODE_SETTINGS.SHOW_REAL_PERIODS_CHECKBOX_SPACING,
        accessibleHelpText: prefStrings.showRealPeriodsHelpStringProperty,
        ...(tandem && { tandem: tandem.createTandem("showRealPeriodsCheckbox") }),
      },
    );

    const description = new Text(prefStrings.showRealPeriodsHelpStringProperty, {
      font: new PhetFont(PLANETARY_CONFIGURATIONS_PREFERENCES_NODE_SETTINGS.DESCRIPTION_FONT_SIZE),
      fill: PlanetaryConfigurationsColors.controlSurfaceTextColorProperty,
      maxWidth: PLANETARY_CONFIGURATIONS_PREFERENCES_NODE_SETTINGS.DESCRIPTION_MAX_WIDTH,
    });

    super({
      align: "left",
      spacing: PLANETARY_CONFIGURATIONS_PREFERENCES_NODE_SETTINGS.SPACING,
      children: [header, showRealPeriodsCheckbox, description],
    });
  }
}

PlanetaryConfigurationsNamespace.register(
  "PlanetaryConfigurationsPreferencesNode",
  PlanetaryConfigurationsPreferencesNode,
);
