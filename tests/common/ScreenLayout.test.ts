import { Bounds2 } from "scenerystack/dot";
import { describe, expect, it } from "vitest";
import { periodsLayout, skyLayout, viewAndPanelsLayout } from "../../src/common/view/ScreenLayout.js";

const LAYOUT = new Bounds2(0, 0, 1024, 618);

function expectDisjointAndInside(regions: Record<string, Bounds2>): void {
  const entries = Object.entries(regions);
  for (const [name, region] of entries) {
    expect(LAYOUT.containsBounds(region), `${name} inside layoutBounds`).toBe(true);
    expect(region.width, `${name} width`).toBeGreaterThan(0);
    expect(region.height, `${name} height`).toBeGreaterThan(0);
  }
  for (let i = 0; i < entries.length; i++) {
    for (let j = i + 1; j < entries.length; j++) {
      const [a, ra] = entries[i] ?? ["", Bounds2.NOTHING];
      const [b, rb] = entries[j] ?? ["", Bounds2.NOTHING];
      const overlap = ra.intersection(rb);
      expect(overlap.isEmpty() || overlap.width <= 0 || overlap.height <= 0, `${a} vs ${b}`).toBe(true);
    }
  }
}

describe("ScreenLayout", () => {
  it("keeps the view, panels and footer apart", () => {
    expectDisjointAndInside({ ...viewAndPanelsLayout(LAYOUT) });
  });

  it("keeps the sky-screen regions apart", () => {
    expectDisjointAndInside({ ...skyLayout(LAYOUT) });
    expectDisjointAndInside({ ...skyLayout(LAYOUT, 0.6) });
  });

  it("keeps the Periods regions apart", () => {
    expectDisjointAndInside({ ...periodsLayout(LAYOUT) });
  });

  it("makes the orbit views square", () => {
    const view = skyLayout(LAYOUT).view;
    expect(view.width).toBeCloseTo(view.height, 10);
    const big = viewAndPanelsLayout(LAYOUT).view;
    expect(big.width).toBeCloseTo(big.height, 10);
  });
});
