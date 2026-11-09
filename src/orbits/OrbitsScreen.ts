/**
 * OrbitsScreen.ts
 *
 * The top-level Screen component. It wires together the model and view
 * factories and passes screen-level options (name, background color, tandem)
 * to the parent Screen class.
 *
 * Registered in the screens array in src/main.ts. Its home-screen and navigation-bar
 * icons come from createOrbitsIcon() in src/common/PlanetaryConfigurationsScreenIcons.ts
 * (each screen gets its own icon).
 */
import { type EmptySelfOptions, optionize } from "scenerystack/phet-core";
import type { ScreenOptions } from "scenerystack/sim";
import { Screen } from "scenerystack/sim";
import type { Tandem } from "scenerystack/tandem";
import { createOrbitsIcon } from "../common/PlanetaryConfigurationsScreenIcons.js";
import PlanetaryConfigurationsColors from "../PlanetaryConfigurationsColors.js";
import { OrbitsModel } from "./model/OrbitsModel.js";
import { OrbitsKeyboardHelpContent } from "./view/OrbitsKeyboardHelpContent.js";
import { OrbitsScreenView } from "./view/OrbitsScreenView.js";

// Require tandem to be explicit — accidental omission would break PhET-iO.
type OrbitsScreenOptions = ScreenOptions & { tandem: Tandem };

export class OrbitsScreen extends Screen<OrbitsModel, OrbitsScreenView> {
  public constructor(options: OrbitsScreenOptions) {
    super(
      // Model factory — called once when the screen is first shown
      () => new OrbitsModel(),
      // View factory — receives the model instance
      (model) =>
        new OrbitsScreenView(model, {
          tandem: options.tandem.createTandem("view"),
        }),
      optionize<OrbitsScreenOptions, EmptySelfOptions, ScreenOptions>()(
        {
          backgroundColorProperty: PlanetaryConfigurationsColors.backgroundColorProperty,
          createKeyboardHelpNode: () => new OrbitsKeyboardHelpContent(),
          homeScreenIcon: createOrbitsIcon(),
          navigationBarIcon: createOrbitsIcon(),
        },
        options,
      ),
    );
  }
}
