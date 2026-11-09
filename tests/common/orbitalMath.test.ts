import { Vector2 } from "scenerystack/dot";
import { describe, expect, it } from "vitest";
import {
  apparentLongitude,
  greatestElongation,
  orbitalSpeed,
  retrogradeDuration,
  semimajorAxis,
  siderealFromSynodic,
  siderealPeriod,
  signedElongation,
  sunLongitude,
  synodicFromSidereal,
  synodicPeriod,
  toDegrees,
  toRadians,
  wrapPi,
  yearsToDays,
} from "../../src/common/model/orbitalMath.js";
import { PlanetChoice } from "../../src/common/model/PlanetChoice.js";

const A = {
  mercury: 0.387,
  venus: 0.723,
  mars: 1.524,
  jupiter: 5.203,
  saturn: 9.537,
};

function synodicDaysFromEarth(a: number): number {
  return yearsToDays(synodicPeriod(1, siderealPeriod(a)));
}

describe("Kepler's third law and speeds", () => {
  it("gives P = a^1.5", () => {
    expect(siderealPeriod(1)).toBe(1);
    expect(siderealPeriod(A.mars)).toBeCloseTo(1.8814, 3);
    expect(siderealPeriod(A.jupiter)).toBeCloseTo(11.868, 2);
    expect(semimajorAxis(siderealPeriod(A.saturn))).toBeCloseTo(A.saturn, 10);
  });

  it("gives slower orbits farther from the Sun (Q1)", () => {
    expect(orbitalSpeed(1)).toBeCloseTo(29.78, 2);
    expect(orbitalSpeed(A.mercury)).toBeCloseTo(47.87, 1);
    expect(orbitalSpeed(A.saturn)).toBeCloseTo(9.64, 1);
  });

  it("uses the handout's semimajor axes", () => {
    expect(PlanetChoice.REAL_PLANETS.map((p) => p.semimajorAxis)).toEqual([0.387, 0.723, 1, 1.524, 5.203, 9.537]);
  });
});

describe("synodic periods seen from Earth (circular orbits)", () => {
  it.each([
    ["Mercury", A.mercury, 115.8],
    ["Venus", A.venus, 582.9],
    ["Mars", A.mars, 779.7],
    ["Jupiter", A.jupiter, 398.9],
    ["Saturn", A.saturn, 378.1],
  ])("%s", (_name, a, days) => {
    expect(synodicDaysFromEarth(a)).toBeCloseTo(days, 0);
  });

  it("approaches one year for distant planets (Q10)", () => {
    expect(synodicPeriod(1, siderealPeriod(100))).toBeCloseTo(1.001, 3);
  });

  it("is symmetric: Earth seen from Mars equals Mars seen from Earth (Q12)", () => {
    expect(synodicPeriod(siderealPeriod(A.mars), 1)).toBe(synodicPeriod(1, siderealPeriod(A.mars)));
  });

  it("is infinite for equal orbits", () => {
    expect(synodicPeriod(2, 2)).toBe(Number.POSITIVE_INFINITY);
  });
});

describe("sidereal ↔ synodic (Q13)", () => {
  it("reproduces the handout's Jupiter example: S = 1.09 yr gives P ≈ 12 yr", () => {
    expect(siderealFromSynodic(1.09, false)).toBeCloseTo(12.11, 2);
  });

  it("round-trips every planet", () => {
    for (const a of Object.values(A)) {
      const inferior = a < 1;
      const p = siderealPeriod(a);
      const s = synodicFromSidereal(p, inferior);
      expect(s).not.toBeNull();
      expect(siderealFromSynodic(s ?? 0, inferior)).toBeCloseTo(p, 10);
    }
  });

  it("has no superior solution for S ≤ 1 yr and no inferior solution for P ≥ 1 yr", () => {
    expect(siderealFromSynodic(0.9, false)).toBeNull();
    expect(siderealFromSynodic(1, false)).toBeNull();
    expect(synodicFromSidereal(1.5, true)).toBeNull();
    expect(siderealFromSynodic(0, true)).toBeNull();
  });
});

describe("elongation sign convention", () => {
  const earth = new Vector2(1, 0);

  it("puts the Sun at longitude 180° when Earth is at heliocentric longitude 0°", () => {
    expect(toDegrees(sunLongitude(earth))).toBeCloseTo(180, 10);
  });

  it("is east (positive) below the Sun–Earth line and west above it", () => {
    expect(signedElongation(earth, new Vector2(0, -2))).toBeGreaterThan(0);
    expect(signedElongation(earth, new Vector2(0, 2))).toBeLessThan(0);
    expect(signedElongation(earth, new Vector2(0.3, -0.5))).toBeGreaterThan(0);
    expect(signedElongation(earth, new Vector2(0.3, 0.5))).toBeLessThan(0);
  });

  it("is 180° at opposition and 0° at conjunction", () => {
    expect(Math.abs(toDegrees(signedElongation(earth, new Vector2(2, 0))))).toBeCloseTo(180, 10);
    expect(toDegrees(signedElongation(earth, new Vector2(-2, 0)))).toBeCloseTo(0, 10);
  });

  it("gives the apparent longitude of a planet against the stars", () => {
    expect(toDegrees(apparentLongitude(earth, new Vector2(1, 1)))).toBeCloseTo(90, 10);
  });

  it("wraps into (−π, π]", () => {
    expect(wrapPi(toRadians(270))).toBeCloseTo(toRadians(-90), 12);
    expect(wrapPi(Math.PI)).toBeCloseTo(Math.PI, 12);
  });
});

describe("greatest elongation and retrograde", () => {
  it("is asin(a) for Mercury and Venus seen from Earth (Q6, Q7)", () => {
    expect(toDegrees(greatestElongation(A.mercury, 1))).toBeCloseTo(22.77, 2);
    expect(toDegrees(greatestElongation(A.venus, 1))).toBeCloseTo(46.3, 2);
  });

  it("is 41° for Earth seen from Mars (Q12)", () => {
    expect(toDegrees(greatestElongation(1, A.mars))).toBeCloseTo(41.01, 2);
  });

  it.each([
    ["Mercury", A.mercury, 22.9],
    ["Venus", A.venus, 42.1],
    ["Mars", A.mars, 72.7],
    ["Jupiter", A.jupiter, 120.6],
    ["Saturn", A.saturn, 137.6],
  ])("retrograde length of %s from Earth", (_name, a, days) => {
    expect(yearsToDays(retrogradeDuration(1, a))).toBeCloseTo(days, 0);
  });
});
