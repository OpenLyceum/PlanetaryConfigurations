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

/** Settings for common/PlanetaryConfigurationsControlOptions.ts. Layout lengths are in px; counts and ratios are dimensionless. */
export const PLANETARY_CONFIGURATIONS_CONTROL_OPTIONS_SETTINGS = {
  SLIDER_THUMB_SIZE_WIDTH: 12,
  SLIDER_THUMB_SIZE_HEIGHT: 22,
  STANDALONE_SLIDER_TRACK_SIZE_WIDTH: 150,
  STANDALONE_SLIDER_TRACK_SIZE_HEIGHT: 3,
  NUMBER_CONTROL_SLIDER_TRACK_SIZE_WIDTH: 110,
  NUMBER_CONTROL_SLIDER_TRACK_SIZE_HEIGHT: 3,
  CHECKBOX_BOX_WIDTH: 16,
  /** Planetary configurations number control options scale (dimensionless). */
  PLANETARY_CONFIGURATIONS_NUMBER_CONTROL_OPTIONS_SCALE: 0.75,
  PLANETARY_CONFIGURATIONS_NUMBER_CONTROL_OPTIONS_SLIDER_PADDING: 4,
  PLANETARY_CONFIGURATIONS_NUMBER_CONTROL_OPTIONS_ARROW_BUTTON_SPACING: 3,
  PLANETARY_CONFIGURATIONS_NUMBER_CONTROL_OPTIONS_VERTICAL_SPACING: 4,
  PLANETARY_CONFIGURATIONS_CHECKBOX_OPTIONS_SPACING: 4,
} as const;

/** Settings for common/PlanetaryConfigurationsPanel.ts. Layout lengths are in px; counts and ratios are dimensionless. */
export const PLANETARY_CONFIGURATIONS_PANEL_SETTINGS = {
  OPTIONS_X_MARGIN: 12,
  OPTIONS_Y_MARGIN: 10,
} as const;

