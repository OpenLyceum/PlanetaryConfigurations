/**
 * PlanetKeyboardHelpSection.ts
 *
 * Keyboard-help rows for moving a focused planet along its orbit, read from the same
 * HotkeyData the planet listeners use.
 */

import { KeyboardHelpIconFactory, KeyboardHelpSection, KeyboardHelpSectionRow } from "scenerystack/scenery-phet";
import { StringManager } from "../../i18n/StringManager.js";
import PlanetaryConfigurationsHotkeyData from "../PlanetaryConfigurationsHotkeyData.js";

export class PlanetKeyboardHelpSection extends KeyboardHelpSection {
  public constructor() {
    const keyboardHelp = StringManager.getInstance().getKeyboardHelpStrings();
    super(keyboardHelp.planetsHeadingStringProperty, [
      KeyboardHelpSectionRow.fromHotkeyData(PlanetaryConfigurationsHotkeyData.ROTATE_FORWARD, {
        icon: KeyboardHelpIconFactory.arrowKeysRowIcon(),
      }),
      KeyboardHelpSectionRow.fromHotkeyData(PlanetaryConfigurationsHotkeyData.ROTATE_FINE, {
        icon: KeyboardHelpIconFactory.shiftPlusIcon(KeyboardHelpIconFactory.arrowKeysRowIcon()),
      }),
    ]);
  }
}
