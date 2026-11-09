import { describe, expect, it } from "vitest";
import { PlanetType } from "../../src/common/model/PlanetType.js";
import { PtolemaicModel, PtolemaicPreset } from "../../src/ptolemaic/model/PtolemaicModel.js";

/** Fraction of `days` (sampled daily) during which the planet moves retrograde. */
function retrogradeFraction(model: PtolemaicModel, days: number): number {
  let retrograde = 0;
  for (let day = 0; day < days; day++) {
    model.timeProperty.value = day;
    if (model.isRetrogradeProperty.value) {
      retrograde++;
    }
  }
  return retrograde / days;
}

describe("PtolemaicModel", () => {
  it("starts on the Mars preset", () => {
    const model = new PtolemaicModel();
    expect(model.presetProperty.value).toBe(PtolemaicPreset.MARS);
    expect(model.epicycleSizeProperty.value).toBe(PtolemaicPreset.MARS.epicycleSize);
  });

  it("puts the equant opposite Earth across the deferent centre", () => {
    const g = new PtolemaicModel().geometryProperty.value;
    expect(g.equant.x).toBeCloseTo(2 * g.deferentCenter.x, 12);
    expect(g.equant.y).toBeCloseTo(2 * g.deferentCenter.y, 12);
  });

  it("keeps the epicycle centre on the deferent", () => {
    const model = new PtolemaicModel();
    for (const t of [0, 50, 300, 777]) {
      model.timeProperty.value = t;
      const g = model.geometryProperty.value;
      expect(g.epicycleCenter.distance(g.deferentCenter)).toBeCloseTo(1, 10);
    }
  });

  it("keeps a superior planet's epicycle radius parallel to the Earth–Sun line", () => {
    const model = new PtolemaicModel();
    model.timeProperty.value = 123;
    const g = model.geometryProperty.value;
    const radius = g.planet.minus(g.epicycleCenter).normalized();
    const sun = g.sun.normalized();
    expect(radius.dot(sun)).toBeCloseTo(1, 10);
  });

  it("keeps an inferior planet's epicycle centre on the Earth–Sun line (no eccentricity)", () => {
    const model = new PtolemaicModel();
    model.presetProperty.value = PtolemaicPreset.VENUS;
    model.eccentricityProperty.value = 0;
    model.timeProperty.value = 200;
    const g = model.geometryProperty.value;
    expect(g.epicycleCenter.normalized().dot(g.sun.normalized())).toBeCloseTo(1, 10);
  });

  it("produces retrograde motion for Mars, and none without an epicycle", () => {
    const model = new PtolemaicModel();
    const fraction = retrogradeFraction(model, 1560);
    expect(fraction).toBeGreaterThan(0.03);
    expect(fraction).toBeLessThan(0.2);
    model.epicycleSizeProperty.value = 0;
    expect(retrogradeFraction(model, 800)).toBe(0);
  });

  it("switches to Custom when a parameter moves, and back when a preset is chosen", () => {
    const model = new PtolemaicModel();
    model.epicycleSizeProperty.value = 0.4;
    expect(model.presetProperty.value).toBe(PtolemaicPreset.CUSTOM);
    model.presetProperty.value = PtolemaicPreset.JUPITER;
    expect(model.epicycleSizeProperty.value).toBe(PtolemaicPreset.JUPITER.epicycleSize);
    expect(model.planetTypeProperty.value).toBe(PlanetType.SUPERIOR);
  });

  it("derives the path from time", () => {
    const model = new PtolemaicModel();
    model.timeProperty.value = 400;
    const path = model.pathProperty.value;
    const last = path[path.length - 1];
    expect(last?.x).toBeCloseTo(model.geometryProperty.value.planet.x, 10);
  });

  it("resets", () => {
    const model = new PtolemaicModel();
    model.presetProperty.value = PtolemaicPreset.SATURN;
    model.timeProperty.value = 99;
    model.reset();
    expect(model.presetProperty.value).toBe(PtolemaicPreset.MARS);
    expect(model.motionRateProperty.value).toBe(PtolemaicPreset.MARS.motionRate);
    expect(model.timeProperty.value).toBe(0);
  });
});