/** Settings for common/PlanetaryConfigurationsScreenIcons.ts. Layout lengths are in px; counts and ratios are dimensionless. */
export const PLANETARY_CONFIGURATIONS_SCREEN_ICONS_SETTINGS = {
  CREATE_CONFIGURATIONS_ICON_LINE_WIDTH_VARIANT_2: 7, // px
  CREATE_CONFIGURATIONS_ICON_RADIUS_SEGMENT_2: 17, // px
  CREATE_CONFIGURATIONS_ICON_LINE_WIDTH_VARIANT_3: 4, // px
  CREATE_CONFIGURATIONS_ICON_RADIUS_SEGMENT_3: 15, // px
  CREATE_SYNODIC_MOTION_ICON_LINE_WIDTH_VARIANT_2: 4, // px
  CREATE_SYNODIC_MOTION_ICON_RADIUS_SEGMENT_2: 13, // px
  CREATE_SYNODIC_MOTION_ICON_LINE_WIDTH_VARIANT_3: 3, // px
  CREATE_SYNODIC_MOTION_ICON_LINE_WIDTH_VARIANT_4: 8, // px
  CREATE_SYNODIC_MOTION_ICON_X_SEGMENT_2: 300, // px
  CREATE_SYNODIC_MOTION_ICON_Y_SEGMENT_2: 285, // px
  CREATE_SYNODIC_MOTION_ICON_X_SEGMENT_3: 270, // px
  CREATE_SYNODIC_MOTION_ICON_Y_SEGMENT_3: 270, // px
  CREATE_SYNODIC_MOTION_ICON_X_SEGMENT_4: 240, // px
  CREATE_SYNODIC_MOTION_ICON_Y_SEGMENT_4: 258, // px
  CREATE_SYNODIC_MOTION_ICON_LINE_WIDTH_VARIANT_5: 10, // px
  CREATE_PERIODS_ICON_LINE_WIDTH_VARIANT_2: 4, // px
  CREATE_PERIODS_ICON_LINE_WIDTH_VARIANT_3: 9, // px
  CREATE_PERIODS_ICON_X_VARIANT_2: 300, // px
  CREATE_PERIODS_ICON_Y_VARIANT_2: 150, // px
  CREATE_PTOLEMAIC_ICON_LINE_WIDTH_VARIANT_2: 5, // px
  CREATE_PTOLEMAIC_ICON_RADIUS_SEGMENT_2: 50, // px
  CREATE_PTOLEMAIC_ICON_RADIUS_SEGMENT_3: 16, // px
  CREATE_PTOLEMAIC_ICON_LINE_WIDTH_VARIANT_3: 4, // px
  CREATE_PTOLEMAIC_ICON_RADIUS_SEGMENT_4: 13, // px

  CREATE_CONFIGURATIONS_ICON_LINE_DASH_DASH: 14, // px
  CREATE_SYNODIC_MOTION_ICON_X_OFFSET: 60, // px
  CREATE_SYNODIC_MOTION_ICON_X_FACTOR: 105, // dimensionless
  CREATE_SYNODIC_MOTION_ICON_Y_FACTOR: 105, // dimensionless
  CREATE_PERIODS_ICON_LINE_DASH_DASH: 12, // px
  CREATE_PERIODS_ICON_Y_OFFSET: 8, // px
  CREATE_PTOLEMAIC_ICON_X_FACTOR: 50, // dimensionless
  CREATE_PTOLEMAIC_ICON_X: 2.6, // px
  CREATE_PTOLEMAIC_ICON_Y_FACTOR: 50, // dimensionless
  CREATE_PTOLEMAIC_ICON_Y: 2.6, // px

  ORBIT_LINE_WIDTH: 4,
  CREATE_ORBITS_ICON_HEAD_WIDTH: 22,
  CREATE_ORBITS_ICON_HEAD_HEIGHT: 18,
  CREATE_ORBITS_ICON_TAIL_WIDTH: 7,
  CREATE_ORBITS_ICON_RADIUS: 13,
  CREATE_CONFIGURATIONS_ICON_LINE_WIDTH: 6,
  CREATE_CONFIGURATIONS_ICON_RADIUS: 70,
  ZIGZAG_X: 40,
  ZIGZAG_Y: 345,
  CREATE_SYNODIC_MOTION_ICON_LINE_WIDTH: 5,
  CREATE_SYNODIC_MOTION_ICON_RADIUS: 14,
  CREATE_SYNODIC_MOTION_ICON_X: 20,
  CREATE_SYNODIC_MOTION_ICON_Y: 200,
  CREATE_SYNODIC_MOTION_ICON_HEIGHT: 160,
  CREATE_SYNODIC_MOTION_ICON_CORNER_X: 10,
  CREATE_SYNODIC_MOTION_ICON_CORNER_Y: 10,
  LEFT: 60,
  BOTTOM: 330,
  BRANCH_B_Y: 30,
  CREATE_PERIODS_ICON_Y: 20,
  CREATE_PERIODS_ICON_LINE_WIDTH: 5,
  CREATE_PERIODS_ICON_START_Y: 20,
  CREATE_PERIODS_ICON_RADIUS: 16,
  CREATE_PERIODS_ICON_X: 380,
  CREATE_PTOLEMAIC_ICON_LINE_WIDTH: 6,
  CREATE_PTOLEMAIC_ICON_RADIUS: 120,
} as const;

/** Settings for common/model/ZodiacConstellationsData.ts. */
export const ZODIAC_CONSTELLATIONS_DATA_SETTINGS = {
  /** Obliquity (rad). */
  OBLIQUITY: 0.40913426548833737,
  /** Scale (px). */
  SCALE: 350,
} as const;

/** Settings for common/model/synodicEvents.ts. */
export const SYNODIC_EVENTS_SETTINGS = {
  /** Phases this close (rad) count as the same phase. */
  PHASE_EPSILON: 1e-9,
} as const;

