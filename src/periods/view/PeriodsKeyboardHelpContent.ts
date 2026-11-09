/**
 * PeriodsKeyboardHelpContent.ts
 *
 * Keyboard help for the Periods screen: moving the hypothetical planet along the graph
 * (a slider) and the basic actions (radio buttons, the entry button, Reset All).
 */

import {
  BasicActionsKeyboardHelpSection,
  SliderControlsKeyboardHelpSection,
  TwoColumnKeyboardHelpContent,
} from "scenerystack/scenery-phet";

export class PeriodsKeyboardHelpContent extends TwoColumnKeyboardHelpContent {
  public constructor() {
    super(
      [new SliderControlsKeyboardHelpSection()],
      [new BasicActionsKeyboardHelpSection({ withCheckboxContent: true })],
    );
  }
}
