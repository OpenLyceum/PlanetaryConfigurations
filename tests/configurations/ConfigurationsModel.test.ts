import { describe, expect, it } from "vitest";
import { ConfigurationEvent } from "../../src/common/model/ConfigurationEvent.js";
import { mod2pi, toDegrees, toRadians } from "../../src/common/model/orbitalMath.js";
import { PlanetType } from "../../src/common/model/PlanetType.js";
import { ConfigurationsModel } from "../../src/configurations/model/ConfigurationsModel.js";

/** Every heliocentric longitude (deg, 0.05° steps) at which the planet's elongation is `target` degrees. */
function longitudesWithElongation(model: ConfigurationsModel, targetDegrees: number): number[] {
  const hits: number[] = [];
  model.snapProperty.value = false;
  for (let i = 0; i < 7200; i++) {
    model.setPlanetLongitude(toRadians(i * 0.05));
    if (Math.abs(toDegrees(model.elongationProperty.value) - targetDegrees) < 0.04) {
      hits.push(i * 0.05);
    }
  }
  // Merge neighbouring hits into one solution each.
  return hits.filter((h, i) => i === 0 || h - (hits[i - 1] ?? 0) > 1);
}

describe("ConfigurationsModel", () => {
  it("keeps Earth directly below the Sun", () => {
    const model = new ConfigurationsModel();
    expect(model.earthPosition.x).toBeCloseTo(0, 12);
    expect(model.earthPosition.y).toBeCloseTo(-1, 12);
  });

  it("names the superior configurations of Q2", () => {
    const model = new ConfigurationsModel();
    model.planetTypeProperty.value = PlanetType.SUPERIOR;
    const positions = model.configurationPositionsProperty.value;
    for (const { event, position } of positions) {
      model.snapProperty.value = false;
      model.setPlanetLongitude(Math.atan2(position.y, position.x));
      expect(model.configurationProperty.value).toBe(event);
      const e = toDegrees(model.elongationProperty.value);
      if (event === ConfigurationEvent.OPPOSITION) {
        expect(Math.abs(e)).toBeCloseTo(180, 6);
      } else if (event === ConfigurationEvent.CONJUNCTION) {
        expect(e).toBeCloseTo(0, 6);
      } else if (event === ConfigurationEvent.QUADRATURE_WEST) {
        expect(e).toBeCloseTo(-90, 6);
      } else {
        expect(e).toBeCloseTo(90, 6);
      }
    }
  });

  it("puts East 120° at exactly one place on a superior orbit (Q2 location D)", () => {
    const model = new ConfigurationsModel();
    expect(longitudesWithElongation(model, 120).length).toBe(1);
  });

  it("puts West 20° at two places on an inferior orbit (Q3 location D)", () => {
    const model = new ConfigurationsModel();
    model.planetTypeProperty.value = PlanetType.INFERIOR;
    expect(longitudesWithElongation(model, -20).length).toBe(2);
  });

  it("places inferior conjunction between Earth and the Sun and superior conjunction beyond it (Q3)", () => {
    const model = new ConfigurationsModel();
    model.planetTypeProperty.value = PlanetType.INFERIOR;
    const byEvent = new Map(model.configurationPositionsProperty.value.map((c) => [c.event, c.position]));
    expect(byEvent.get(ConfigurationEvent.INFERIOR_CONJUNCTION)?.y).toBeLessThan(0);
    expect(byEvent.get(ConfigurationEvent.SUPERIOR_CONJUNCTION)?.y).toBeGreaterThan(0);
    expect(byEvent.get(ConfigurationEvent.GREATEST_ELONGATION_EAST)?.x).toBeLessThan(0);
  });

  it("snaps a drag to a nearby configuration", () => {
    const model = new ConfigurationsModel();
    const opposition = model.configurationPositionsProperty.value.find(
      (c) => c.event === ConfigurationEvent.OPPOSITION,
    );
    const longitude = Math.atan2(opposition?.position.y ?? 0, opposition?.position.x ?? 0);
    model.setPlanetLongitude(longitude + toRadians(2));
    expect(model.configurationProperty.value).toBe(ConfigurationEvent.OPPOSITION);
    model.rotatePlanet(toRadians(5));
    expect(model.configurationProperty.value).toBeNull();
    expect(mod2pi(model.planetLongitudeProperty.value)).toBeCloseTo(mod2pi(longitude + toRadians(5)), 10);
  });

  it("resets", () => {
    const model = new ConfigurationsModel();
    model.planetTypeProperty.value = PlanetType.INFERIOR;
    model.rotatePlanet(1);
    model.reset();
    expect(model.planetTypeProperty.value).toBe(PlanetType.SUPERIOR);
    expect(toDegrees(model.planetLongitudeProperty.value)).toBeCloseTo(20, 10);
  });
});
