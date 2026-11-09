import { describe, expect, it } from "vitest";
import { PlanetType } from "../../src/common/model/PlanetType.js";
import { PeriodsModel, SolveFor, TimeUnit } from "../../src/periods/model/PeriodsModel.js";

describe("PeriodsModel", () => {
  it("opens on the handout's Jupiter example: S = 1.09 yr gives P ≈ 12 yr", () => {
    const model = new PeriodsModel();
    expect(model.resultYearsProperty.value).toBeCloseTo(12.11, 2);
    expect(model.calculatorPointProperty.value?.a).toBeCloseTo(5.27, 2);
  });

  it("solves an inferior planet from a synodic period in days (Q13, Mercury)", () => {
    const model = new PeriodsModel();
    model.planetTypeProperty.value = PlanetType.INFERIOR;
    model.unitProperty.value = TimeUnit.DAYS;
    model.inputProperty.value = 115.8;
    expect(model.resultYearsProperty.value).toBeCloseTo(0.2408, 3);
  });

  it("converts the input when the unit changes", () => {
    const model = new PeriodsModel();
    model.unitProperty.value = TimeUnit.DAYS;
    expect(model.inputProperty.value).toBeCloseTo(1.09 * 365.25, 8);
    expect(model.resultYearsProperty.value).toBeCloseTo(12.11, 2);
  });

  it("computes S from P", () => {
    const model = new PeriodsModel();
    model.solveForProperty.value = SolveFor.SYNODIC;
    model.inputProperty.value = 1.8814;
    expect(model.resultYearsProperty.value).toBeCloseTo(2.1345, 3);
  });

  it("reports no solution for a superior planet with S < 1 yr", () => {
    const model = new PeriodsModel();
    model.inputProperty.value = 0.8;
    expect(model.resultYearsProperty.value).toBeNull();
    expect(model.calculatorPointProperty.value).toBeNull();
  });

  it("places the hypothetical planet on the synodic curve", () => {
    const model = new PeriodsModel();
    model.markerLogAProperty.value = Math.log10(1.524);
    expect(model.markerSynodicProperty.value).toBeCloseTo(2.1345, 3);
  });

  it("resets without rescaling the input", () => {
    const model = new PeriodsModel();
    model.unitProperty.value = TimeUnit.DAYS;
    model.inputProperty.value = 500;
    model.reset();
    expect(model.unitProperty.value).toBe(TimeUnit.YEARS);
    expect(model.inputProperty.value).toBe(1.09);
  });
});
