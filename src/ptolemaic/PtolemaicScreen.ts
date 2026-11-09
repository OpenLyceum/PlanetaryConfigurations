/**
 * PtolemaicScreen.ts
 *
 * The top-level Screen component. It wires together the model and view
 * factories and passes screen-level options (name, background color, tandem)
 * to the parent Screen class.
 *
 * Registered in the screens array in src/main.ts. Its home-screen and navigation-bar
 * icons come from createPtolemaicIcon() in src/common/PlanetaryConfigurationsScreenIcons.ts
 * (each screen gets its own icon).
 */
import { type EmptySelfOptions, optionize } from "scenerystack/phet-core";
import type { ScreenOptions } from "scenerystack/sim";
import { Screen } from "scenerystack/sim";
import type { Tandem } from "scenerystack/tandem";
import { createPtolemaicIcon } from "../common/PlanetaryConfigurationsScreenIcons.js";
import PlanetaryConfigurationsColors from "../PlanetaryConfigurationsColors.js";
import { PtolemaicModel } from "./model/PtolemaicModel.js";
import { PtolemaicKeyboardHelpContent } from "./view/PtolemaicKeyboardHelpContent.js";
import { PtolemaicScreenView } from "./view/PtolemaicScreenView.js";

// Require tandem to be explicit — accidental omission would break PhET-iO.
type PtolemaicScreenOptions = ScreenOptions & { tandem: Tandem };

export class PtolemaicScreen extends Screen<PtolemaicModel, PtolemaicScreenView> {
  public constructor(options: PtolemaicScreenOptions) {
    super(
      // Model factory — called once when the screen is first shown
      () => new PtolemaicModel(),
      // View factory — receives the model instance
      (model) =>
        new PtolemaicScreenView(model, {
          tandem: options.tandem.createTandem("view"),
        }),
      optionize<PtolemaicScreenOptions, EmptySelfOptions, ScreenOptions>()(
        {
          backgroundColorProperty: PlanetaryConfigurationsColors.backgroundColorProperty,
          createKeyboardHelpNode: () => new PtolemaicKeyboardHelpContent(),
          homeScreenIcon: createPtolemaicIcon(),
          navigationBarIcon: createPtolemaicIcon(),
        },
        options,
      ),
    );
  }
}
