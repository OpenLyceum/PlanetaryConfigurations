import { describe, expect, it } from "vitest";
import { ConfigurationEvent } from "../../src/common/model/ConfigurationEvent.js";
import { mod2pi, wrapPi, yearsToDays } from "../../src/common/model/orbitalMath.js";
import { PlanetChoice } from "../../src/common/model/PlanetChoice.js";
import { SynodicMotionModel } from "../../src/synodic/model/SynodicMotionModel.js";

/** Plays until playback pauses (at an enabled event), returning the counter in days. */
function playUntilPause(model: SynodicMotionModel, maxSeconds = 600): number {
  model.isPlayingProperty.value = true;
  for (let i = 0; i < maxSeconds * 60 && model.isPlayingProperty.value; i++) {
    model.step(1 / 60);
  }
  return yearsToDays(model.elapsedProperty.value);
}

/** Jumps forward until `event` is the current configuration. */
function jumpTo(model: SynodicMotionModel, event: ConfigurationEvent): void {
  for (let i = 0; i < 20; i++) {
    model.jumpToNextEvent();
    if (model.currentEventProperty.value === event) {
      return;
    }
  }
  throw new Error(`never reached ${event.key}`);
}

describe("SynodicMotionModel", () => {
  it("starts with Earth observing Mars at t = 0", () => {
    const model = new SynodicMotionModel();
    expect(model.observerChoiceProperty.value).toBe(PlanetChoice.EARTH);
    expect(model.targetChoiceProperty.value).toBe(PlanetChoice.MARS);
    expect(model.timeProperty.value).toBe(0);
  });

  it("measures Mercury's synodic period with Pause at configurations (Q4)", () => {
    const model = new SynodicMotionModel();
    model.targetChoiceProperty.value = PlanetChoice.MERCURY;
    jumpTo(model, ConfigurationEvent.SUPERIOR_CONJUNCTION);
    model.zeroCounter();
    model.pauseAtConfigurationsProperty.value = true;
    let days = 0;
    for (let i = 0; i < 4; i++) {
      days = playUntilPause(model);
    }
    expect(model.currentEventProperty.value).toBe(ConfigurationEvent.SUPERIOR_CONJUNCTION);
    expect(days).toBeCloseTo(115.8, 0);
  });

  it("measures Venus's synodic period between two greatest eastern elongations (Q6)", () => {
    const model = new SynodicMotionModel();
    model.targetChoiceProperty.value = PlanetChoice.VENUS;
    jumpTo(model, ConfigurationEvent.GREATEST_ELONGATION_EAST);
    expect((model.elongationProperty.value * 180) / Math.PI).toBeCloseTo(46.3, 1);
    model.zeroCounter();
    jumpTo(model, ConfigurationEvent.GREATEST_ELONGATION_EAST);
    expect(yearsToDays(model.elapsedProperty.value)).toBeCloseTo(582.9, 0);
  });

  it("gives Earth seen from Mars the same synodic period as Mars seen from Earth (Q12)", () => {
    const model = new SynodicMotionModel();
    model.observerChoiceProperty.value = PlanetChoice.MARS; // swaps: target becomes Earth
    expect(model.targetChoiceProperty.value).toBe(PlanetChoice.EARTH);
    jumpTo(model, ConfigurationEvent.SUPERIOR_CONJUNCTION);
    model.zeroCounter();
    jumpTo(model, ConfigurationEvent.SUPERIOR_CONJUNCTION);
    expect(yearsToDays(model.elapsedProperty.value)).toBeCloseTo(779.7, 0);
  });

  it("returns the Sun to the same zodiac place in Mars's sky after one Martian year (Q14)", () => {
    const model = new SynodicMotionModel();
    model.observerChoiceProperty.value = PlanetChoice.MARS;
    model.zeroCounter();
    const start = model.referenceSunLongitudeProperty.value ?? 0;
    // Step day by day until the Sun comes back to the reference longitude.
    let previous = 0;
    for (let day = 1; day < 800; day++) {
      model.stepForward();
      const offset = mod2pi(model.sunApparentLongitudeProperty.value - start);
      if (day > 30 && offset < previous) {
        break;
      }
      previous = offset;
    }
    expect(yearsToDays(model.elapsedProperty.value)).toBeCloseTo(687, -1);
  });

  it("returns Mars to the same zodiac place 711 d after conjunction (Q15: neither period)", () => {
    const model = new SynodicMotionModel();
    jumpTo(model, ConfigurationEvent.CONJUNCTION);
    model.zeroCounter();
    const start = model.targetApparentLongitudeProperty.value;
    let crossings = 0;
    let previous = 0;
    for (let day = 1; day < 1000; day++) {
      model.stepForward();
      const offset = wrapPi(model.targetApparentLongitudeProperty.value - start);
      if (day > 30 && previous < 0 && offset >= 0) {
        crossings++;
        break;
      }
      previous = offset;
    }
    expect(crossings).toBe(1);
    expect(yearsToDays(model.elapsedProperty.value)).toBeCloseTo(711, -1);
  });

  it("pauses at the start of Mars's retrograde loop and flags retrograde motion (Q16)", () => {
    const model = new SynodicMotionModel();
    jumpTo(model, ConfigurationEvent.CONJUNCTION);
    model.zeroCounter();
    model.pauseAtStationaryProperty.value = true;
    expect(playUntilPause(model)).toBeCloseTo(353.5, 0);
    expect(model.isRetrogradeProperty.value).toBe(false);
    model.stepForward();
    expect(model.isRetrogradeProperty.value).toBe(true);
    model.counterStartProperty.value = model.timeProperty.value - 1 / 365.25;
    expect(playUntilPause(model)).toBeCloseTo(72.7, 0);
  });

  it("moves time when a planet is dragged, and snaps to a nearby configuration", () => {
    const model = new SynodicMotionModel();
    jumpTo(model, ConfigurationEvent.OPPOSITION);
    const opposition = model.timeProperty.value;
    model.snapProperty.value = false;
    model.dragPlanetTo("target", model.targetLongitudeProperty.value + 0.05);
    expect(model.timeProperty.value).toBeGreaterThan(opposition);
    model.snapProperty.value = true;
    model.dragPlanetTo("observer", model.observerLongitudeProperty.value - 0.02);
    expect(model.timeProperty.value).toBeCloseTo(opposition, 10);
  });

  it("keeps the hypothetical orbit off the other planet's orbit", () => {
    const pair = SynodicMotionModel.createPair(PlanetChoice.EARTH, PlanetChoice.HYPOTHETICAL, 1);
    expect(Math.abs(pair.aTarget - pair.aObserver)).toBeGreaterThan(0.01);
  });

  it("emits when playback pauses at an event", () => {
    const model = new SynodicMotionModel();
    const seen: ConfigurationEvent[] = [];
    model.eventReachedEmitter.addListener((event) => seen.push(event));
    model.pauseAtConfigurationsProperty.value = true;
    playUntilPause(model);
    expect(seen.length).toBe(1);
  });

  it("resets everything", () => {
    const model = new SynodicMotionModel();
    model.targetChoiceProperty.value = PlanetChoice.SATURN;
    model.jumpToNextEvent();
    model.zeroCounter();
    model.reset();
    expect(model.targetChoiceProperty.value).toBe(PlanetChoice.MARS);
    expect(model.timeProperty.value).toBe(0);
    expect(model.referenceSunLongitudeProperty.value).toBeNull();
  });
});
