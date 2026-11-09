/**
 * SynodicMotionScreenView.ts
 *
 * Layout (see common/view/ScreenLayout.ts): the orbit view top-left, the setup and
 * readout panels beside it, the zodiac strip along the bottom, and the time controls
 * with Reset All bottom-right. Each piece sits in its own region, so nothing overlaps;
 * only the combo-box lists pop up above the panels, from a top-level layer.
 */

import { DerivedProperty, PatternStringProperty } from "scenerystack/axon";
import { type EmptySelfOptions, optionize } from "scenerystack/phet-core";
import { StringUtils } from "scenerystack/phetcommon";
import { Node, VBox } from "scenerystack/scenery";
import { ResetAllButton } from "scenerystack/scenery-phet";
import { ScreenView, type ScreenViewOptions } from "scenerystack/sim";
import { yearsToDays } from "../../common/model/orbitalMath.js";
import { FLAT_RESET_ALL_BUTTON_OPTIONS } from "../../common/PlanetaryConfigurationsButtonOptions.js";
import { placeInRegion, skyLayout } from "../../common/view/ScreenLayout.js";
import { fixed, planetNameProperty, timeControls } from "../../common/view/viewUtils.js";
import { ZodiacStripNode } from "../../common/view/ZodiacStripNode.js";
import { StringManager } from "../../i18n/StringManager.js";
import { PLANET_COLORS } from "../../PlanetaryConfigurationsColors.js";
import type { SynodicMotionModel } from "../model/SynodicMotionModel.js";
import { SynodicMotionScreenSummaryContent } from "./SynodicMotionScreenSummaryContent.js";
import { SynodicOrbitViewNode } from "./SynodicOrbitViewNode.js";
import { SynodicReadoutPanel } from "./SynodicReadoutPanel.js";
import { SynodicSetupPanel } from "./SynodicSetupPanel.js";

export type SynodicMotionScreenViewOptions = ScreenViewOptions;

export class SynodicMotionScreenView extends ScreenView {
  public constructor(model: SynodicMotionModel, providedOptions?: SynodicMotionScreenViewOptions) {
    const options = optionize<SynodicMotionScreenViewOptions, EmptySelfOptions, ScreenViewOptions>()(
      { screenSummaryContent: new SynodicMotionScreenSummaryContent(model) },
      providedOptions,
    );
    super(options);

    const strings = StringManager.getInstance();
    const common = strings.getCommonStrings();
    const a11y = strings.getSynodicMotionA11yStrings();
    const layout = skyLayout(this.layoutBounds);

    // Combo-box lists open in this top-level layer (added last so it draws above everything).
    const listParent = new Node();

    const orbitView = new SynodicOrbitViewNode(model, layout.view);
    const setupPanel = new SynodicSetupPanel(model, listParent, layout.setup.width);
    const readoutPanel = new SynodicReadoutPanel(model, layout.readouts.width);

    const zodiacStrip = new ZodiacStripNode({
      width: layout.strip.width,
      titleStringProperty: new PatternStringProperty(common.viewFromPatternStringProperty, {
        planet: planetNameProperty(model.observerChoiceProperty),
      }),
      captionStringProperty: new PatternStringProperty(common.pastPatternStringProperty, {
        years: new DerivedProperty([model.trailDurationProperty], (d) => fixed(d, 2)),
      }),
      sunLongitudeProperty: model.sunApparentLongitudeProperty,
      targetLongitudeProperty: model.targetApparentLongitudeProperty,
      targetFillProperty: new DerivedProperty([model.targetChoiceProperty], (choice) => PLANET_COLORS[choice.key]),
      trailProperty: model.trailProperty,
      referenceSunLongitudeProperty: model.referenceSunLongitudeProperty,
      referenceTargetLongitudeProperty: model.referenceTargetLongitudeProperty,
    });

    const timeControlNode = timeControls(
      model.isPlayingProperty,
      model.timeSpeedProperty,
      () => model.stepForward(),
      () => model.stepBackward(),
    );
    const resetAllButton = new ResetAllButton({
      ...FLAT_RESET_ALL_BUTTON_OPTIONS,
      listener: () => {
        this.interruptSubtreeInput();
        model.reset();
      },
    });

    this.addChild(placeInRegion(orbitView, layout.view, { xAlign: "left", yAlign: "top" }));
    this.addChild(placeInRegion(setupPanel, layout.setup, { yAlign: "top" }));
    this.addChild(placeInRegion(readoutPanel, layout.readouts, { yAlign: "top" }));
    this.addChild(placeInRegion(zodiacStrip, layout.strip, { xAlign: "left", yAlign: "bottom" }));
    this.addChild(
      placeInRegion(
        new VBox({ spacing: 14, align: "right", children: [timeControlNode, resetAllButton] }),
        layout.time,
        { xAlign: "right", yAlign: "bottom" },
      ),
    );
    this.addChild(listParent);

    // Announce each configuration that playback pauses at.
    const elapsedDays = new DerivedProperty([model.elapsedProperty], (t) => fixed(yearsToDays(t), 1));
    model.eventReachedEmitter.addListener((event) => {
      const elapsed = StringUtils.fillIn(common.daysPatternStringProperty.value, { value: elapsedDays.value });
      this.addAccessibleResponse(
        StringUtils.fillIn(a11y.eventReachedPatternStringProperty.value, {
          event: strings.getEventName(event.key).value,
          elapsed,
        }),
      );
    });

    this.addChild(
      new Node({
        pdomOrder: [
          ...orbitView.planetNodes,
          ...setupPanel.interactiveNodes,
          ...readoutPanel.interactiveNodes,
          timeControlNode,
          resetAllButton,
        ],
      }),
    );
  }
}