/** Settings for common/view/BodyNode.ts. Layout lengths are in px; counts and ratios are dimensionless. */
export const BODY_NODE_SETTINGS = {
  LABEL_GAP: 9,
  DISC_LINE_WIDTH: 2,
  LABEL_TEXT_MAX_WIDTH: 90,
} as const;

/** Settings for common/view/PlanetComboBox.ts. Layout lengths are in px; counts and ratios are dimensionless. */
export const PLANET_COMBO_BOX_SETTINGS = {
  DEFAULT_MAX_TEXT_WIDTH: 110,
  ITEMS_SPACING: 6,
  ITEMS_RADIUS: 6,
  X_MARGIN: 8,
  Y_MARGIN: 4,
} as const;

/** Settings for common/view/ScreenLayout.ts. Layout lengths are in px; counts and ratios are dimensionless. */
export const SCREEN_LAYOUT_SETTINGS = {
  /** Height of the bottom band holding the zodiac strip (header + sky band + history lane + caption). */
  STRIP_REGION_HEIGHT: 150,
  /** Width of the bottom-right region holding the time controls and Reset All. */
  TIME_REGION_WIDTH: 196,
  /** Width of the Periods calculator column. */
  CALCULATOR_REGION_WIDTH: 318,
  /** Height of the Periods marker / legend band under the chart. */
  MARKER_REGION_HEIGHT: 112,
  DEFAULT_FOOTER_HEIGHT: 56,
} as const;

/** Settings for common/view/SightGeometryNode.ts. Layout lengths are in px; counts and ratios are dimensionless. */
export const SIGHT_GEOMETRY_NODE_SETTINGS = {
  LINE_DASH_DASH: 6, // px

  /** How far (px) the observer → target line continues past the target. */
  TARGET_LINE_OVERSHOOT: 40,
  /** Radius (px) of the elongation arc. */
  ARC_RADIUS: 34,
  SUN_LINE_LINE_WIDTH: 1.5,
  TARGET_LINE_LINE_WIDTH: 1.5,
  ARC_LINE_WIDTH: 2,
} as const;

/** Settings for common/view/ZodiacStripNode.ts. Layout lengths are in px; counts and ratios are dimensionless. */
export const ZODIAC_STRIP_NODE_SETTINGS = {
  EAST_TEXT_MAX_WIDTH_FACTOR: 0.2, // dimensionless
  WEST_TEXT_MAX_WIDTH_FACTOR: 0.2, // dimensionless
  TITLE_MAX_WIDTH_FACTOR: 0.55, // dimensionless
  NAME_MAX_WIDTH_FACTOR: 13, // dimensionless
  LINE_LINE_DASH_DASH: 3, // px
  RETROGRADE_KEY_MAX_WIDTH_FACTOR: 0.4, // dimensionless

  /** Where the Sun / target were when the counter was last zeroed; null hides the tick. */
  HEADER_HEIGHT: 17,
  /** Where the Sun / target were when the counter was last zeroed; null hides the tick. */
  CAPTION_HEIGHT: 15,
  /** Where the Sun / target were when the counter was last zeroed; null hides the tick. */
  SUN_MARKER_RADIUS: 7,
  /** Where the Sun / target were when the counter was last zeroed; null hides the tick. */
  TARGET_MARKER_RADIUS: 5,
  /** Where the Sun / target were when the counter was last zeroed; null hides the tick. */
  STAR_RADIUS: 1.2,
  /** Where the Sun / target were when the counter was last zeroed; null hides the tick. */
  REFERENCE_TRIANGLE_SIZE: 6,
  CONSTELLATION_LABEL_FONT_SIZE: 9,
  DIRECTION_FONT_SIZE: 11,
  TITLE_FONT_SIZE: 12,
  TRIANGLE_LINE_WIDTH: 0.75,
  /** Line opacity (dimensionless). */
  LINE_OPACITY: 0.6,
  DIRECT_PATH_LINE_WIDTH: 1.5,
  RETROGRADE_PATH_LINE_WIDTH: 2.5,
  LANE_INSET: 3,
} as const;

