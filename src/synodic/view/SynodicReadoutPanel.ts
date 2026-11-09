/**
 * SynodicReadoutPanel.ts
 *
 * The counter with Zero Counter (Q4: "zero the counter, click start animation"), the
 * elongation, the current and next configuration, the direction of motion against the
 * stars, buttons that jump between configurations, and where playback should pause.
 */

import { DerivedProperty, PatternStringProperty, type TReadOnlyProperty } from "scenerystack/axon";
import { GridBox, HBox, type Node, Text, VBox } from "scenerystack/scenery";
import { ArrowNode } from "scenerystack/scenery-phet";
import { RectangularPushButton } from "scenerystack/sun";
import { yearsToDays } from "../../common/model/orbitalMath.js";
import {
  FLAT_PANEL_PUSH_BUTTON_OPTIONS,
  LIGHT_SURFACE_TEXT_FILL,
} from "../../common/PlanetaryConfigurationsButtonOptions.js";
import { PlanetaryConfigurationsPanel } from "../../common/PlanetaryConfigurationsPanel.js";
import { elongationStringProperty, skyStringProperty } from "../../common/view/elongationStrings.js";
import {
  BIG_READOUT_FONT,
  checkbox,
  eventNameProperty,
  fixed,
  heading,
  LABEL_FONT,
  label,
  READOUT_FONT,
  textButton,
} from "../../common/view/viewUtils.js";
import { StringManager } from "../../i18n/StringManager.js";
import PlanetaryConfigurationsColors from "../../PlanetaryConfigurationsColors.js";
import { PANEL_ROW_SPACING } from "../../PlanetaryConfigurationsConstants.js";
import type { SynodicMotionModel } from "../model/SynodicMotionModel.js";

export class SynodicReadoutPanel extends PlanetaryConfigurationsPanel {
  public readonly interactiveNodes: readonly Node[];

  public constructor(model: SynodicMotionModel, width: number) {
    const strings = StringManager.getInstance();
    const s = strings.getSynodicMotionStrings();
    const common = strings.getCommonStrings();
    const a11y = strings.getSynodicMotionA11yStrings().controls;
    const innerWidth = width - 24;

    // ── Counter ──────────────────────────────────────────────────────────────
    const elapsedString = new PatternStringProperty(common.yearsAndDaysPatternStringProperty, {
      years: new DerivedProperty([model.elapsedProperty], (t) => fixed(t, 3)),
      days: new DerivedProperty([model.elapsedProperty], (t) => fixed(yearsToDays(t), 1)),
    });
    const counter = new Text(elapsedString, {
      font: BIG_READOUT_FONT,
      fill: PlanetaryConfigurationsColors.textColorProperty,
      maxWidth: innerWidth,
    });
    const zeroButton = textButton(
      common.zeroCounterStringProperty,
      () => model.zeroCounter(),
      a11y.zeroCounterStringProperty,
    );

    // ── Readout rows ─────────────────────────────────────────────────────────
    const motionString = new DerivedProperty(
      [model.isRetrogradeProperty, common.directStringProperty, common.retrogradeStringProperty],
      (retro, direct, retrograde) => (retro ? retrograde : direct),
    );
    const motionText = new Text(motionString, { font: READOUT_FONT, maxWidth: innerWidth * 0.62 });
    model.isRetrogradeProperty.link((retro) => {
      motionText.fill = retro
        ? PlanetaryConfigurationsColors.retrogradeColorProperty
        : PlanetaryConfigurationsColors.textColorProperty;
    });
    const nextName = eventNameProperty(
      new DerivedProperty([model.nextEventProperty], (next) => (next === null ? null : next.event)),
    );
    const value = (stringProperty: TReadOnlyProperty<string>): Text =>
      new Text(stringProperty, {
        font: READOUT_FONT,
        fill: PlanetaryConfigurationsColors.textColorProperty,
        maxWidth: innerWidth * 0.62,
      });
    const name = (stringProperty: TReadOnlyProperty<string>): Text =>
      label(stringProperty, {
        maxWidth: innerWidth * 0.36,
        fill: PlanetaryConfigurationsColors.secondaryTextColorProperty,
      });
    const rows: [Node, Node][] = [
      [name(common.elongationStringProperty), value(elongationStringProperty(model.elongationProperty))],
      [name(common.nowStringProperty), value(eventNameProperty(model.currentEventProperty))],
      [name(s.nextStringProperty), value(nextName)],
      [name(common.motionStringProperty), motionText],
      [name(common.skyStringProperty), value(skyStringProperty(model.elongationProperty))],
    ];
    const grid = new GridBox({
      xSpacing: 8,
      ySpacing: 5,
      xAlign: "left",
      rows,
    });

    // ── Jump buttons ─────────────────────────────────────────────────────────
    const arrowButton = (
      stringProperty: TReadOnlyProperty<string>,
      direction: "left" | "right",
      listener: () => void,
      accessibleName: TReadOnlyProperty<string>,
    ): RectangularPushButton => {
      const arrow = new ArrowNode(0, 0, direction === "left" ? -12 : 12, 0, {
        headWidth: 9,
        headHeight: 7,
        tailWidth: 3,
        fill: LIGHT_SURFACE_TEXT_FILL,
        stroke: null,
      });
      const text = new Text(stringProperty, {
        font: LABEL_FONT,
        fill: LIGHT_SURFACE_TEXT_FILL,
        maxWidth: innerWidth / 2 - 40,
      });
      return new RectangularPushButton({
        ...FLAT_PANEL_PUSH_BUTTON_OPTIONS,
        content: new HBox({ spacing: 5, children: direction === "left" ? [arrow, text] : [text, arrow] }),
        listener,
        accessibleName,
        xMargin: 7,
        yMargin: 4,
      });
    };
    const previousButton = arrowButton(
      s.previousEventStringProperty,
      "left",
      () => model.jumpToPreviousEvent(),
      a11y.previousEventStringProperty,
    );
    const nextButton = arrowButton(
      s.nextEventStringProperty,
      "right",
      () => model.jumpToNextEvent(),
      a11y.nextEventStringProperty,
    );

    // ── Pause options ────────────────────────────────────────────────────────
    const pauseConfigurations = checkbox(
      model.pauseAtConfigurationsProperty,
      s.pauseAtConfigurationsStringProperty,
      a11y.pauseAtConfigurationsStringProperty,
      innerWidth - 10,
    );
    const pauseStationary = checkbox(
      model.pauseAtStationaryProperty,
      s.pauseAtStationaryStringProperty,
      a11y.pauseAtStationaryStringProperty,
      innerWidth - 10,
    );

    const content = new VBox({
      align: "left",
      spacing: PANEL_ROW_SPACING + 1,
      children: [
        heading(s.counterStringProperty, innerWidth),
        counter,
        zeroButton,
        grid,
        new HBox({ spacing: 8, children: [previousButton, nextButton] }),
        label(s.pauseAtStringProperty, {
          maxWidth: innerWidth,
          fill: PlanetaryConfigurationsColors.secondaryTextColorProperty,
        }),
        new VBox({ align: "left", spacing: 5, children: [pauseConfigurations, pauseStationary] }),
      ],
    });

    super(content, { minWidth: width, maxWidth: width, align: "left" });
    this.interactiveNodes = [zeroButton, previousButton, nextButton, pauseConfigurations, pauseStationary];
  }
}
