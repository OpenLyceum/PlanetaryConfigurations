# Credits — Planetary Configurations

Planetary configurations, synodic periods and retrograde motion for introductory astronomy, written
for the [OpenLyceum](https://github.com/OpenLyceum) fleet with [SceneryStack](https://scenerystack.org/).

## License

GNU Affero General Public License v3.0 or later — see [org LICENSE](https://github.com/OpenLyceum/.github/blob/main/LICENSE).

## Curriculum

- Designed to support the **NAAP Solar System Models student guide**
  ([naap_ssm_sg.pdf](https://astro.unl.edu/naap/ssm/naap_ssm_sg.pdf)), University of Nebraska–Lincoln
  Astronomy Education. The layout, drawing and interaction are original; the sim does not reproduce the
  NAAP Flash simulators.

## Data

- **Zodiac constellations.** Star positions and stick figures from the NAAP *Planetary Configurations*
  simulator (Flash `Constellations Data.as`), as converted to ecliptic coordinates in
  [SolarSystemModels](https://github.com/OpenLyceum/SolarSystemModels)
  (`src/common/ZodiacConstellationsData.ts`, copied unchanged apart from the namespace).
- **Ptolemaic presets.** Epicycle size, eccentricity, apogee angle and mean motion for Venus, Mars,
  Jupiter and Saturn from the NAAP *Ptolemaic Orrery* (Flash `ptolemaic.swf`), via SolarSystemModels.
  The equant construction (`computeEpicycleCenter`) is ported from the same source.
- **Planets.** Semimajor axes as given in the handout (0.387, 0.723, 1, 1.524, 5.203, 9.537 AU);
  starting longitudes are the J2000 mean heliocentric longitudes (Standish, *Keplerian Elements for
  Approximate Positions of the Major Planets*, JPL). Measured synodic periods shown by the
  "Show measured periods" preference are NASA planetary fact-sheet values.
