# Model — Planetary Configurations

All screens except Ptolemaic share one heliocentric model:

- Planets move on coplanar, circular, counter-clockwise orbits (as seen from ecliptic north).
- Kepler's third law is applied in solar units: **P = a^1.5** (P in years, a in AU).
- One year is **365.25 d**, the conversion the handout asks for.

The code is in `src/common/model/orbitalMath.ts` and `src/common/model/synodicEvents.ts`; both are
pure functions with unit tests in `tests/common/`.

## Positions and elongation

- Heliocentric longitude: θ(t) = θ₀ + 2πt/P. θ₀ is the planet's J2000 mean longitude, so t = 0 is
  about 1 January 2000.
- Apparent longitude of a target seen from an observer: λ = atan2(target − observer). The Sun's
  apparent longitude is atan2(−observer).
- **Signed elongation** e = wrap(λ_target − λ_sun) ∈ (−π, π]. **Positive is east** of the Sun (evening
  sky), negative is west (morning sky).
  - Earth is fixed below the Sun on the Configurations screen, so east is the left half of the view.
  - Note: SolarSystemModels uses the opposite sign.
- Sky visibility (`skyVisibility`):
  - |e| < 15°: lost in the glare
  - |e| > 150°: up all night
  - otherwise: evening sky if east, morning sky if west.

## Configurations as phases

Let φ = θ_target − θ_observer, and define a phase that always increases: **u = φ** for an inferior
target (it moves faster) and **u = −φ** for a superior one. u advances at 2π/S, where the synodic
period is S = 1 / |1/P_t − 1/P_o|.

| u | inferior target | superior target |
|---|---|---|
| 0 | inferior conjunction | opposition |
| α | greatest elongation, west | quadrature, east |
| π | superior conjunction | conjunction |
| 2π − α | greatest elongation, east | quadrature, west |

α = acos(a_t/a_o) for an inferior target and acos(a_o/a_t) for a superior one. Greatest elongation is
asin(a_inner/a_outer).

**Event timing.** The next event after t is at t + mod2π(u_event − u(t)) · S/2π. A phase difference
below 1e−9 counts as a full cycle, so "next" is strictly later. "Previous" works the same way in
reverse.

## Retrograde motion

The rate of change of the target's apparent longitude is proportional to

    r_o²ω_o + r_t²ω_t − r_o r_t (ω_o + ω_t) cos φ      (ω = 2π/P)

- **Retrograde:** the expression is negative.
- **Stationary:** this happens at |φ| = φ_s, where cos φ_s = (r_o²ω_o + r_t²ω_t) / (r_o r_t (ω_o + ω_t)).
- **Timing:** retrograde motion runs from u = 2π − φ_s to u = φ_s and lasts S·φ_s/π.
- **Symmetry:** the formula is unchanged when observer and target are swapped.

## Values students should measure (circular orbits)

| Planet | P (yr) | S from Earth (d) | Greatest elongation | Retrograde (d) |
|---|---|---|---|---|
| Mercury | 0.2408 | 115.8 | 22.8° | 22.9 |
| Venus | 0.6148 | 582.9 | 46.3° | 42.1 |
| Mars | 1.8814 | 779.7 | — | 72.7 |
| Jupiter | 11.868 | 398.9 | — | 120.6 |
| Saturn | 29.452 | 378.1 | — | 137.6 |

Measured values differ slightly because real orbits are eccentric (for example, Venus 583.9 d and Mars
779.9 d).

**Handout checks** (`tests/synodic/SynodicMotionModel.test.ts`):

| Question | Result |
|---|---|
| Q12 | Earth seen from Mars: S = 779.7 d, greatest elongation 41.0° |
| Q13 | S = 1.09 yr → P = 12.11 yr |
| Q14 | The Sun returns to the same place in Mars's sky after 687 d |
| Q15 | Starting at conjunction, Mars returns to the same zodiac place after about 711 d. This is neither period: it depends on where in the synodic cycle you start. |
| Q16 | Mars retrograde begins 353.5 d after conjunction and lasts 72.7 d |

## Periods calculator

| | Formula | Solving for P | Valid when |
|---|---|---|---|
| Inferior planet | 1/S = 1/P − 1/E | P = S/(1 + S) | P < E (when computing S) |
| Superior planet | 1/S = 1/E − 1/P | P = S/(S − 1) | S > 1 yr |

E = 1 yr. When the condition fails, the calculator shows "no solution". The calculator's planet is
plotted on the chart at a = P^(2/3).

## Ptolemaic model

Coordinates are in deferent radii, with Earth at the origin.

- **Deferent.** Its centre is offset from Earth by the eccentricity e, toward the apogee angle.
- **Equant.** It sits at twice that offset.
- **Epicycle centre.** It moves on the deferent so that its angle is uniform as seen from the equant
  (`computeEpicycleCenter`, the NAAP Flash construction).
- **Superior planet.** The deferent is driven by the planet's mean motion, and the epicycle radius
  stays parallel to the Earth–Sun line.
- **Inferior planet.** The roles are swapped.
- **Sun.** It moves at 360°/365.25 d on a circle of radius 2.25, used only for direction.
- **Retrograde test.** Retrograde is decided numerically from the apparent longitude half a day
  either side.

## State and time

Every screen derives its state from a single time Property, so stepping backward, dragging and jumping
are exact.

- Synodic Motion: time in years, with a counter start for the Zero Counter.
- Ptolemaic: time in days.
- Configurations: the planet's longitude (no time passes).

The motion-history trail is resampled from time each frame, so it needs no stored history.
