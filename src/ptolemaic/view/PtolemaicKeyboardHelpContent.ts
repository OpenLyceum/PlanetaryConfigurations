/**
 * PtolemaicKeyboardHelpContent.ts
 *
 * Keyboard help for the Ptolemaic screen: the preset combo box, the parameter sliders,
 * the time controls, and the basic actions (radio buttons, checkboxes, Reset All).
 */

import {
  BasicActionsKeyboardHelpSection,
  ComboBoxKeyboardHelpSection,
  SliderControlsKeyboardHelpSection,
  TimeControlsKeyboardHelpSection,
  TwoColumnKeyboardHelpContent,
} from "scenerystack/scenery-phet";

export class PtolemaicKeyboardHelpContent extends TwoColumnKeyboardHelpContent {
  public constructor() {
    super(
      [new ComboBoxKeyboardHelpSection(), new SliderControlsKeyboardHelpSection()],
      [new TimeControlsKeyboardHelpSection(), new BasicActionsKeyboardHelpSection({ withCheckboxContent: true })],
    );
  }
}
