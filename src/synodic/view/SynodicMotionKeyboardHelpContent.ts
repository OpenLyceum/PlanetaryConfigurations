/**
 * SynodicMotionKeyboardHelpContent.ts
 *
 * Keyboard help for the Synodic Motion screen: moving the planets, the combo boxes and
 * slider, the time controls, and the basic actions (buttons, checkboxes, Reset All).
 */

import {
  BasicActionsKeyboardHelpSection,
  ComboBoxKeyboardHelpSection,
  SliderControlsKeyboardHelpSection,
  TimeControlsKeyboardHelpSection,
  TwoColumnKeyboardHelpContent,
} from "scenerystack/scenery-phet";
import { PlanetKeyboardHelpSection } from "../../common/view/PlanetKeyboardHelpSection.js";

export class SynodicMotionKeyboardHelpContent extends TwoColumnKeyboardHelpContent {
  public constructor() {
    super(
      [new PlanetKeyboardHelpSection(), new ComboBoxKeyboardHelpSection(), new SliderControlsKeyboardHelpSection()],
      [new TimeControlsKeyboardHelpSection(), new BasicActionsKeyboardHelpSection({ withCheckboxContent: true })],
    );
  }
}
