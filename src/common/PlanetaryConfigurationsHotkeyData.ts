/**
 * PlanetaryConfigurationsHotkeyData.ts
 *
 * Key bindings that no stock keyboard-help section covers. The planet keyboard
 * listeners and the keyboard-help rows both read these, so the keys a view handles
 * and the keys the dialog shows cannot drift apart.
 */

import { HotkeyData } from "scenerystack/scenery";
import { StringManager } from "../i18n/StringManager.js";

const REPO_NAME = "planetary-configurations";
const keyboardHelp = StringManager.getInstance().getKeyboardHelpStrings();

const PlanetaryConfigurationsHotkeyData = {
  /** Move a focused planet counter-clockwise (forward along its orbit). */
  ROTATE_FORWARD: new HotkeyData({
    keys: ["arrowRight", "arrowUp"],
    repoName: REPO_NAME,
    keyboardHelpDialogLabelStringProperty: keyboardHelp.rotatePlanetStringProperty,
  }),

  /** Move a focused planet clockwise (backward along its orbit). */
  ROTATE_BACKWARD: new HotkeyData({
    keys: ["arrowLeft", "arrowDown"],
    repoName: REPO_NAME,
    keyboardHelpDialogLabelStringProperty: keyboardHelp.rotatePlanetStringProperty,
  }),

  /** Smaller steps in either direction. */
  ROTATE_FINE: new HotkeyData({
    keys: ["shift+arrowRight", "shift+arrowUp", "shift+arrowLeft", "shift+arrowDown"],
    repoName: REPO_NAME,
    keyboardHelpDialogLabelStringProperty: keyboardHelp.rotatePlanetFineStringProperty,
  }),
} as const;

export default PlanetaryConfigurationsHotkeyData;
