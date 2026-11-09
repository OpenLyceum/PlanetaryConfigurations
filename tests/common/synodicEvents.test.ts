import { describe, expect, it } from "vitest";
import { ConfigurationEvent } from "../../src/common/model/ConfigurationEvent.js";
import {
  apparentLongitude,
  apparentMotionRate,
  heliocentricLongitude,
  heliocentricPosition,
  signedElongation,
  toDegrees,
  yearsToDays,
} from "../../src/common/model/orbitalMath.js";
import {
  eventAt,
  eventPhases,
  nextEvent,
  type PlanetPair,
  pairSynodicPeriod,
  previousEvent,
} from "../../src/common/model/synodicEvents.js";

function pair(aObserver: number, aTarget: number, observerEpoch = 0.4, targetEpoch = 2.1): PlanetPair {
  return { aObserver, aTarget, observerEpochLongitude: observerEpoch, targetEpochLongitude: targetEpoch };
}

function elongationDegrees(p: PlanetPair, t: number): number {
  const o = heliocentricPosition(p.aObserver, heliocentricLongitude(p.aObserver, p.observerEpochLongitude, t));
  const g = heliocentricPosition(p.aTarget, heliocentricLongitude(p.aTarget, p.targetEpochLongitude, t));
  return toDegrees(signedElongation(o, g));
}

function apparentLongitudeAt(p: PlanetPair, t: number): number {
  const o = heliocentricPosition(p.aObserver, heliocentricLongitude(p.aObserver, p.observerEpochLongitude, t));
  const g = heliocentricPosition(p.aTarget, heliocentricLongitude(p.aTarget, p.targetEpochLongitude, t));
  return apparentLongitude(o, g);
}

/** Time (yr) of the first occurrence of `event` strictly after t. */
function nextOf(p: PlanetPair, t: number, event: ConfigurationEvent): number {
  let time = t;
  for (let i = 0; i < 20; i++) {
    const next = nextEvent(p, time);
    if (next === null) {
      break;
    }
    time = next.time;
    if (next.event === event) {
      return time;
    }
  }
  throw new Error(`no ${event.key} after ${t}`);
}

const MERCURY = pair(1, 0.387);
const MARS = pair(1, 1.524);

describe("event order", () => {
  it("lists the inferior configurations in cycle order", () => {
    expect(eventPhases(1, 0.723).map((e) => e.event)).toEqual([
      ConfigurationEvent.INFERIOR_CONJUNCTION,
      ConfigurationEvent.RETROGRADE_ENDS,
      ConfigurationEvent.GREATEST_ELONGATION_WEST,
      ConfigurationEvent.SUPERIOR_CONJUNCTION,
      ConfigurationEvent.GREATEST_ELONGATION_EAST,
      ConfigurationEvent.RETROGRADE_BEGINS,
    ]);
  });

  it("lists the superior configurations in cycle order", () => {
    expect(eventPhases(1, 1.524).map((e) => e.event)).toEqual([
      ConfigurationEvent.OPPOSITION,
      ConfigurationEvent.RETROGRADE_ENDS,
      ConfigurationEvent.QUADRATURE_EAST,
      ConfigurationEvent.CONJUNCTION,
      ConfigurationEvent.QUADRATURE_WEST,
      ConfigurationEvent.RETROGRADE_BEGINS,
    ]);
  });
});