/** Settings for common/view/elongationStrings.ts. Layout lengths are in px; counts and ratios are dimensionless. */
export const ELONGATION_STRINGS_SETTINGS = {
  /** Elongations within this many degrees of 0° or 180° show no east/west direction. */
  NO_DIRECTION_DEGREES: 0.05,
} as const;

/** Settings for common/view/viewUtils.ts. Layout lengths are in px; counts and ratios are dimensionless. */
export const VIEW_UTILS_SETTINGS = {
  LABEL_MAX_WIDTH: 220, // px
  RADIO_GROUP_SPACING: 14, // px

  DEFAULT_MAX_WIDTH: 220,
  TEXT_BUTTON_X_MARGIN: 8,
  TEXT_BUTTON_Y_MARGIN: 4,
  NUMBER_CONTROL_MAX_WIDTH: 90,
  DEFAULT_MAX_LABEL_WIDTH: 110,
  RADIO_GROUP_RADIUS: 7,
} as const;

/** Settings for configurations/model/ConfigurationsModel.ts. */
export const CONFIGURATIONS_MODEL_SETTINGS = {
  /** Initial target longitude (degrees). */
  INITIAL_LONGITUDE_DEGREES: 20,
  /** Angle within which a dragged planet snaps to an event (degrees). */
  SNAP_ANGLE_DEGREES: 4,
  /** Tolerance used to label a configuration as at an event (degrees). */
  AT_EVENT_ANGLE_DEGREES: 0.6,
  /** Superior a range min (AU). */
  SUPERIOR_A_RANGE_MIN: 1.2,
  /** Superior a range max (AU). */
  SUPERIOR_A_RANGE_MAX: 4,
  /** Inferior a range min (AU). */
  INFERIOR_A_RANGE_MIN: 0.2,
  /** Inferior a range max (AU). */
  INFERIOR_A_RANGE_MAX: 0.9,
  /** Orbit-radius ranges (AU) and defaults for each kind of hypothetical planet. */
  SUPERIOR_A_DEFAULT: 2,
  /** Orbit-radius ranges (AU) and defaults for each kind of hypothetical planet. */
  INFERIOR_A_DEFAULT: 0.6,
} as const;

/** Settings for configurations/view/ConfigurationMarkerNode.ts. Layout lengths are in px; counts and ratios are dimensionless. */
export const CONFIGURATION_MARKER_NODE_SETTINGS = {
  MARKER_RADIUS: 5,
  LABEL_GAP: 14,
  NAME_MAX_WIDTH: 120,
  LINE_WIDTH: 1.5,
} as const;

/** Settings for configurations/view/ConfigurationReadoutPanel.ts. Layout lengths are in px; counts and ratios are dimensionless. */
export const CONFIGURATION_READOUT_PANEL_SETTINGS = {
  NAME_MAX_WIDTH_FACTOR: 0.34, // dimensionless
  VALUE_MAX_WIDTH_FACTOR: 0.64, // dimensionless

  GRID_X_SPACING: 10,
  GRID_Y_SPACING: 8,
  SPACING: 10,
} as const;

/** Settings for configurations/view/ConfigurationsControlPanel.ts. Layout lengths are in px; counts and ratios are dimensionless. */
export const CONFIGURATIONS_CONTROL_PANEL_SETTINGS = {
  /** Radius spec decimal places (dimensionless). */
  RADIUS_SPEC_DECIMAL_PLACES: 2,
  /** Radius spec delta (dimensionless). */
  RADIUS_SPEC_DELTA: 0.01,
  SPACING: 6,
} as const;

/** Settings for configurations/view/ConfigurationsViewNode.ts. Layout lengths are in px; counts and ratios are dimensionless. */
export const CONFIGURATIONS_VIEW_NODE_SETTINGS = {
  EAST_LABEL_MAX_WIDTH_FACTOR: 3, // dimensionless
  WEST_LABEL_MAX_WIDTH_FACTOR: 3, // dimensionless

  /** Fraction of the half-size used by the largest orbit. */
  FILL_FRACTION: 0.78,
  SIDE_LABEL_FONT_SIZE: 16,
  CORNER_X: 8,
  CORNER_Y: 8,
  CONTENT_CORNER_X: 8,
  CONTENT_CORNER_Y: 8,
  X: 12,
  Y: 10,
  EARTH_ORBIT_LINE_WIDTH: 1.5,
  PLANET_ORBIT_LINE_WIDTH: 1.5,
} as const;

