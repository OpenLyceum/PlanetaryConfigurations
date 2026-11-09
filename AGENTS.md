# AGENTS.md — Planetary Configurations

Sim-specific context for AI assistants. General SceneryStack guidance: [OpenLyceum/.github/AGENTS.md](https://github.com/OpenLyceum/.github/blob/main/AGENTS.md).

## Project

Five-screen astronomy sim supporting the NAAP **Solar System Models** student guide
(<https://astro.unl.edu/naap/ssm/naap_ssm_sg.pdf>, Q1–Q16). It is an original design, not a port.
[SolarSystemModels](https://github.com/OpenLyceum/SolarSystemModels) ports the same NAAP lab, but its
UI overlaps; this sim reuses only its zodiac data and Ptolemaic geometry (see
[doc/implementation-notes.md](doc/implementation-notes.md)). Formulas and expected values are in
[doc/model.md](doc/model.md).

| Screen (folder) | Handout | Model |
|---|---|---|
| Orbits (`src/orbits/`) | Q1 speed vs distance | `OrbitsModel`: time, inner/all scale |
| Configurations (`src/configurations/`) | Q2–Q3 naming configurations | `ConfigurationsModel`: Earth fixed below the Sun, planet longitude, no time |
| Synodic Motion (`src/synodic/`) | Q4–Q12, Q14–Q16 | `SynodicMotionModel`: observer/target, single time Property, counter, pause-at events |
| Periods (`src/periods/`) | Q13 + trends | `PeriodsModel`: synodic ↔ sidereal calculator, hypothetical planet on S(a) chart |
| Ptolemaic (`src/ptolemaic/`) | geocentric background | `PtolemaicModel`: deferent/epicycle/equant from time, presets |

Synodic Motion uses `SynodicMotion*` file names (scaffold-generated); the folder is `synodic/`.

## Key files

| Area | Location |
|---|---|
| Orbital maths (pure, tested) | `src/common/model/orbitalMath.ts`, `src/common/model/synodicEvents.ts` |
| Planets / events / types | `src/common/model/PlanetChoice.ts`, `ConfigurationEvent.ts`, `PlanetType.ts`, `TrailSample.ts` |
| Zodiac star data (from SSM) | `src/common/model/ZodiacConstellationsData.ts` |
| Layout regions | `src/common/view/ScreenLayout.ts` (`placeInRegion`) |
| Shared views | `src/common/view/` — `ZodiacStripNode`, `BodyNode` (+ `makeRotatable`), `SightGeometryNode`, `PlanetComboBox`, `elongationStrings`, `viewUtils` (labels, checkbox, radio, number control, time controls, name properties) |
| Hotkeys | `src/common/PlanetaryConfigurationsHotkeyData.ts`, `src/common/view/PlanetKeyboardHelpSection.ts` |
| Colors / constants | `src/PlanetaryConfigurationsColors.ts` (`PLANET_COLORS`), `src/PlanetaryConfigurationsConstants.ts` |
| Strings | `src/i18n/StringManager.ts`, `strings_{en,fr,es}.json` |
| Preferences | `src/preferences/` — `showRealPeriods` (measured synodic periods in the Orbits table) |

## Conventions that matter here

- **Elongation sign:** positive = east of the Sun (evening sky). SolarSystemModels uses the opposite sign.
- **Layout:** every screen view places content only through `placeInRegion` in a `ScreenLayout`
  region. Never position panels with literal pixels. Combo-box lists go in the view's `listParent`.
- **Time is the state:** derive positions, events and trails from the time Property. Do not
  integrate or store history.
- **Handout answers stay hidden:** the Synodic readouts show the next configuration's *name* only,
  never the synodic period or the time to it, because students are asked to measure these.

## Accessibility

Follows the shared [OpenLyceum accessibility convention](https://github.com/OpenLyceum/Baton/blob/main/ACCESSIBILITY.md):

- **Strings:** per-screen a11y strings live under `a11y.<screen>` in each locale.
- **Screen summary:** every summary has a live `currentDetailsPattern`.
- **Traversal:** each screen view sets `pdomOrder` on a wrapper `Node`, with Reset All last.
- **Keyboard:**
  - Draggable planets are focusable and rotate with the arrow keys (Shift for fine steps).
  - The Periods chart's planet is an `AccessibleSlider` over log10(a).
- **Announcements:** Synodic Motion announces each event it pauses at (`addAccessibleResponse`).

## Testing

| Path | Covers |
|---|---|
| `tests/common/orbitalMath.test.ts` | Kepler, speeds, synodic table, sidereal↔synodic, elongation sign, greatest elongation, retrograde length |
| `tests/common/synodicEvents.test.ts` | Event order and geometry, next/previous, Q4, Q16, analytic stations vs numerical |
| `tests/common/ScreenLayout.test.ts` | Regions disjoint and inside layoutBounds |
| `tests/synodic/SynodicMotionModel.test.ts` | Handout Q4, Q6, Q12, Q14, Q15, Q16 through the model; drag/snap; swap; reset |
| `tests/configurations/…`, `tests/periods/…`, `tests/ptolemaic/…` | Screen models |
| `tests/memory-leak.test.ts` | Configuration markers, labelled bodies, name properties (no listener left), controls |
| `tests/browser/layout.spec.ts` | Playwright: no region overlap, every screen × en/fr/es; `SCREENSHOT_DIR` saves PNGs |

## Compliance carve-outs

None.

## Commands

```bash
npm run lint && npm run check && npm run build && npm test
npx playwright test tests/browser     # layout regression (needs Playwright Chromium)
```

Screen models are reachable from the console as `phet.joist.sim.screens[i].model`; load a single screen
with `?screens=n&ea`.