describe("event geometry", () => {
  it("has elongation 0° at conjunctions and 180° at opposition", () => {
    let t = 0;
    for (let i = 0; i < 12; i++) {
      const next = nextEvent(MARS, t);
      expect(next).not.toBeNull();
      if (next === null) {
        return;
      }
      t = next.time;
      const e = elongationDegrees(MARS, t);
      if (next.event === ConfigurationEvent.CONJUNCTION) {
        expect(e).toBeCloseTo(0, 6);
      } else if (next.event === ConfigurationEvent.OPPOSITION) {
        expect(Math.abs(e)).toBeCloseTo(180, 6);
      } else if (next.event === ConfigurationEvent.QUADRATURE_EAST) {
        expect(e).toBeCloseTo(90, 6);
      } else if (next.event === ConfigurationEvent.QUADRATURE_WEST) {
        expect(e).toBeCloseTo(-90, 6);
      }
    }
  });

  it("reaches ±asin(a) at greatest elongation, east and west", () => {
    const venus = pair(1, 0.723);
    let t = 0;
    let checked = 0;
    for (let i = 0; i < 12; i++) {
      const next = nextEvent(venus, t);
      if (next === null) {
        return;
      }
      t = next.time;
      if (next.event === ConfigurationEvent.GREATEST_ELONGATION_EAST) {
        expect(elongationDegrees(venus, t)).toBeCloseTo(46.3, 1);
        checked++;
      } else if (next.event === ConfigurationEvent.GREATEST_ELONGATION_WEST) {
        expect(elongationDegrees(venus, t)).toBeCloseTo(-46.3, 1);
        checked++;
      }
    }
    expect(checked).toBeGreaterThanOrEqual(3);
  });
});

describe("event timing", () => {
  it("repeats each configuration after one synodic period (Q4)", () => {
    const first = nextOf(MERCURY, 0, ConfigurationEvent.SUPERIOR_CONJUNCTION);
    const second = nextOf(MERCURY, first, ConfigurationEvent.SUPERIOR_CONJUNCTION);
    expect(yearsToDays(second - first)).toBeCloseTo(115.8, 0);
  });

  it("returns strictly later and strictly earlier events", () => {
    const next = nextEvent(MARS, 0.5);
    expect(next?.time).toBeGreaterThan(0.5);
    const again = nextEvent(MARS, next?.time ?? 0);
    expect(again?.time).toBeGreaterThan(next?.time ?? 0);
    const back = previousEvent(MARS, next?.time ?? 0);
    expect(back?.time).toBeLessThan(next?.time ?? 0);
    expect(nextEvent(MARS, back?.time ?? 0)?.time).toBeCloseTo(next?.time ?? 0, 10);
  });

  it("finds the event at a time within the tolerance", () => {
    const next = nextEvent(MARS, 0.2);
    expect(eventAt(MARS, (next?.time ?? 0) + 0.001, 0.002)).toBe(next?.event);
    expect(eventAt(MARS, (next?.time ?? 0) + 0.05, 0.002)).toBeNull();
  });

  it("gives Mars retrograde 353.5 d after conjunction, lasting 72.7 d (Q16)", () => {
    const conjunctionTime = nextOf(MARS, 0, ConfigurationEvent.CONJUNCTION);
    const begins = nextOf(MARS, conjunctionTime, ConfigurationEvent.RETROGRADE_BEGINS);
    const ends = nextOf(MARS, begins, ConfigurationEvent.RETROGRADE_ENDS);
    expect(yearsToDays(begins - conjunctionTime)).toBeCloseTo(353.5, 0);
    expect(yearsToDays(ends - begins)).toBeCloseTo(72.7, 0);
  });

  it("matches a numerical derivative of the apparent longitude at the stations", () => {
    const begins = nextEvent(MARS, 0, { configurations: false, stationaryPoints: true });
    const t = begins?.time ?? 0;
    const h = 1e-5;
    const rate = (apparentLongitudeAt(MARS, t + h) - apparentLongitudeAt(MARS, t - h)) / (2 * h);
    expect(Math.abs(rate)).toBeLessThan(1e-3);
    expect(apparentMotionRate(1, 1.524, Math.PI)).toBeGreaterThan(0);
    expect(apparentMotionRate(1, 1.524, 0)).toBeLessThan(0);
  });

  it("returns no events for equal orbits", () => {
    expect(nextEvent(pair(1, 1), 0)).toBeNull();
    expect(Number.isFinite(pairSynodicPeriod(pair(1, 1)))).toBe(false);
  });
});
