/**
 * elongationStrings.ts
 *
 * Localized readouts derived from a signed elongation: "120.0° E" and the phrase for
 * where the planet appears in the observer's sky (evening, morning, all night, glare).
 */

import { DerivedProperty, PatternStringProperty, type TReadOnlyProperty } from "scenerystack/axon";
import { StringManager } from "../../i18n/StringManager.js";
import { skyVisibility, toDegrees } from "../model/orbitalMath.js";
import { fixed } from "./viewUtils.js";

/** Elongations within this many degrees of 0° or 180° show no east/west direction. */
const NO_DIRECTION_DEGREES = 0.05;

/** A localized "{{value}}° {{direction}}" readout of a signed elongation (rad). */
export function elongationStringProperty(elongationProperty: TReadOnlyProperty<number>): TReadOnlyProperty<string> {
  const common = StringManager.getInstance().getCommonStrings();
  return new PatternStringProperty(common.elongationPatternStringProperty, {
    value: new DerivedProperty([elongationProperty], (e) => fixed(Math.abs(toDegrees(e)), 1)),
    direction: new DerivedProperty(
      [elongationProperty, common.eastShortStringProperty, common.westShortStringProperty],
      (e, east, west) => {
        const degrees = Math.abs(toDegrees(e));
        if (degrees < NO_DIRECTION_DEGREES || degrees > 180 - NO_DIRECTION_DEGREES) {
          return "";
        }
        return e > 0 ? east : west;
      },
    ),
  });
}

/** The localized sky-visibility phrase for a signed elongation (rad). */
export function skyStringProperty(elongationProperty: TReadOnlyProperty<number>): TReadOnlyProperty<string> {
  const common = StringManager.getInstance().getCommonStrings();
  return new DerivedProperty(
    [
      elongationProperty,
      common.skyGlareStringProperty,
      common.skyEveningStringProperty,
      common.skyMorningStringProperty,
      common.skyAllNightStringProperty,
    ],
    (e, glare, evening, morning, allNight) => ({ glare, evening, morning, allNight })[skyVisibility(e)],
  );
}