/** Settings for orbits/view/OrbitalDataPanel.ts. Layout lengths are in px; counts and ratios are dimensionless. */
export const ORBITAL_DATA_PANEL_SETTINGS = {
  FIXED_DECIMALS: 3, // digits
  FIXED_DECIMALS_SEGMENT_2: 2, // digits
  SPACING: 8, // px

  CELL_MAX_WIDTH: 70,
  HEADER_MAX_WIDTH: 76,
  ROW_SPACING: 6,
  RADIUS: 5,
  MAX_WIDTH: 70,
  X_SPACING: 14,
  Y_SPACING: 5,
} as const;

/** Settings for orbits/view/OrbitsScreenView.ts. Layout lengths are in px; counts and ratios are dimensionless. */
export const ORBITS_SCREEN_VIEW_SETTINGS = {
  LAYOUT_BOUNDS_VIEW_AND_PANELS_LAYOUT_FOOTER_HEIGHT: 74, // px
  TIME_TEXT_DECIMALS: 2, // digits

  /** Days stepped by one press of the step buttons. */
  STEP_DAYS: 5,
  TIME_PANEL_SPACING: 12,
  SPACING: 24,
} as const;

/** Settings for orbits/view/OrbitsViewNode.ts. Layout lengths are in px; counts and ratios are dimensionless. */
export const ORBITS_VIEW_NODE_SETTINGS = {
  /** Speed-arrow length (px) per km/s. */
  PIXELS_PER_KM_S: 1.5,
  CORNER_X: 8,
  CORNER_Y: 8,
  CONTENT_CORNER_X: 8,
  CONTENT_CORNER_Y: 8,
  ARROW_HEAD_WIDTH: 8,
  ARROW_HEAD_HEIGHT: 7,
  ARROW_TAIL_WIDTH: 2.5,
} as const;

/** Settings for periods/model/PeriodsModel.ts. */
export const PERIODS_MODEL_SETTINGS = {
  /** The calculator accepts periods up to this many years. */
  MAX_PERIOD_YEARS: 200,
  /** Input default (years). */
  INPUT_DEFAULT: 1.09,
} as const;

/** Settings for periods/view/PeriodCalculatorPanel.ts. Layout lengths are in px; counts and ratios are dimensionless. */
export const PERIOD_CALCULATOR_PANEL_SETTINGS = {
  S_DECIMALS: 3, // digits
  P_VALUE_DECIMALS: 3, // digits
  RESULT_STRING_DECIMALS: 3, // digits

  INPUT_TEXT_MAX_WIDTH_OFFSET: 40, // px

  INPUT_BUTTON_MIN_WIDTH: 140,
  INPUT_BUTTON_X_MARGIN: 10,
  INPUT_BUTTON_Y_MARGIN: 5,
} as const;

/** Settings for periods/view/PeriodsScreenView.ts. Layout lengths are in px; counts and ratios are dimensionless. */
export const PERIODS_SCREEN_VIEW_SETTINGS = {
  MARKER_READOUT_DECIMALS: 2, // digits
  MARKER_READOUT_DECIMALS_SEGMENT_2: 3, // digits
  LEGEND_Y_SEGMENT_2: 6, // px
  LEGEND_X_SEGMENT_2: -6, // px

  MARKER_READOUT_MAX_WIDTH_OFFSET: 140, // px
  LINE_ICON_LINE_DASH_DASH: 6, // px
  LINE_ICON_LINE_DASH_GAP: 4, // px
  MARKER_SECTION_SPACING: 10, // px
  MARKER_PANEL_MAX_WIDTH_OFFSET: 70, // px
  MAX_WIDTH_OFFSET: 70, // px

  LEGEND_ITEM_SPACING: 6,
  LEGEND_ITEM_MAX_WIDTH: 150,
  LINE_ICON_END_X: 26,
  LINE_ICON_LINE_WIDTH: 2.5,
  LEGEND_SPACING: 18,
  LEGEND_Y: -6,
  LEGEND_X: 6,
  MARKER_PANEL_SPACING: 8,
  MARKER_PANEL_MAX_WIDTH: 150,
} as const;

