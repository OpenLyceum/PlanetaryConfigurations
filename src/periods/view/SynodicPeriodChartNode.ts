/**
 * SynodicPeriodChartNode.ts
 *
 * Period (yr) against distance from the Sun (AU, logarithmic) for planets seen from
 * Earth. The synodic-period curve S(a) diverges at Earth's orbit (a = 1 AU) and
 * approaches one year far from it (Q10); the dashed sidereal curve P = a^1.5 is shown
 * for comparison. Real planets sit on the S curve; the hypothetical planet can be
 * dragged along it (or moved with the arrow keys), and the calculator's planet is
 * marked with a diamond.
 */

import { DerivedProperty, Multilink, PatternStringProperty, Property } from "scenerystack/axon";
import { ChartRectangle, ChartTransform } from "scenerystack/bamboo";
import { Range, Vector2 } from "scenerystack/dot";
import { Shape } from "scenerystack/kite";
import { Circle, DragListener, Line, Node, type NodeOptions, Path, Text } from "scenerystack/scenery";
import { PhetFont } from "scenerystack/scenery-phet";
import { AccessibleSlider, type AccessibleSliderOptions } from "scenerystack/sun";
import { siderealPeriod, synodicPeriod } from "../../common/model/orbitalMath.js";
import { PlanetChoice } from "../../common/model/PlanetChoice.js";
import { fixed, label, SMALL_FONT } from "../../common/view/viewUtils.js";
import { StringManager } from "../../i18n/StringManager.js";
import PlanetaryConfigurationsColors, { PLANET_COLORS } from "../../PlanetaryConfigurationsColors.js";
import { MARKER_LOG_A_RANGE, type PeriodsModel } from "../model/PeriodsModel.js";

const Y_RANGE = new Range(0, 5);
const X_TICKS = [0.2, 0.3, 0.5, 1, 2, 3, 5, 10, 20, 30];
const MARGIN = { left: 50, right: 14, top: 28, bottom: 44 };
const CURVE_SAMPLES = 400;
const TICK_FONT = new PhetFont(11);

/** S(a) seen from Earth; infinite at a = 1 AU. */
function synodicAt(a: number): number {
  return synodicPeriod(1, siderealPeriod(a));
}

const AccessibleSliderNode = AccessibleSlider(Node, 0);

/** The draggable hypothetical planet; a slider for keyboard and screen-reader users. */
class ChartMarkerNode extends AccessibleSliderNode {
  public constructor(options: AccessibleSliderOptions & Pick<NodeOptions, "accessibleName" | "accessibleHelpText">) {
    super(options);
    this.addChild(
      new Circle(8, {
        fill: PlanetaryConfigurationsColors.hypotheticalColorProperty,
        stroke: PlanetaryConfigurationsColors.observerRingColorProperty,
        lineWidth: 2,
      }),
    );
    this.cursor = "ew-resize";
    this.mouseArea = this.localBounds.dilated(6);
    this.touchArea = this.localBounds.dilated(12);
  }
}

export class SynodicPeriodChartNode extends Node {
  public readonly markerNode: Node;

