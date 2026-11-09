/**
 * planetaryConfigurationsQueryParameters.ts
 *
 * Sim-specific startup query parameters. This is the single place where every
 * sim-specific query parameter is declared and documented. Public-facing
 * parameters (intended for end users / sharing links) must set `public: true`.
 *
 * ── How to add a query parameter ──────────────────────────────────────────────
 * 1. Add an entry below with a `type`, `defaultValue`, and (if user-facing)
 *    `public: true`. Add `isValidValue` to bound numeric ranges.
 * 2. If it should also be user-editable at runtime, surface it as a preference
 *    in PlanetaryConfigurationsPreferencesModel (initialize that Property from this query parameter).
 *
 * Usage: append e.g. `?showRealPeriods` to the sim URL.
 */

import { logGlobal } from "scenerystack/phet-core";
import { QueryStringMachine } from "scenerystack/query-string-machine";
import PlanetaryConfigurationsNamespace from "../PlanetaryConfigurationsNamespace.js";

const planetaryConfigurationsQueryParameters = QueryStringMachine.getAll({
  /**
   * Start with "Show measured periods" on: the Orbits table also lists each planet's
   * measured synodic period seen from Earth. Usage: `?showRealPeriods`.
   */
  showRealPeriods: {
    type: "flag",
    public: true,
  },
});

PlanetaryConfigurationsNamespace.register(
  "planetaryConfigurationsQueryParameters",
  planetaryConfigurationsQueryParameters,
);

// Log query parameters (for the console / PhET-iO).
logGlobal("phet.chipper.queryParameters");

export default planetaryConfigurationsQueryParameters;
