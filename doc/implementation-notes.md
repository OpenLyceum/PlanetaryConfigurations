# Implementation notes — Planetary Configurations

## Layout: no overlaps by construction

`src/common/view/ScreenLayout.ts` splits each screen's `layoutBounds` into named, disjoint
rectangles:

- `viewAndPanelsLayout` is used by Orbits and Configurations.
- `skyLayout` is used by Synodic Motion and Ptolemaic, which share the same arrangement so the two
  explanations of retrograde motion can be compared screen to screen.
- `periodsLayout` is used by Periods.

Every screen view adds its content with `placeInRegion(node, region, align)`. This wraps the node in an
`AlignBox` over the region and caps the node's `maxWidth`/`maxHeight` to it, so longer French and
Spanish labels shrink instead of spilling into a neighbour. Graphic views clip to their own rounded
rectangle. Combo-box lists open in a top-level `listParent` node; that is the only place content may
overlap.

Two tests guard this:

- `tests/common/ScreenLayout.test.ts` checks that the regions are disjoint and inside the layout bounds.
- `tests/browser/layout.spec.ts` (Playwright) checks the rendered content of each region in every
  screen and locale. Set `SCREENSHOT_DIR` to also save review PNGs, including projector mode.

Avoid absolute pixel positions in screen views. When a screen needs a new area, add a region to
`ScreenLayout.ts` and extend its test.

## Planets you can move

`makeRotatable` (`common/view/BodyNode.ts`) gives a planet node two inputs:

- a `DragListener`, which reports the pointer's angle around the Sun;
- a `KeyboardListener` over `PlanetaryConfigurationsHotkeyData` (arrows, with Shift for smaller steps).

The keyboard-help rows (`PlanetKeyboardHelpSection`) read the same HotkeyData.

On Synodic Motion, a drag converts the angle change of the dragged planet into a time change. The other
planet therefore moves consistently, and snapping captures configurations within a few days. Key
presses never snap: small steps near a configuration would otherwise be pulled back to it.

## Name properties

`planetNameProperty` and `eventNameProperty` (`common/view/viewUtils.ts`) follow both the model choice
and the locale. They are a `DynamicProperty` over a `DerivedProperty`, and disposing them also disposes
the inner `DerivedProperty`. `tests/memory-leak.test.ts` checks that no listener is left on the model.

## Relation to SolarSystemModels

SolarSystemModels ports the same NAAP lab, but its layout is fixed-pixel and its panels overlap. This
sim was written fresh. What it reuses:

- `common/model/ZodiacConstellationsData.ts` is copied unchanged (apart from the namespace).
- `ptolemaic/model/PtolemaicModel.ts` ports `computeDeferentCenter`, `computeEpicycleCenter` and the
  preset values. The model is new: it is time-derived, with no store/recall and no "OK" step for presets.
- The elongation formula and event phases follow `configurations/model/ConfigurationsModel.ts`, with
  the elongation **sign flipped** (positive = east here). Event timing is new: pure next/previous
  functions instead of the old countdown state machine.

## Debugging

Screen models are reachable from the console as `phet.joist.sim.screens[i].model`. Use
`?screens=n&ea` for a single screen with assertions.
