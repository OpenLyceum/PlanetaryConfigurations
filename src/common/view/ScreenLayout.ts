/**
 * ScreenLayout.ts
 *
 * Splits a screen's layoutBounds into named rectangular regions that never overlap.
 * Every screen view places its content with {@link placeInRegion}, which centres
 * (or edge-aligns) a node inside its region and caps its size to the region, so
 * longer translations shrink instead of spilling onto a neighbour.
 *
 * Regions (default 1024 × 618 layout, 15 px margin, 12 px gaps):
 *
 *   Orbits / Configurations      Synodic Motion / Ptolemaic          Periods
 *   ┌──────────┐ ┌──────┐        ┌───────┐ ┌──────┐ ┌──────┐        ┌────┐ ┌───────────┐
 *   │   view   │ │panels│        │ view  │ │setup │ │reads │        │calc│ │   chart   │
 *   │ (square) │ └──────┘        └───────┘ └──────┘ └──────┘        │    │ └───────────┘
 *   │          │ ┌footer┐        ┌──────────────────┐ ┌────┐        │    │ ┌───────────┐
 *   └──────────┘ └──────┘        │   zodiac strip   │ │time│        └────┘ └──marker───┘
 *                                └──────────────────┘ └────┘
 */

import { Bounds2 } from "scenerystack/dot";
import { AlignBox, type Node } from "scenerystack/scenery";
import { REGION_GAP, SCREEN_VIEW_MARGIN } from "../../PlanetaryConfigurationsConstants.js";

/** Height of the bottom band holding the zodiac strip (header + sky band + history lane + caption). */
const STRIP_REGION_HEIGHT = 150;

/** Width of the bottom-right region holding the time controls and Reset All. */
const TIME_REGION_WIDTH = 196;

/** Width of the Periods calculator column. */
const CALCULATOR_REGION_WIDTH = 318;

/** Height of the Periods marker / legend band under the chart. */
const MARKER_REGION_HEIGHT = 112;

export type ViewAndPanelsLayout = {
  readonly view: Bounds2;
  readonly panels: Bounds2;
  /** Bottom of the panel column: time controls and Reset All. */
  readonly footer: Bounds2;
};

export type SkyLayout = {
  readonly view: Bounds2;
  readonly setup: Bounds2;
  readonly readouts: Bounds2;
  readonly strip: Bounds2;
  readonly time: Bounds2;
};

export type PeriodsLayout = {
  readonly calculator: Bounds2;
  readonly chart: Bounds2;
  readonly marker: Bounds2;
};

function inner(layoutBounds: Bounds2): Bounds2 {
  return layoutBounds.eroded(SCREEN_VIEW_MARGIN);
}

/** A square orbit view on the left; a panel column on the right with a footer below it. */
export function viewAndPanelsLayout(layoutBounds: Bounds2, footerHeight = 56): ViewAndPanelsLayout {
  const b = inner(layoutBounds);
  const size = b.height;
  const left = b.minX + size + REGION_GAP;
  const footerTop = b.maxY - footerHeight;
  return {
    view: new Bounds2(b.minX, b.minY, b.minX + size, b.maxY),
    panels: new Bounds2(left, b.minY, b.maxX, footerTop - REGION_GAP),
    footer: new Bounds2(left, footerTop, b.maxX, b.maxY),
  };
}

/**
 * A square orbit view, two panel columns beside it, and a full-width zodiac strip below
 * with the time controls to its right. `setupFraction` is the share of the panel width
 * given to the setup column.
 */
export function skyLayout(layoutBounds: Bounds2, setupFraction = 0.5): SkyLayout {
  const b = inner(layoutBounds);
  const stripTop = b.maxY - STRIP_REGION_HEIGHT;
  const topBottom = stripTop - REGION_GAP;
  const size = topBottom - b.minY;
  const panelsLeft = b.minX + size + REGION_GAP;
  const panelsWidth = b.maxX - panelsLeft - REGION_GAP;
  const setupRight = panelsLeft + Math.round(panelsWidth * setupFraction);
  const timeLeft = b.maxX - TIME_REGION_WIDTH;
  return {
    view: new Bounds2(b.minX, b.minY, b.minX + size, topBottom),
    setup: new Bounds2(panelsLeft, b.minY, setupRight, topBottom),
    readouts: new Bounds2(setupRight + REGION_GAP, b.minY, b.maxX, topBottom),
    strip: new Bounds2(b.minX, stripTop, timeLeft - REGION_GAP, b.maxY),
    time: new Bounds2(timeLeft, stripTop, b.maxX, b.maxY),
  };
}

/** The calculator column on the left, the chart top-right, and the marker band below the chart. */
export function periodsLayout(layoutBounds: Bounds2): PeriodsLayout {
  const b = inner(layoutBounds);
  const chartLeft = b.minX + CALCULATOR_REGION_WIDTH + REGION_GAP;
  const markerTop = b.maxY - MARKER_REGION_HEIGHT;
  return {
    calculator: new Bounds2(b.minX, b.minY, b.minX + CALCULATOR_REGION_WIDTH, b.maxY),
    chart: new Bounds2(chartLeft, b.minY, b.maxX, markerTop - REGION_GAP),
    marker: new Bounds2(chartLeft, markerTop, b.maxX, b.maxY),
  };
}

export type RegionAlign = {
  readonly xAlign?: "left" | "center" | "right";
  readonly yAlign?: "top" | "center" | "bottom";
};

/**
 * Wraps `content` in an AlignBox filling `region`, and caps the content's size to the
 * region so it can never extend into a neighbouring region.
 */
export function placeInRegion(content: Node, region: Bounds2, align: RegionAlign = {}): AlignBox {
  content.maxWidth = region.width;
  content.maxHeight = region.height;
  return new AlignBox(content, {
    alignBounds: region,
    xAlign: align.xAlign ?? "center",
    yAlign: align.yAlign ?? "center",
  });
}
