import { PERIODS_SCREEN_VIEW_SETTINGS } from "../../PlanetaryConfigurationsConstants.js";
/**
 * PeriodsScreenView.ts
 *
 * Layout: the calculator on the left, the chart top-right, and the hypothetical-planet
 * readout, legend and Reset All in a band under the chart.
 */

import { DerivedProperty, PatternStringProperty } from "scenerystack/axon";
import { Shape } from "scenerystack/kite";
import { type EmptySelfOptions, optionize } from "scenerystack/phet-core";
import { HBox, Line, Node, Path, Text, VBox } from "scenerystack/scenery";
import { Keypad, ResetAllButton } from "scenerystack/scenery-phet";
import { KeypadDialog, ScreenView, type ScreenViewOptions } from "scenerystack/sim";
import { FLAT_RESET_ALL_BUTTON_OPTIONS } from "../../common/PlanetaryConfigurationsButtonOptions.js";
import { PlanetaryConfigurationsPanel } from "../../common/PlanetaryConfigurationsPanel.js";
import { periodsLayout, placeInRegion } from "../../common/view/ScreenLayout.js";
import { checkbox, fixed, label, READOUT_FONT, SMALL_FONT } from "../../common/view/viewUtils.js";
import { StringManager } from "../../i18n/StringManager.js";
import PlanetaryConfigurationsColors from "../../PlanetaryConfigurationsColors.js";
import type { PeriodsModel } from "../model/PeriodsModel.js";
import { PeriodCalculatorPanel } from "./PeriodCalculatorPanel.js";
import { PeriodsScreenSummaryContent } from "./PeriodsScreenSummaryContent.js";
import { SynodicPeriodChartNode } from "./SynodicPeriodChartNode.js";

export type PeriodsScreenViewOptions = ScreenViewOptions;

