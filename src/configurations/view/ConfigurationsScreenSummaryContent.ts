/**
 * ConfigurationsScreenSummaryContent.ts
 *
 * The accessible screen summary, with a live paragraph giving the planet's type,
 * elongation, configuration, and where it appears in Earth's sky.
 */

import { DerivedProperty, PatternStringProperty } from "scenerystack/axon";
import { ScreenSummaryContent } from "scenerystack/sim";
import { PlanetType } from "../../common/model/PlanetType.js";
import { elongationStringProperty, skyStringProperty } from "../../common/view/elongationStrings.js";
import { eventNameProperty } from "../../common/view/viewUtils.js";
import { StringManager } from "../../i18n/StringManager.js";
import type { ConfigurationsModel } from "../model/ConfigurationsModel.js";

export class ConfigurationsScreenSummaryContent extends ScreenSummaryContent {
  public constructor(model: ConfigurationsModel) {
    const strings = StringManager.getInstance();
    const a11y = strings.getConfigurationsA11yStrings();
    const common = strings.getCommonStrings();

    super({
      playAreaContent: a11y.screenSummary.playAreaStringProperty,
      controlAreaContent: a11y.screenSummary.controlAreaStringProperty,
      currentDetailsContent: new PatternStringProperty(a11y.currentDetailsPatternStringProperty, {
        type: new DerivedProperty(
          [model.planetTypeProperty, common.superiorStringProperty, common.inferiorStringProperty],
          (type, superior, inferior) => (type === PlanetType.SUPERIOR ? superior : inferior),
        ),
        elongation: elongationStringProperty(model.elongationProperty),
        configuration: eventNameProperty(model.configurationProperty),
        sky: skyStringProperty(model.elongationProperty),
      }),
      interactionHintContent: a11y.screenSummary.interactionHintStringProperty,
    });
  }
}