/** Settings for periods/view/SynodicPeriodChartNode.ts. Layout lengths are in px; counts and ratios are dimensionless. */
export const SYNODIC_PERIOD_CHART_NODE_SETTINGS = {
  DILATED_DILATION: 6, // px
  DILATED_DILATION_SEGMENT_2: 12, // px
  LINE_WIDTH: 2.5, // px
  DIAMOND_Y_SEGMENT_2: 8, // px
  DIAMOND_X_SEGMENT_2: -8, // px
  VALUE_TEXT_DECIMALS: 2, // digits

  TOP_OFFSET: 4, // px
  BOTTOM_OFFSET: 6, // px
  LINE_DASH_DASH: 5, // px
  SIDEREAL_PATH_LINE_DASH_DASH: 7, // px
  SIDEREAL_PATH_LINE_DASH_GAP: 5, // px
  LEFT_OFFSET: 4, // px
  GUIDE_LINE_DASH_DASH: 3, // px

  /** Y range max (in the source module’s documented units). */
  Y_RANGE_MAX: 5,
  MARGIN_LEFT: 50,
  MARGIN_RIGHT: 14,
  MARGIN_TOP: 28,
  MARGIN_BOTTOM: 44,
  CURVE_SAMPLES: 400,
  TICK_FONT_SIZE: 11,
  RADIUS: 8,
  MARKER_LINE_WIDTH: 2,
  RIGHT_RIGHT: -6,
  TITLE_FONT_SIZE: 14,
  SIDEREAL_PATH_LINE_WIDTH: 2,
  DOT_RADIUS: 5,
  NAME_MAX_WIDTH: 70,
  DIAMOND_Y: -8,
  DIAMOND_X: 8,
  /** Marker keyboard step (dimensionless). */
  MARKER_KEYBOARD_STEP: 0.02,
  /** Marker shift keyboard step (dimensionless). */
  MARKER_SHIFT_KEYBOARD_STEP: 0.005,
  /** Marker page keyboard step (dimensionless). */
  MARKER_PAGE_KEYBOARD_STEP: 0.1,
} as const;

/** Settings for preferences/PlanetaryConfigurationsPreferencesNode.ts. Layout lengths are in px; counts and ratios are dimensionless. */
export const PLANETARY_CONFIGURATIONS_PREFERENCES_NODE_SETTINGS = {
  HEADER_FONT_SIZE: 18,
  SHOW_REAL_PERIODS_CHECKBOX_FONT_SIZE: 14,
  SHOW_REAL_PERIODS_CHECKBOX_SPACING: 8,
  DESCRIPTION_FONT_SIZE: 12,
  DESCRIPTION_MAX_WIDTH: 420,
  SPACING: 12,
} as const;

/** Settings for ptolemaic/model/PtolemaicModel.ts. */
export const PTOLEMAIC_MODEL_SETTINGS = {
  /** Central-difference interval for apparent angular velocity (days). */
  VELOCITY_DIFFERENCE_STEP: 0.25,
  /** The Sun's ecliptic longitude (degrees) at t = 0. */
  SUN_EPOCH_DEGREES: 280,
  /** Days stepped by one press of the step buttons. */
  STEP_DAYS: 2,
  /** Length (days) of the drawn path and motion-history trail. */
  PATH_DAYS: 900,
} as const;

