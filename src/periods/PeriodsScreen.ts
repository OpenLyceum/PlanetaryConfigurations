/**
 * PeriodsScreen.ts
 *
 * The top-level Screen component. It wires together the model and view
 * factories and passes screen-level options (name, background color, tandem)
 * to the parent Screen class.
 *
 * Registered in the screens array in src/main.ts. Its home-screen and navigation-bar
 * icons come from createPeriodsIcon() in src/common/PlanetaryConfigurationsScreenIcons.ts
 * (each screen gets its own icon).
 */
import { type EmptySelfOptions, optionize } from "scenerystack/phet-core";
import type { ScreenOptions } from "scenerystack/sim";
import { Screen } from "scenerystack/sim";
import type { Tandem } from "scenerystack/tandem";
import { createPeriodsIcon } from "../common/PlanetaryConfigurationsScreenIcons.js";
import PlanetaryConfigurationsColors from "../PlanetaryConfigurationsColors.js";
import { PeriodsModel } from "./model/PeriodsModel.js";
import { PeriodsKeyboardHelpContent } from "./view/PeriodsKeyboardHelpContent.js";
import { PeriodsScreenView } from "./view/PeriodsScreenView.js";

// Require tandem to be explicit — accidental omission would break PhET-iO.
type PeriodsScreenOptions = ScreenOptions & { tandem: Tandem };

export class PeriodsScreen extends Screen<PeriodsModel, PeriodsScreenView> {
  public constructor(options: PeriodsScreenOptions) {
    super(
      // Model factory — called once when the screen is first shown
      () => new PeriodsModel(),
      // View factory — receives the model instance
      (model) =>
        new PeriodsScreenView(model, {
          tandem: options.tandem.createTandem("view"),
        }),
      optionize<PeriodsScreenOptions, EmptySelfOptions, ScreenOptions>()(
        {
          backgroundColorProperty: PlanetaryConfigurationsColors.backgroundColorProperty,
          createKeyboardHelpNode: () => new PeriodsKeyboardHelpContent(),
          homeScreenIcon: createPeriodsIcon(),
          navigationBarIcon: createPeriodsIcon(),
        },
        options,
      ),
    );
  }
}
