/**
 * PtolemaicScreenView.ts
 *
 * Same layout as Synodic Motion, so the geocentric and heliocentric explanations of
 * retrograde motion can be compared screen to screen: the construction top-left, the
 * parameters and the display options beside it, the zodiac strip with the planet's
 * path along the bottom, and the time controls bottom-right.
 */

import { DerivedProperty, PatternStringProperty, type TReadOnlyProperty } from "scenerystack/axon";
import { type EmptySelfOptions, optionize } from "scenerystack/phet-core";
import { GridBox, Node, Text, VBox } from "scenerystack/scenery";
import { ResetAllButton } from "scenerystack/scenery-phet";
import { ScreenView, type ScreenViewOptions } from "scenerystack/sim";
import { toDegrees } from "../../common/model/orbitalMath.js";
import { FLAT_RESET_ALL_BUTTON_OPTIONS } from "../../common/PlanetaryConfigurationsButtonOptions.js";
import { PlanetaryConfigurationsPanel } from "../../common/PlanetaryConfigurationsPanel.js";
import { placeInRegion, skyLayout } from "../../common/view/ScreenLayout.js";
import {
  checkbox,
  fixed,
  heading,
  label,
  READOUT_FONT,
  textButton,
  timeControls,
} from "../../common/view/viewUtils.js";
import { ZodiacStripNode } from "../../common/view/ZodiacStripNode.js";
import { StringManager } from "../../i18n/StringManager.js";
import PlanetaryConfigurationsColors, { PLANET_COLORS } from "../../PlanetaryConfigurationsColors.js";
import { PANEL_ROW_SPACING } from "../../PlanetaryConfigurationsConstants.js";
import type { PtolemaicModel } from "../model/PtolemaicModel.js";
import { EpicycleViewNode } from "./EpicycleViewNode.js";
import { PtolemaicControlPanel } from "./PtolemaicControlPanel.js";
import { PtolemaicScreenSummaryContent } from "./PtolemaicScreenSummaryContent.js";

export type PtolemaicScreenViewOptions = ScreenViewOptions;

export class PtolemaicScreenView extends ScreenView {
  public constructor(model: PtolemaicModel, providedOptions?: PtolemaicScreenViewOptions) {
    const options = optionize<PtolemaicScreenViewOptions, EmptySelfOptions, ScreenViewOptions>()(
      { screenSummaryContent: new PtolemaicScreenSummaryContent(model) },
      providedOptions,
    );
    super(options);

    const strings = StringManager.getInstance();
    const p = strings.getPtolemaicStrings();
    const common = strings.getCommonStrings();
    const a11y = strings.getPtolemaicA11yStrings().controls;
    const layout = skyLayout(this.layoutBounds);
    const listParent = new Node();

    const viewNode = new EpicycleViewNode(model, layout.view);
    const controlPanel = new PtolemaicControlPanel(model, listParent, layout.setup.width);

    // ── Display options and readouts ─────────────────────────────────────────
    const readoutWidth = layout.readouts.width;
    const innerWidth = readoutWidth - 24;
    const boxes = [
      checkbox(model.showDeferentProperty, p.deferentStringProperty),
      checkbox(model.showEpicycleProperty, p.epicycleStringProperty),
      checkbox(model.showEquantProperty, p.equantStringProperty),
      checkbox(model.showPathProperty, p.pathStringProperty),
      checkbox(model.showSunLineProperty, p.sunLineStringProperty),
      checkbox(model.showPlanetLineProperty, p.planetLineStringProperty),
    ];
    const value = (stringProperty: TReadOnlyProperty<string>): Text =>
      new Text(stringProperty, {
        font: READOUT_FONT,
        fill: PlanetaryConfigurationsColors.textColorProperty,
        maxWidth: innerWidth * 0.55,
      });
    const name = (stringProperty: TReadOnlyProperty<string>): Text =>
      label(stringProperty, {
        maxWidth: innerWidth * 0.43,
        fill: PlanetaryConfigurationsColors.secondaryTextColorProperty,
      });
    const motionText = value(
      new DerivedProperty(
        [model.isRetrogradeProperty, common.directStringProperty, common.retrogradeStringProperty],
        (retro, direct, retrograde) => (retro ? retrograde : direct),
      ),
    );
    model.isRetrogradeProperty.link((retro) => {
      motionText.fill = retro
        ? PlanetaryConfigurationsColors.retrogradeColorProperty
        : PlanetaryConfigurationsColors.textColorProperty;
    });
    const grid = new GridBox({
      xSpacing: 8,
      ySpacing: 5,
      xAlign: "left",
      rows: [
        [
          name(p.planetLongitudeStringProperty),
          value(
            new PatternStringProperty(common.degreesPatternStringProperty, {
              value: new DerivedProperty([model.planetLongitudeProperty], (l) => fixed(toDegrees(l), 1)),
            }),
          ),
        ],
        [name(common.motionStringProperty), motionText],
        [
          name(common.timeStringProperty),
          value(
            new PatternStringProperty(common.daysPatternStringProperty, {
              value: new DerivedProperty([model.timeProperty], (t) => fixed(t, 0)),
            }),
          ),
        ],
      ],
    });
    const resetTimeButton = textButton(
      p.resetTimeStringProperty,
      () => model.resetTime(),
      a11y.resetTimeStringProperty,
    );
    const readoutPanel = new PlanetaryConfigurationsPanel(
      new VBox({
        align: "left",
        spacing: PANEL_ROW_SPACING,
        children: [
          heading(p.showStringProperty, innerWidth),
          new VBox({ align: "left", spacing: 5, children: boxes }),
          grid,
          resetTimeButton,
        ],
      }),
      { minWidth: readoutWidth, maxWidth: readoutWidth, align: "left" },
    );

    // ── Zodiac strip: the planet's path against the stars ────────────────────
    const zodiacStrip = new ZodiacStripNode({
      width: layout.strip.width,
      titleStringProperty: new PatternStringProperty(common.viewFromPatternStringProperty, {
        planet: common.earthStringProperty,
      }),
      captionStringProperty: new PatternStringProperty(common.pastPatternStringProperty, {
        years: fixed(model.pathYears, 2),
      }),
      sunLongitudeProperty: model.sunLongitudeProperty,
      targetLongitudeProperty: model.planetLongitudeProperty,
      targetFillProperty: new DerivedProperty([model.presetProperty], (preset) => PLANET_COLORS[preset.planetKey]),
      trailProperty: model.trailProperty,
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

    this.addChild(placeInRegion(viewNode, layout.view, { xAlign: "left", yAlign: "top" }));
    this.addChild(placeInRegion(controlPanel, layout.setup, { yAlign: "top" }));
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

    this.addChild(
      new Node({
        pdomOrder: [...controlPanel.interactiveNodes, ...boxes, resetTimeButton, timeControlNode, resetAllButton],
      }),
    );
  }
}
