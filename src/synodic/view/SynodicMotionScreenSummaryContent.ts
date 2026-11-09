/**
 * SynodicMotionScreenSummaryContent.ts
 *
 * The accessible screen summary. Its current-details paragraph is live: it names the
 * observer and target, and reads the counter, elongation, configuration and direction
 * of motion as they change.
 */

import { DerivedProperty, PatternStringProperty } from "scenerystack/axon";
import { ScreenSummaryContent } from "scenerystack/sim";
import { yearsToDays } from "../../common/model/orbitalMath.js";
import { elongationStringProperty } from "../../common/view/elongationStrings.js";
import { eventNameProperty, fixed, planetNameProperty } from "../../common/view/viewUtils.js";
import { StringManager } from "../../i18n/StringManager.js";
import type { SynodicMotionModel } from "../model/SynodicMotionModel.js";

export class SynodicMotionScreenSummaryContent extends ScreenSummaryContent {
  public constructor(model: SynodicMotionModel) {
    const strings = StringManager.getInstance();
    const a11y = strings.getSynodicMotionA11yStrings();
    const common = strings.getCommonStrings();

    const currentDetails = new PatternStringProperty(a11y.currentDetailsPatternStringProperty, {
      observer: planetNameProperty(model.observerChoiceProperty),
      target: planetNameProperty(model.targetChoiceProperty),
      elapsed: new PatternStringProperty(common.daysPatternStringProperty, {
        value: new DerivedProperty([model.elapsedProperty], (t) => fixed(yearsToDays(t), 1)),
      }),
      elongation: elongationStringProperty(model.elongationProperty),
      configuration: eventNameProperty(model.currentEventProperty),
      motion: new DerivedProperty(
        [model.isRetrogradeProperty, common.directStringProperty, common.retrogradeStringProperty],
        (retro, direct, retrograde) => (retro ? retrograde : direct),
      ),
    });

    super({
      playAreaContent: a11y.screenSummary.playAreaStringProperty,
      controlAreaContent: a11y.screenSummary.controlAreaStringProperty,
      currentDetailsContent: currentDetails,
      interactionHintContent: a11y.screenSummary.interactionHintStringProperty,
    });
  }
}
