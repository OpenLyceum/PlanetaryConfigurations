/**
 * SynodicMotionScreen.ts
 *
 * The top-level Screen component. It wires together the model and view
 * factories and passes screen-level options (name, background color, tandem)
 * to the parent Screen class.
 *
 * Registered in the screens array in src/main.ts. Its home-screen and navigation-bar
 * icons come from createSynodicMotionIcon() in src/common/PlanetaryConfigurationsScreenIcons.ts
 * (each screen gets its own icon).
 */
import { type EmptySelfOptions, optionize } from "scenerystack/phet-core";
import type { ScreenOptions } from "scenerystack/sim";
import { Screen } from "scenerystack/sim";
import type { Tandem } from "scenerystack/tandem";
import { createSynodicMotionIcon } from "../common/PlanetaryConfigurationsScreenIcons.js";
import PlanetaryConfigurationsColors from "../PlanetaryConfigurationsColors.js";
import { SynodicMotionModel } from "./model/SynodicMotionModel.js";
import { SynodicMotionKeyboardHelpContent } from "./view/SynodicMotionKeyboardHelpContent.js";
import { SynodicMotionScreenView } from "./view/SynodicMotionScreenView.js";

// Require tandem to be explicit — accidental omission would break PhET-iO.
type SynodicMotionScreenOptions = ScreenOptions & { tandem: Tandem };

export class SynodicMotionScreen extends Screen<SynodicMotionModel, SynodicMotionScreenView> {
  public constructor(options: SynodicMotionScreenOptions) {
    super(
      // Model factory — called once when the screen is first shown
      () => new SynodicMotionModel(),
      // View factory — receives the model instance
      (model) =>
        new SynodicMotionScreenView(model, {
          tandem: options.tandem.createTandem("view"),
        }),
      optionize<SynodicMotionScreenOptions, EmptySelfOptions, ScreenOptions>()(
        {
          backgroundColorProperty: PlanetaryConfigurationsColors.backgroundColorProperty,
          createKeyboardHelpNode: () => new SynodicMotionKeyboardHelpContent(),
          homeScreenIcon: createSynodicMotionIcon(),
          navigationBarIcon: createSynodicMotionIcon(),
        },
        options,
      ),
    );
  }
}