export class PeriodsScreenView extends ScreenView {
  public constructor(model: PeriodsModel, providedOptions?: PeriodsScreenViewOptions) {
    const options = optionize<PeriodsScreenViewOptions, EmptySelfOptions, ScreenViewOptions>()(
      { screenSummaryContent: new PeriodsScreenSummaryContent(model) },
      providedOptions,
    );
    super(options);

    const strings = StringManager.getInstance();
    const p = strings.getPeriodsStrings();
    const a11y = strings.getPeriodsA11yStrings().controls;
    const layout = periodsLayout(this.layoutBounds);

    const keypadDialog = new KeypadDialog({
      keypadLayout: Keypad.PositiveFloatingPointLayout,
      keypadOptions: { accumulatorOptions: { maxDigits: 8, maxDigitsRightOfMantissa: 4 } },
    });

    const calculator = new PeriodCalculatorPanel(model, keypadDialog, layout.calculator.width);
    const chart = new SynodicPeriodChartNode(model, layout.chart.width, layout.chart.height);

    // ── Marker readout and legend ────────────────────────────────────────────
    const markerReadout = new Text(
      new PatternStringProperty(p.markerPatternStringProperty, {
        a: new DerivedProperty([model.markerAProperty], (a) =>
          fixed(a, PERIODS_SCREEN_VIEW_SETTINGS.MARKER_READOUT_DECIMALS),
        ),
        p: new DerivedProperty([model.markerSiderealProperty], (v) =>
          fixed(v, PERIODS_SCREEN_VIEW_SETTINGS.MARKER_READOUT_DECIMALS),
        ),
        s: new DerivedProperty([model.markerSynodicProperty], (v) =>
          fixed(v, PERIODS_SCREEN_VIEW_SETTINGS.MARKER_READOUT_DECIMALS_SEGMENT_2),
        ),
      }),
      {
        font: READOUT_FONT,
        fill: PlanetaryConfigurationsColors.textColorProperty,
        maxWidth: layout.marker.width - PERIODS_SCREEN_VIEW_SETTINGS.MARKER_READOUT_MAX_WIDTH_OFFSET,
      },
    );
    const legendItem = (icon: Node, stringProperty: typeof p.synodicCurveStringProperty): HBox =>
      new HBox({
        spacing: PERIODS_SCREEN_VIEW_SETTINGS.LEGEND_ITEM_SPACING,
        children: [
          icon,
          label(stringProperty, { font: SMALL_FONT, maxWidth: PERIODS_SCREEN_VIEW_SETTINGS.LEGEND_ITEM_MAX_WIDTH }),
        ],
      });
    const lineIcon = (stroke: typeof PlanetaryConfigurationsColors.synodicCurveColorProperty, dashed: boolean): Line =>
      new Line(0, 0, PERIODS_SCREEN_VIEW_SETTINGS.LINE_ICON_END_X, 0, {
        stroke,
        lineWidth: PERIODS_SCREEN_VIEW_SETTINGS.LINE_ICON_LINE_WIDTH,
        lineDash: dashed
          ? [
              PERIODS_SCREEN_VIEW_SETTINGS.LINE_ICON_LINE_DASH_DASH,
              PERIODS_SCREEN_VIEW_SETTINGS.CONSTRUCTOR_LINE_ICON_LINE_DASH_DASH,
            ]
          : [],
      });
    const legend = new HBox({
      spacing: PERIODS_SCREEN_VIEW_SETTINGS.LEGEND_SPACING,
      children: [
        legendItem(
          lineIcon(PlanetaryConfigurationsColors.synodicCurveColorProperty, false),
          p.synodicCurveStringProperty,
        ),
        legendItem(
          lineIcon(PlanetaryConfigurationsColors.siderealCurveColorProperty, true),
          p.siderealCurveStringProperty,
        ),
        legendItem(
          new Path(
            new Shape()
              .moveTo(0, PERIODS_SCREEN_VIEW_SETTINGS.LEGEND_Y)
              .lineTo(PERIODS_SCREEN_VIEW_SETTINGS.LEGEND_X, 0)
              .lineTo(0, PERIODS_SCREEN_VIEW_SETTINGS.LEGEND_Y_SEGMENT_2)
              .lineTo(PERIODS_SCREEN_VIEW_SETTINGS.LEGEND_X_SEGMENT_2, 0)
              .close(),
            {
              fill: PlanetaryConfigurationsColors.calculatorPointColorProperty,
            },
          ),
          p.calculatorPointStringProperty,
        ),
      ],
    });
    const showSidereal = checkbox(
      model.showSiderealProperty,
      p.showSiderealStringProperty,
      a11y.showSiderealStringProperty,
    );
    const markerPanel = new PlanetaryConfigurationsPanel(
      new VBox({
        align: "left",
        spacing: PERIODS_SCREEN_VIEW_SETTINGS.MARKER_PANEL_SPACING,
        children: [
          new HBox({
            spacing: PERIODS_SCREEN_VIEW_SETTINGS.CONSTRUCTOR_MARKER_PANEL_SPACING,
            children: [
              label(p.markerStringProperty, { maxWidth: PERIODS_SCREEN_VIEW_SETTINGS.MARKER_PANEL_MAX_WIDTH }),
              markerReadout,
            ],
          }),
          legend,
          showSidereal,
        ],
      }),
      { align: "left", maxWidth: layout.marker.width - PERIODS_SCREEN_VIEW_SETTINGS.MARKER_PANEL_MAX_WIDTH_OFFSET },
    );

    const resetAllButton = new ResetAllButton({
      ...FLAT_RESET_ALL_BUTTON_OPTIONS,
      listener: () => {
        this.interruptSubtreeInput();
        model.reset();
      },
    });

    this.addChild(placeInRegion(calculator, layout.calculator, { xAlign: "left", yAlign: "top" }));
    this.addChild(placeInRegion(chart, layout.chart, { xAlign: "left", yAlign: "top" }));
    // The marker panel is capped 70 px narrower than its band, leaving the right end for Reset All.
    this.addChild(placeInRegion(markerPanel, layout.marker, { xAlign: "left", yAlign: "bottom" }));
    markerPanel.maxWidth = layout.marker.width - PERIODS_SCREEN_VIEW_SETTINGS.CONSTRUCTOR_MAX_WIDTH_OFFSET;
    this.addChild(placeInRegion(resetAllButton, layout.marker, { xAlign: "right", yAlign: "bottom" }));

    this.addChild(
      new Node({ pdomOrder: [...calculator.interactiveNodes, chart.markerNode, showSidereal, resetAllButton] }),
    );
  }
}
