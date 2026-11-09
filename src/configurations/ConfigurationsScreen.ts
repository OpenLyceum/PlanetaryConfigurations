/**
 * ConfigurationsScreen.ts
 *
 * The top-level Screen component. It wires together the model and view
 * factories and passes screen-level options (name, background color, tandem)
 * to the parent Screen class.
 *
 * Registered in the screens array in src/main.ts. Its home-screen and navigation-bar
 * icons come from createConfigurationsIcon() in src/common/PlanetaryConfigurationsScreenIcons.ts
 * (each screen gets its own icon).
 */
import { type EmptySelfOptions, optionize } from "scenerystack/phet-core";
import type { ScreenOptions } from "scenerystack/sim";
import { Screen } from "scenerystack/sim";
import type { Tandem } from "scenerystack/tandem";
import { createConfigurationsIcon } from "../common/PlanetaryConfigurationsScreenIcons.js";
import PlanetaryConfigurationsColors from "../PlanetaryConfigurationsColors.js";
import { ConfigurationsModel } from "./model/ConfigurationsModel.js";
import { ConfigurationsKeyboardHelpContent } from "./view/ConfigurationsKeyboardHelpContent.js";
import { ConfigurationsScreenView } from "./view/ConfigurationsScreenView.js";

// Require tandem to be explicit — accidental omission would break PhET-iO.
type ConfigurationsScreenOptions = ScreenOptions & { tandem: Tandem };

export class ConfigurationsScreen extends Screen<ConfigurationsModel, ConfigurationsScreenView> {
  public constructor(options: ConfigurationsScreenOptions) {
    super(
      // Model factory — called once when the screen is first shown
      () => new ConfigurationsModel(),
      // View factory — receives the model instance
      (model) =>
        new ConfigurationsScreenView(model, {
          tandem: options.tandem.createTandem("view"),
        }),
      optionize<ConfigurationsScreenOptions, EmptySelfOptions, ScreenOptions>()(
        {
          backgroundColorProperty: PlanetaryConfigurationsColors.backgroundColorProperty,
          createKeyboardHelpNode: () => new ConfigurationsKeyboardHelpContent(),
          homeScreenIcon: createConfigurationsIcon(),
          navigationBarIcon: createConfigurationsIcon(),
        },
        options,
      ),
    );
  }
}
