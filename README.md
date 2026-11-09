# Planetary Configurations

[![CI](../../actions/workflows/ci.yml/badge.svg)](../../actions/workflows/ci.yml)

Why does Mars sometimes drift backward among the stars, and why does Venus never stray far from the
Sun? Students explore planetary configurations from a Sun-centered view: elongation, conjunctions,
quadratures and oppositions, synodic and sidereal periods, and retrograde motion. They then compare
this with Ptolemy's Earth-centered model of epicycles. The sim covers every question of the NAAP
[Solar System Models](https://astro.unl.edu/naap/ssm/naap_ssm_sg.pdf) student guide with an original
layout. Built with [SceneryStack](https://scenerystack.org/); runs offline as a Progressive Web App.

## Features

- **Orbits** (handout Q1). Mercury through Saturn on circular orbits with Kepler's third law,
  P = a^1.5. Speed arrows are drawn to a common scale, and a table lists a, P and v, so the
  speed–distance trend is visible and numeric. You can frame just the inner planets or all six.
- **Configurations** (Q2–Q3). Earth stays below the Sun, so the east and west halves of Earth's sky
  are the left and right of the view. Drag a hypothetical superior or inferior planet around its
  orbit to read its signed elongation, its configuration (opposition, quadrature, greatest
  elongation, inferior or superior conjunction), and whether it is in the evening sky, the morning
  sky, up all night, or lost in the Sun's glare. A toggle marks where every named configuration lies.
- **Synodic Motion** (Q4–Q12, Q14–Q16). You choose any observer and target planet, or a
  hypothetical orbit. Dragging either planet moves time, and the counter has a Zero Counter button.
  Previous/Next jump between configurations, and playback can pause exactly at configurations or at
  the start and end of retrograde motion, so the counter reads the synodic period directly.
  - A zodiac strip shows where the Sun and target appear in the observer's sky.
  - Reference ticks mark where they stood when the counter was zeroed.
  - A motion-history lane turns the retrograde loop into a visible zig-zag.
- **Periods** (Q13, plus the trends of Q6, Q10 and Q11). A synodic ↔ sidereal calculator handles
  inferior and superior planets in years or days, and shows the formula with the numbers substituted.
  Beside it, a graph plots the synodic period against distance from the Sun: it diverges at Earth's
  orbit and approaches one year far away. A hypothetical planet can be dragged along the curve.
- **Ptolemaic.** Ptolemy's deferent, epicycle and equant, with presets for Venus, Mars, Jupiter and
  Saturn. The traced path shows the loops, and the same zodiac strip makes the comparison with the
  heliocentric explanation direct.
- **Accessible:**
  - Every control works from the keyboard. The planets move along their orbits with the arrow
    keys, and the graph's planet is a slider.
  - Each screen has a live screen summary and a keyboard-help dialog. Configurations reached
    during playback are announced.
  - The sim is available in English, French and Spanish, with default and projector colour profiles.
  - A preference (or `?showRealPeriods`) adds measured synodic periods to the Orbits table.
  - Installable PWA.

## Quick Start

```bash
npm install
npm start        # dev server → http://localhost:5173
```

## Scripts

| Command | Description |
|---|---|
| `npm start` / `npm run dev` | Start Vite dev server |
| `npm run build` | Type-check + production build → `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm test` | Run Vitest unit tests (includes memory-leak suite) |
| `npm run test:fuzz` | Optional Playwright fuzz smoke: pointer (`?fuzz`) + keyboard (`?fuzzBoard`), with `?ea`, 30s each |
| `npm run test:fuzz -- 90` | Same fuzz for 90 seconds (`--duration 90` or `FUZZ_DURATION=90` also work) |
| `npm run test:fuzz:quick` | Shorter fuzz smoke (10s) |
| `npm run test:fuzz:long` | Longer fuzz smoke (300s) |
| `npm run check` | TypeScript type check |
| `npm run lint` | Biome lint check |
| `npm run format` | Auto-format all files |
| `npm run fix` | Lint + auto-fix |
| `npm run icons` | Regenerate PNG icons from `public/icons/icon.svg` |
| `npm run release` | `check && lint && build && test`, then version patch + push tags |
| `npm run clean` | Remove `dist/` |

`npx playwright test tests/browser` runs the layout regression: in every screen and locale, no layout
region overlaps another.

## Tech Stack

| Tool | Version | Purpose |
|---|---|---|
| [SceneryStack](https://scenerystack.org/) | ^3.0.0 | Simulation framework |
| [Vite](https://vitejs.dev/) | ^8 | Build tool + dev server |
| [TypeScript](https://www.typescriptlang.org/) | ^7 | Type-safe JavaScript |
| [Biome](https://biomejs.dev/) | ^2.6 | Linting + formatting |
| [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) | ^2 | PWA + service worker |

## License

GNU Affero General Public License v3.0 — see [OpenLyceum org license](https://github.com/OpenLyceum/.github/blob/main/LICENSE).
Zodiac star positions and Ptolemaic presets come from the NAAP labs; see [CREDITS.md](CREDITS.md).

## Contributing

See [OpenLyceum contributing guidelines](https://github.com/OpenLyceum/.github/blob/main/CONTRIBUTING.md).
Report bugs via GitHub Issues; use org issue templates.
