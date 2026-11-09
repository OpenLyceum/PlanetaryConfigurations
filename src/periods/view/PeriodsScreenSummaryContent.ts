/**
 * PeriodsScreenSummaryContent.ts
 *
 * The accessible screen summary, with a live paragraph giving the calculator's input
 * and result and the hypothetical planet's distance and periods.
 */

import { DerivedProperty, PatternStringProperty } from "scenerystack/axon";
import { ScreenSummaryContent } from "scenerystack/sim";
import { fixed } from "../../common/view/viewUtils.js";
import { StringManager } from "../../i18n/StringManager.js";
import type { PeriodsModel } from "../model/PeriodsModel.js";

export class PeriodsScreenSummaryContent extends ScreenSummaryContent {
  public constructor(model: PeriodsModel) {
    const strings = StringManager.getInstance();
    const a11y = strings.getPeriodsA11yStrings();
    const common = strings.getCommonStrings();

    const years = (value: number | null): string =>
      value === null ? common.noneStringProperty.value : fixed(value, 3);
    super({
      playAreaContent: a11y.screenSummary.playAreaStringProperty,
      controlAreaContent: a11y.screenSummary.controlAreaStringProperty,
      currentDetailsContent: new PatternStringProperty(a11y.currentDetailsPatternStringProperty, {
        input: new PatternStringProperty(common.yearsPatternStringProperty, {
          value: new DerivedProperty([model.inputYearsProperty], (v) => years(v)),
        }),
        result: new PatternStringProperty(common.yearsPatternStringProperty, {
          value: new DerivedProperty([model.resultYearsProperty, common.noneStringProperty], (v) => years(v)),
        }),
        a: new DerivedProperty([model.markerAProperty], (a) => fixed(a, 2)),
        p: new DerivedProperty([model.markerSiderealProperty], (v) => fixed(v, 2)),
        s: new DerivedProperty([model.markerSynodicProperty], (v) => fixed(v, 2)),
      }),
      interactionHintContent: a11y.screenSummary.interactionHintStringProperty,
    });
  }
}
