/**
 * PtolemaicScreenSummaryContent.ts
 *
 * The accessible screen summary, with a live paragraph giving the planet, its ecliptic
 * longitude, whether it is moving direct or retrograde, and the elapsed time.
 */

import { DerivedProperty, PatternStringProperty } from "scenerystack/axon";
import { ScreenSummaryContent } from "scenerystack/sim";
import { toDegrees } from "../../common/model/orbitalMath.js";
import { fixed } from "../../common/view/viewUtils.js";
import { StringManager } from "../../i18n/StringManager.js";
import type { PtolemaicModel } from "../model/PtolemaicModel.js";
import { ptolemaicPlanetNameProperty } from "./EpicycleViewNode.js";

export class PtolemaicScreenSummaryContent extends ScreenSummaryContent {
  public constructor(model: PtolemaicModel) {
    const strings = StringManager.getInstance();
    const a11y = strings.getPtolemaicA11yStrings();
    const common = strings.getCommonStrings();

    super({
      playAreaContent: a11y.screenSummary.playAreaStringProperty,
      controlAreaContent: a11y.screenSummary.controlAreaStringProperty,
      currentDetailsContent: new PatternStringProperty(a11y.currentDetailsPatternStringProperty, {
        planet: ptolemaicPlanetNameProperty(model),
        longitude: new DerivedProperty([model.planetLongitudeProperty], (l) => fixed(toDegrees(l), 0)),
        motion: new DerivedProperty(
          [model.isRetrogradeProperty, common.directStringProperty, common.retrogradeStringProperty],
          (retro, direct, retrograde) => (retro ? retrograde : direct),
        ),
        days: new DerivedProperty([model.timeProperty], (t) => fixed(t, 0)),
      }),
      interactionHintContent: a11y.screenSummary.interactionHintStringProperty,
    });
  }
}
