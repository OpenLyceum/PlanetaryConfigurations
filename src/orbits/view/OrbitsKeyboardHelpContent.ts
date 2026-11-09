/**
 * OrbitsKeyboardHelpContent.ts
 *
 * Keyboard help for the Orbits screen: the time controls and the basic actions
 * (radio buttons, checkboxes, Reset All).
 */

import {
  BasicActionsKeyboardHelpSection,
  TimeControlsKeyboardHelpSection,
  TwoColumnKeyboardHelpContent,
} from "scenerystack/scenery-phet";

export class OrbitsKeyboardHelpContent extends TwoColumnKeyboardHelpContent {
  public constructor() {
    super(
      [new TimeControlsKeyboardHelpSection()],
      [new BasicActionsKeyboardHelpSection({ withCheckboxContent: true })],
    );
  }
}
