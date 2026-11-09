/**
 * PlanetaryConfigurationsConstants.ts
 *
 * Central repository for every named numeric constant used across the
 * simulation. Bare numbers that carry semantic meaning (sizes, margins,
 * physics defaults, ranges) belong here rather than inline in model or view
 * code, so they are named, documented, and changed in one place.
 *
 * Conventions
 * ───────────
 *  - Astronomy values use the units of the NAAP handout, not SI: distances in
 *    astronomical units (AU), times in years (yr) or days (d), angles in radians
 *    unless the name says DEGREES. Each value notes its unit.
 *  - Layout / chrome values are in screen pixels.
 *  - Colour strings live in PlanetaryConfigurationsColors.ts, not here.
 *  - Computed expressions (e.g. `2 * Math.PI`) may stay inline.
 */

import { Range } from "scenerystack/dot";
import PlanetaryConfigurationsNamespace from "./PlanetaryConfigurationsNamespace.js";

// ── Layout / chrome (screen pixels) ───────────────────────────────────────────

/** Margin between the screen edge and edge-anchored content. */
export const SCREEN_VIEW_MARGIN = 15;

/** Gap between neighbouring layout regions (view, panels, strip). */
export const REGION_GAP = 12;

/** Corner radius shared by control panels and dialogs. */
export const PANEL_CORNER_RADIUS = 6;

/** Vertical spacing between rows inside a control panel. */
export const PANEL_ROW_SPACING = 7;

/** Fonts sizes (px) shared by panels and readouts. */
export const FONT_SIZE = {
  title: 15,
  label: 13,
  small: 11,
  readout: 14,
  bigReadout: 18,
} as const;

/** Radius (px) of the Sun disc drawn in orbit views. */
export const SUN_RADIUS = 11;

/** Radius (px) of a planet disc drawn in orbit views. */
export const PLANET_RADIUS = 7;

/** Radius (px) of the observer's planet disc (slightly larger so it reads as "you are here"). */
export const OBSERVER_RADIUS = 8;

/** Extra pick radius (px) around a draggable planet. */
export const PLANET_TOUCH_DILATION = 10;

/** Height (px) of the zodiac sky band. */
export const ZODIAC_BAND_HEIGHT = 58;

/** Height (px) of the motion-history lane drawn beneath the sky band. */
export const HISTORY_LANE_HEIGHT = 44;

// ── Astronomy ────────────────────────────────────────────────────────────────

/** Days in a Julian year, the conversion the handout asks students to use. */
export const DAYS_PER_YEAR = 365.25;

/** Earth's mean orbital speed (km/s); a circular orbit at a AU moves at this / √a. */
export const EARTH_ORBITAL_SPEED_KM_S = 29.78;

/** Allowed semimajor-axis range (AU) for the hypothetical planet. */
export const HYPOTHETICAL_A_RANGE = new Range(0.2, 12);

/** Default semimajor axis (AU) of the hypothetical planet. */
export const HYPOTHETICAL_A_DEFAULT = 2.5;

/**
 * Smallest difference (AU) allowed between the observer's and target's orbits. Equal
 * orbits never change configuration (an infinite synodic period), so the model keeps
 * the hypothetical planet at least this far from the other planet.
 */
export const MIN_ORBIT_SEPARATION = 0.02;

/** Two events closer than this (yr) are treated as simultaneous. */
export const EVENT_EPSILON_YEARS = 1e-9;

/** A configuration is "now" when the planets are within this many days of it. */
export const EVENT_NOW_TOLERANCE_DAYS = 0.75;

/** Dragging a planet snaps to a configuration this close (days), when snapping is on. */
export const SNAP_TOLERANCE_DAYS = 6;

/** Time advanced (days) by one press of the step-forward / step-backward button. */
export const STEP_DAYS = 1;

/** Animation rates (days of simulated time per second) for the slow / normal / fast speeds. */
export const DAYS_PER_SECOND = {
  slow: 20,
  normal: 60,
  fast: 180,
} as const;

/** Keyboard rotation of a planet (degrees per key press, and with Shift held). */
export const KEYBOARD_ROTATION_DEGREES = 5;
export const KEYBOARD_FINE_ROTATION_DEGREES = 1;

/** Number of samples used to draw the motion-history trail. */
export const TRAIL_SAMPLES = 360;

/** Default length (yr) of the motion-history trail. */
export const TRAIL_DURATION_YEARS = 1.5;

// ── Ptolemaic model (dimensionless deferent units, angles in degrees) ──────────

/** Deferent radius in model units (the epicycle size is a fraction of it). */
export const PTOLEMAIC_DEFERENT_RADIUS = 1;

/** Radius (deferent units) at which the Sun's direction is drawn. */
export const PTOLEMAIC_SUN_ORBIT_RADIUS = 2.25;

/** The Sun's mean motion around Earth (degrees per day): 360° per 365.25 d. */
export const PTOLEMAIC_SUN_RATE_DEGREES_PER_DAY = 360 / DAYS_PER_YEAR;

/** Slider ranges for the Ptolemaic parameters. */
export const EPICYCLE_SIZE_RANGE = new Range(0, 0.75);
export const ECCENTRICITY_RANGE = new Range(0, 0.2);
export const MOTION_RATE_RANGE = new Range(0.01, 4.5); // degrees per day
export const APOGEE_ANGLE_RANGE = new Range(0, 360); // degrees

PlanetaryConfigurationsNamespace.register("PlanetaryConfigurationsConstants", {
  SCREEN_VIEW_MARGIN,
  REGION_GAP,
  PANEL_CORNER_RADIUS,
  DAYS_PER_YEAR,
  EARTH_ORBITAL_SPEED_KM_S,
});
