/**
 * ConfigurationsKeyboardHelpContent.ts
 *
 * Keyboard help for the Configurations screen: moving the planet, the orbit-radius
 * slider, and the basic actions (radio buttons, checkboxes, Reset All).
 */

import {
  BasicActionsKeyboardHelpSection,
  SliderControlsKeyboardHelpSection,
  TwoColumnKeyboardHelpContent,
} from "scenerystack/scenery-phet";
import { PlanetKeyboardHelpSection } from "../../common/view/PlanetKeyboardHelpSection.js";

export class ConfigurationsKeyboardHelpContent extends TwoColumnKeyboardHelpContent {
  public constructor() {
    super(
      [new PlanetKeyboardHelpSection(), new SliderControlsKeyboardHelpSection()],
      [new BasicActionsKeyboardHelpSection({ withCheckboxContent: true })],
    );
  }
}
