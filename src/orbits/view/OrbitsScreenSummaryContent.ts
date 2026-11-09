/**
 * OrbitsScreenSummaryContent.ts
 *
 * The accessible screen summary. The current-details paragraph is live (elapsed time)
 * and states the speed–distance trend with Mercury's and Saturn's speeds.
 */

import { DerivedProperty, PatternStringProperty } from "scenerystack/axon";
import { ScreenSummaryContent } from "scenerystack/sim";
import { orbitalSpeed } from "../../common/model/orbitalMath.js";
import { PlanetChoice } from "../../common/model/PlanetChoice.js";
import { fixed } from "../../common/view/viewUtils.js";
import { StringManager } from "../../i18n/StringManager.js";
import type { OrbitsModel } from "../model/OrbitsModel.js";

export class OrbitsScreenSummaryContent extends ScreenSummaryContent {
  public constructor(model: OrbitsModel) {
    const a11y = StringManager.getInstance().getOrbitsA11yStrings();

    super({
      playAreaContent: a11y.screenSummary.playAreaStringProperty,
      controlAreaContent: a11y.screenSummary.controlAreaStringProperty,
      currentDetailsContent: new PatternStringProperty(a11y.currentDetailsPatternStringProperty, {
        years: new DerivedProperty([model.timeProperty], (t) => fixed(t, 1)),
        mercury: fixed(orbitalSpeed(PlanetChoice.MERCURY.axis(1)), 1),
        saturn: fixed(orbitalSpeed(PlanetChoice.SATURN.axis(1)), 1),
      }),
      interactionHintContent: a11y.screenSummary.interactionHintStringProperty,
    });
  }
}