/** Settings for ptolemaic/view/EpicycleViewNode.ts. Layout lengths are in px; counts and ratios are dimensionless. */
export const EPICYCLE_VIEW_NODE_SETTINGS = {
  /** Positive end of the equant × mark (x), px. */
  EQUANT_MARK_END_X: 5, // px
  /** Positive end of the equant × mark (y), px. */
  EQUANT_MARK_END_Y: 5, // px
  /** Second diagonal start y of the equant × mark, px. */
  EQUANT_MARK_ALT_START_Y: 5, // px

  /** Sun-orbit circle dash length, px. */
  SUN_CIRCLE_LINE_DASH: 4, // px
  /** Sun-orbit circle gap length, px. */
  SUN_CIRCLE_LINE_GAP: 5, // px
  /** Earth–Sun line dash length, px. */
  SUN_LINE_DASH: 6, // px
  /** Earth–Sun line gap length, px. */
  SUN_LINE_GAP: 4, // px
  /** Floor for drawn epicycle radius so the circle never collapses, view units. */
  MIN_EPICYCLE_RADIUS: 0.01,

  /** Fraction of the half-size used by the Sun's circle. */
  FILL_FRACTION: 0.86,
  CORNER_X: 8,
  CORNER_Y: 8,
  CONTENT_CORNER_X: 8,
  CONTENT_CORNER_Y: 8,
  DEFERENT_LINE_WIDTH: 1.5,
  DEFERENT_CENTER_RADIUS: 3,
  EPICYCLE_LINE_WIDTH: 1.5,
  EPICYCLE_CENTER_RADIUS: 2.5,
  EQUANT_MARK_X: -5,
  EQUANT_MARK_Y: -5,
  EQUANT_MARK_LINE_WIDTH: 2,
  EQUANT_LABEL_MAX_WIDTH: 80,
  LEFT_LEFT: 8,
  CENTER_Y_CENTER_Y: -10,
  PATH_LINE_WIDTH: 1.5,
  SUN_LINE_LINE_WIDTH: 1.5,
  PLANET_LINE_LINE_WIDTH: 1.5,
} as const;

/** Settings for ptolemaic/view/PtolemaicControlPanel.ts. Layout lengths are in px; counts and ratios are dimensionless. */
export const PTOLEMAIC_CONTROL_PANEL_SETTINGS = {
  PRESET_ITEMS_SPACING: 6,
  PRESET_ITEMS_RADIUS: 6,
  PRESET_ITEMS_MAX_WIDTH: 110,
  PRESET_COMBO_BOX_X_MARGIN: 8,
  PRESET_COMBO_BOX_Y_MARGIN: 4,
  /** Epicycle size decimal places (dimensionless). */
  EPICYCLE_SIZE_DECIMAL_PLACES: 3,
  /** Epicycle size delta (dimensionless). */
  EPICYCLE_SIZE_DELTA: 0.005,
  /** Eccentricity decimal places (dimensionless). */
  ECCENTRICITY_DECIMAL_PLACES: 3,
  /** Eccentricity delta (dimensionless). */
  ECCENTRICITY_DELTA: 0.005,
  /** Motion rate decimal places (dimensionless). */
  MOTION_RATE_DECIMAL_PLACES: 3,
  /** Motion rate delta (dimensionless). */
  MOTION_RATE_DELTA: 0.01,
} as const;

/** Settings for ptolemaic/view/PtolemaicScreenView.ts. Layout lengths are in px; counts and ratios are dimensionless. */
export const PTOLEMAIC_SCREEN_VIEW_SETTINGS = {
  ZODIAC_STRIP_DECIMALS: 2, // digits

  VALUE_MAX_WIDTH_FACTOR: 0.55, // dimensionless
  NAME_MAX_WIDTH_FACTOR: 0.43, // dimensionless

  GRID_X_SPACING: 8,
  GRID_Y_SPACING: 5,
  READOUT_PANEL_SPACING: 5,
  SPACING: 14,
} as const;