  public constructor(model: PeriodsModel, width: number, height: number) {
    super();
    const strings = StringManager.getInstance();
    const p = strings.getPeriodsStrings();
    const a11y = strings.getPeriodsA11yStrings();
    const viewWidth = width - MARGIN.left - MARGIN.right;
    const viewHeight = height - MARGIN.top - MARGIN.bottom;

    const transform = new ChartTransform({
      viewWidth,
      viewHeight,
      modelXRange: MARKER_LOG_A_RANGE,
      modelYRange: Y_RANGE,
    });
    const toView = (a: number, period: number): Vector2 =>
      new Vector2(transform.modelToViewX(Math.log10(a)), transform.modelToViewY(Math.min(period, Y_RANGE.max * 1.5)));

    const plot = new Node({ x: MARGIN.left, y: MARGIN.top });
    this.addChild(plot);

    plot.addChild(
      new ChartRectangle(transform, {
        fill: PlanetaryConfigurationsColors.viewBackgroundColorProperty,
        stroke: PlanetaryConfigurationsColors.viewBorderColorProperty,
      }),
    );

    // ── Grid and ticks (log x axis drawn by hand) ─────────────────────────────
    const grid = new Shape();
    for (const a of X_TICKS) {
      const x = transform.modelToViewX(Math.log10(a));
      grid.moveTo(x, 0).lineTo(x, viewHeight);
      const tick = new Text(fixed(a, a < 1 ? 1 : 0), {
        font: TICK_FONT,
        fill: PlanetaryConfigurationsColors.chartAxisColorProperty,
      });
      tick.centerX = x;
      tick.top = viewHeight + 4;
      plot.addChild(tick);
    }
    for (let y = 0; y <= Y_RANGE.max; y++) {
      const vy = transform.modelToViewY(y);
      grid.moveTo(0, vy).lineTo(viewWidth, vy);
      const tick = new Text(`${y}`, { font: TICK_FONT, fill: PlanetaryConfigurationsColors.chartAxisColorProperty });
      tick.right = -6;
      tick.centerY = vy;
      plot.addChild(tick);
    }
    plot.addChild(new Path(grid, { stroke: PlanetaryConfigurationsColors.chartGridColorProperty, lineWidth: 1 }));

    const xTitle = label(p.xAxisStringProperty, {
      maxWidth: viewWidth,
      fill: PlanetaryConfigurationsColors.chartAxisColorProperty,
    });
    xTitle.boundsProperty.link(() => {
      xTitle.centerX = viewWidth / 2;
      xTitle.top = viewHeight + 22;
    });
    const yTitle = label(p.yAxisStringProperty, {
      maxWidth: viewHeight,
      fill: PlanetaryConfigurationsColors.chartAxisColorProperty,
    });
    yTitle.rotation = -Math.PI / 2;
    yTitle.boundsProperty.link(() => {
      yTitle.centerY = viewHeight / 2;
      yTitle.right = -24;
    });
    plot.addChild(xTitle);
    plot.addChild(yTitle);

    const title = label(p.chartTitleStringProperty, {
      maxWidth: viewWidth,
      font: new PhetFont({ size: 14, weight: "bold" }),
    });
    title.boundsProperty.link(() => {
      title.centerX = MARGIN.left + viewWidth / 2;
      title.bottom = MARGIN.top - 6;
    });
    this.addChild(title);

    // ── Curves, clipped to the plot ────────────────────────────────────────────
    const curves = new Node({ clipArea: Shape.rectangle(0, 0, viewWidth, viewHeight) });
    plot.addChild(curves);

    const asymptotes = new Shape()
      .moveTo(transform.modelToViewX(0), 0)
      .lineTo(transform.modelToViewX(0), viewHeight)
      .moveTo(0, transform.modelToViewY(1))
      .lineTo(viewWidth, transform.modelToViewY(1));
    curves.addChild(
      new Path(asymptotes, {
        stroke: PlanetaryConfigurationsColors.asymptoteColorProperty,
        lineDash: [5, 4],
        lineWidth: 1,
      }),
    );

    const synodicShape = new Shape();
    const siderealShape = new Shape();
    let previousBranch = 0;
    for (let i = 0; i <= CURVE_SAMPLES; i++) {
      const logA = MARKER_LOG_A_RANGE.min + (i / CURVE_SAMPLES) * MARKER_LOG_A_RANGE.getLength();
      const a = 10 ** logA;
      const branch = a < 1 ? -1 : 1;
      if (Math.abs(a - 1) > 0.004) {
        const point = toView(a, synodicAt(a));
        if (branch !== previousBranch) {
          synodicShape.moveToPoint(point);
        } else {
          synodicShape.lineToPoint(point);
        }
        previousBranch = branch;
      }
      const sidereal = toView(a, siderealPeriod(a));
      if (i === 0) {
        siderealShape.moveToPoint(sidereal);
      } else {
        siderealShape.lineToPoint(sidereal);
      }
    }
    const siderealPath = new Path(siderealShape, {
      stroke: PlanetaryConfigurationsColors.siderealCurveColorProperty,
      lineWidth: 2,
      lineDash: [7, 5],
    });
    model.showSiderealProperty.linkAttribute(siderealPath, "visible");
    curves.addChild(siderealPath);
    curves.addChild(
      new Path(synodicShape, { stroke: PlanetaryConfigurationsColors.synodicCurveColorProperty, lineWidth: 2.5 }),
    );

    // ── Real planets on the S curve ────────────────────────────────────────────
    for (const planet of PlanetChoice.REAL_PLANETS) {
      const a = planet.axis(1);
      if (planet === PlanetChoice.EARTH) {
        const earthName = new Text(strings.getPlanetName("earth"), { font: SMALL_FONT, fill: PLANET_COLORS.earth });
        earthName.boundsProperty.link(() => {
          earthName.left = transform.modelToViewX(0) + 4;
          earthName.bottom = viewHeight - 4;
        });
        curves.addChild(earthName);
        continue;
      }
      const point = toView(a, synodicAt(a));
      const dot = new Circle(5, { fill: PLANET_COLORS[planet.key], center: point });
      const name = new Text(strings.getPlanetName(planet.key), {
        font: SMALL_FONT,
        fill: PlanetaryConfigurationsColors.textColorProperty,
        maxWidth: 70,
      });
      name.boundsProperty.link(() => {
        name.centerX = point.x;
        name.bottom = point.y - 7;
      });
      curves.addChild(dot);
      curves.addChild(name);
    }

    // ── Calculator point ───────────────────────────────────────────────────────
    const diamond = new Path(new Shape().moveTo(0, -8).lineTo(8, 0).lineTo(0, 8).lineTo(-8, 0).close(), {
      fill: PlanetaryConfigurationsColors.calculatorPointColorProperty,
      stroke: PlanetaryConfigurationsColors.observerRingColorProperty,
      lineWidth: 1,
    });
    curves.addChild(diamond);
    model.calculatorPointProperty.link((point) => {
      diamond.visible =
        point !== null && MARKER_LOG_A_RANGE.contains(Math.log10(point.a)) && point.synodic <= Y_RANGE.max;
      if (point !== null) {
        diamond.translation = toView(point.a, point.synodic);
      }
    });

    // ── Draggable hypothetical planet ──────────────────────────────────────────
    const valueText = new PatternStringProperty(a11y.markerValuePatternStringProperty, {
      a: new DerivedProperty([model.markerAProperty], (a) => fixed(a, 2)),
      s: new DerivedProperty([model.markerSynodicProperty], (s) => fixed(s, 2)),
    });
    const marker = new ChartMarkerNode({
      valueProperty: model.markerLogAProperty,
      enabledRangeProperty: new Property(MARKER_LOG_A_RANGE),
      keyboardStep: 0.02,
      shiftKeyboardStep: 0.005,
      pageKeyboardStep: 0.1,
      accessibleName: a11y.controls.markerStringProperty,
      accessibleHelpText: a11y.controls.markerHelpStringProperty,
      pdomCreateAriaValueText: () => valueText.value,
      pdomDependencies: [valueText],
    });
    marker.addInputListener(
      new DragListener({
        drag: (event) => {
          const local = plot.globalToLocalPoint(event.pointer.point);
          model.markerLogAProperty.value = MARKER_LOG_A_RANGE.constrainValue(transform.viewToModelX(local.x));
        },
      }),
    );
    const guide = new Line(0, 0, 0, 0, {
      stroke: PlanetaryConfigurationsColors.hypotheticalColorProperty,
      lineDash: [2, 3],
    });
    plot.addChild(guide);
    plot.addChild(marker);
    this.markerNode = marker;
    Multilink.multilink([model.markerAProperty, model.markerSynodicProperty], (a, s) => {
      const point = toView(a, Math.min(s, Y_RANGE.max));
      marker.translation = point;
      guide.setLine(point.x, point.y, point.x, viewHeight);
    });
  }
}