/** Settings for synodic/model/SynodicMotionModel.ts. */
export const SYNODIC_MOTION_MODEL_SETTINGS = {
  /** Trail length bounds (yr): about one and a quarter synodic periods, clamped to these. */
  TRAIL_MIN_YEARS: 0.4,
  /** Trail length bounds (yr): about one and a quarter synodic periods, clamped to these. */
  TRAIL_MAX_YEARS: 2.5,
  /** Trail length bounds (yr): about one and a quarter synodic periods, clamped to these. */
  TRAIL_SYNODIC_FRACTION: 1.25,
} as const;

/** Settings for synodic/view/SynodicMotionScreenView.ts. Layout lengths are in px; counts and ratios are dimensionless. */
export const SYNODIC_MOTION_SCREEN_VIEW_SETTINGS = {
  ZODIAC_STRIP_DECIMALS: 2, // digits

  SPACING: 14,
} as const;

/** Settings for synodic/view/SynodicOrbitViewNode.ts. Layout lengths are in px; counts and ratios are dimensionless. */
export const SYNODIC_ORBIT_VIEW_NODE_SETTINGS = {
  /** Fraction of the region's half-width used by the outer orbit. */
  FILL_FRACTION: 0.8,
  CORNER_X: 8,
  CORNER_Y: 8,
  CONTENT_CORNER_X: 8,
  CONTENT_CORNER_Y: 8,
  OBSERVER_ORBIT_LINE_WIDTH: 1.5,
  TARGET_ORBIT_LINE_WIDTH: 1.5,
} as const;

/** Settings for synodic/view/SynodicReadoutPanel.ts. Layout lengths are in px; counts and ratios are dimensionless. */
export const SYNODIC_READOUT_PANEL_SETTINGS = {
  ELAPSED_STRING_DECIMALS: 3, // digits

  MOTION_TEXT_MAX_WIDTH_FACTOR: 0.62, // dimensionless
  VALUE_MAX_WIDTH_FACTOR: 0.62, // dimensionless
  NAME_MAX_WIDTH_FACTOR: 0.36, // dimensionless
  TEXT_MAX_WIDTH_OFFSET: 40, // px
  SECTION_CONTENT_SPACING: 5, // px

  GRID_X_SPACING: 8,
  GRID_Y_SPACING: 5,
  ARROW_HEAD_WIDTH: 9,
  ARROW_HEAD_HEIGHT: 7,
  ARROW_TAIL_WIDTH: 3,
  ARROW_BUTTON_SPACING: 5,
  ARROW_BUTTON_X_MARGIN: 7,
  ARROW_BUTTON_Y_MARGIN: 4,
  CONTENT_SPACING: 8,
} as const;

/** Settings for synodic/view/SynodicSetupPanel.ts. Layout lengths are in px; counts and ratios are dimensionless. */
export const SYNODIC_SETUP_PANEL_SETTINGS = {
  /** Orbit control decimal places (dimensionless). */
  ORBIT_CONTROL_DECIMAL_PLACES: 2,
  /** Orbit control delta (dimensionless). */
  ORBIT_CONTROL_DELTA: 0.01,
  CONTENT_SPACING: 5,
} as const;

/** Numerical settings; units are specified per value. */
export const ORBITAL_VISIBILITY = {
  /** Elongation hidden in the Sun’s glare (degrees). */
  GLARE_ELONGATION_DEGREES: 15,
  /** Elongation regarded as visible all night (degrees). */
  ALL_NIGHT_ELONGATION_DEGREES: 150,
} as const;

/** Component dimensions in px; ratios and control steps are dimensionless; precision counts digits. */
export const PERIODS_SCREEN_SUMMARY_CONTENT_SETTINGS = {
  YEARS_DECIMALS: 3, // digits
  FIXED_DECIMALS: 2, // digits
} as const;

PlanetaryConfigurationsNamespace.register("PlanetaryConfigurationsConstants", {
  SCREEN_VIEW_MARGIN,
  REGION_GAP,
  PANEL_CORNER_RADIUS,
  DAYS_PER_YEAR,
  EARTH_ORBITAL_SPEED_KM_S,
});
