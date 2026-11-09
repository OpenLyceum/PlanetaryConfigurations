/**
 * PlanetaryConfigurationsColors.ts
 *
 * Defines all dynamic colors for the simulation using ProfileColorProperty.
 *
 * Each color has two profiles:
 *   - "default"   — used in standard (dark) mode
 *   - "projector" — used when the user enables Projector Mode in Preferences
 *
 * SceneryStack switches profiles automatically; no manual toggling is needed.
 *
 * ── Usage ─────────────────────────────────────────────────────────────────────
 *   import PlanetaryConfigurationsColors from "../../PlanetaryConfigurationsColors.js";
 *   new Circle(5, { fill: PlanetaryConfigurationsColors.sunColorProperty });
 *
 * ── How to add a color ────────────────────────────────────────────────────────
 * Add a new ProfileColorProperty entry below. Always provide both "default" and
 * "projector" values.
 */
import { ProfileColorProperty } from "scenerystack/scenery";
import type { PlanetKey } from "./common/model/PlanetChoice.js";
import PlanetaryConfigurationsNamespace from "./PlanetaryConfigurationsNamespace.js";

const PlanetaryConfigurationsColors = {
  // ── Chrome ────────────────────────────────────────────────────────────────────
  /** Background color for the simulation screen. */
  backgroundColorProperty: new ProfileColorProperty(PlanetaryConfigurationsNamespace, "background", {
    default: "#0b1020",
    projector: "#ffffff",
  }),
  /** Primary accent color for highlights and selected items. */
  accentColorProperty: new ProfileColorProperty(PlanetaryConfigurationsNamespace, "accent", {
    default: "#4fc3f7",
    projector: "#0d47a1",
  }),
  /** Background fill for control panels and dialogs. */
  panelBackgroundColorProperty: new ProfileColorProperty(PlanetaryConfigurationsNamespace, "panelBackground", {
    default: "#16213e",
    projector: "#f3f4f7",
  }),
  /** Border/stroke color for control panels and dialogs. */
  panelBorderColorProperty: new ProfileColorProperty(PlanetaryConfigurationsNamespace, "panelBorder", {
    default: "#2b4a7a",
    projector: "#9aa3b2",
  }),
  /** Text color for labels, readouts, and general UI text. */
  textColorProperty: new ProfileColorProperty(PlanetaryConfigurationsNamespace, "text", {
    default: "#e6e9ef",
    projector: "#1a1a1a",
  }),
  /** Secondary (dimmer) text: units, hints, column headers. */
  secondaryTextColorProperty: new ProfileColorProperty(PlanetaryConfigurationsNamespace, "secondaryText", {
    default: "#a9b4c8",
    projector: "#4a5363",
  }),
  /** Background of the orbit / chart drawing areas. */
  viewBackgroundColorProperty: new ProfileColorProperty(PlanetaryConfigurationsNamespace, "viewBackground", {
    default: "#060914",
    projector: "#fbfcff",
  }),
  /** Border of the orbit / chart drawing areas. */
  viewBorderColorProperty: new ProfileColorProperty(PlanetaryConfigurationsNamespace, "viewBorder", {
    default: "#24345a",
    projector: "#c3c9d4",
  }),

  // ── Light control surfaces ───────────────────────────────────────────────────
  // White chrome (combo boxes, flat push buttons, editable input fields) stays light
  // in both profiles; its text stays dark.

  /** Fill of light control surfaces: combo-box button/list, editable input fields. */
  controlSurfaceColorProperty: new ProfileColorProperty(PlanetaryConfigurationsNamespace, "controlSurface", {
    default: "#ffffff",
    projector: "#ffffff",
  }),
  /** Fill of a disabled control surface (grayed-out editable input field). */
  controlSurfaceDisabledColorProperty: new ProfileColorProperty(
    PlanetaryConfigurationsNamespace,
    "controlSurfaceDisabled",
    {
      default: "#cccccc",
      projector: "#cccccc",
    },
  ),
  /** Text on light control surfaces: combo items, flat-button labels, field values, preferences. */
  controlSurfaceTextColorProperty: new ProfileColorProperty(PlanetaryConfigurationsNamespace, "controlSurfaceText", {
    default: "#1a1a1a",
    projector: "#1a1a1a",
  }),

  // ── Bodies ────────────────────────────────────────────────────────────────────
  sunColorProperty: new ProfileColorProperty(PlanetaryConfigurationsNamespace, "sun", {
    default: "#ffd54f",
    projector: "#f9a825",
  }),
  sunGlowColorProperty: new ProfileColorProperty(PlanetaryConfigurationsNamespace, "sunGlow", {
    default: "rgba(255,213,79,0.25)",
    projector: "rgba(249,168,37,0.25)",
  }),
  mercuryColorProperty: new ProfileColorProperty(PlanetaryConfigurationsNamespace, "mercury", {
    default: "#b0a89e",
    projector: "#6d655c",
  }),
  venusColorProperty: new ProfileColorProperty(PlanetaryConfigurationsNamespace, "venus", {
    default: "#f3e5ab",
    projector: "#b8860b",
  }),
  earthColorProperty: new ProfileColorProperty(PlanetaryConfigurationsNamespace, "earth", {
    default: "#4fa3ff",
    projector: "#1565c0",
  }),
  marsColorProperty: new ProfileColorProperty(PlanetaryConfigurationsNamespace, "mars", {
    default: "#ff6f50",
    projector: "#c62828",
  }),
  jupiterColorProperty: new ProfileColorProperty(PlanetaryConfigurationsNamespace, "jupiter", {
    default: "#e0b080",
    projector: "#a0522d",
  }),
  saturnColorProperty: new ProfileColorProperty(PlanetaryConfigurationsNamespace, "saturn", {
    default: "#e6cf7a",
    projector: "#8d6e00",
  }),
  hypotheticalColorProperty: new ProfileColorProperty(PlanetaryConfigurationsNamespace, "hypothetical", {
    default: "#c58cff",
    projector: "#7b1fa2",
  }),
  /** Outline drawn around the observer's planet. */
  observerRingColorProperty: new ProfileColorProperty(PlanetaryConfigurationsNamespace, "observerRing", {
    default: "#ffffff",
    projector: "#1a1a1a",
  }),

  // ── Orbit-view geometry ───────────────────────────────────────────────────────
  orbitColorProperty: new ProfileColorProperty(PlanetaryConfigurationsNamespace, "orbit", {
    default: "rgba(170,190,230,0.55)",
    projector: "rgba(60,70,90,0.55)",
  }),
  faintOrbitColorProperty: new ProfileColorProperty(PlanetaryConfigurationsNamespace, "faintOrbit", {
    default: "rgba(170,190,230,0.2)",
    projector: "rgba(60,70,90,0.2)",
  }),
  sunLineColorProperty: new ProfileColorProperty(PlanetaryConfigurationsNamespace, "sunLine", {
    default: "#ffd54f",
    projector: "#e65100",
  }),
  targetLineColorProperty: new ProfileColorProperty(PlanetaryConfigurationsNamespace, "targetLine", {
    default: "#9be7ff",
    projector: "#0277bd",
  }),
  elongationArcColorProperty: new ProfileColorProperty(PlanetaryConfigurationsNamespace, "elongationArc", {
    default: "#ffffff",
    projector: "#212121",
  }),
  eastSideColorProperty: new ProfileColorProperty(PlanetaryConfigurationsNamespace, "eastSide", {
    default: "rgba(79,195,247,0.08)",
    projector: "rgba(2,119,189,0.07)",
  }),
  westSideColorProperty: new ProfileColorProperty(PlanetaryConfigurationsNamespace, "westSide", {
    default: "rgba(255,183,77,0.08)",
    projector: "rgba(230,81,0,0.07)",
  }),
  eastLabelColorProperty: new ProfileColorProperty(PlanetaryConfigurationsNamespace, "eastLabel", {
    default: "#7fd3fa",
    projector: "#01579b",
  }),
  westLabelColorProperty: new ProfileColorProperty(PlanetaryConfigurationsNamespace, "westLabel", {
    default: "#ffb74d",
    projector: "#bf360c",
  }),
  configurationMarkerColorProperty: new ProfileColorProperty(PlanetaryConfigurationsNamespace, "configurationMarker", {
    default: "#cfd8dc",
    projector: "#455a64",
  }),
  speedArrowColorProperty: new ProfileColorProperty(PlanetaryConfigurationsNamespace, "speedArrow", {
    default: "#a5d6a7",
    projector: "#2e7d32",
  }),

  // ── Ptolemaic construction ────────────────────────────────────────────────────
  deferentColorProperty: new ProfileColorProperty(PlanetaryConfigurationsNamespace, "deferent", {
    default: "#80cbc4",
    projector: "#00695c",
  }),
  epicycleColorProperty: new ProfileColorProperty(PlanetaryConfigurationsNamespace, "epicycle", {
    default: "#f48fb1",
    projector: "#ad1457",
  }),
  equantColorProperty: new ProfileColorProperty(PlanetaryConfigurationsNamespace, "equant", {
    default: "#ce93d8",
    projector: "#6a1b9a",
  }),
  pathColorProperty: new ProfileColorProperty(PlanetaryConfigurationsNamespace, "path", {
    default: "rgba(255,111,80,0.75)",
    projector: "rgba(198,40,40,0.75)",
  }),

  // ── Zodiac strip ──────────────────────────────────────────────────────────────
  zodiacBandColorProperty: new ProfileColorProperty(PlanetaryConfigurationsNamespace, "zodiacBand", {
    default: "#0f1733",
    projector: "#e8edf7",
  }),
  zodiacBorderColorProperty: new ProfileColorProperty(PlanetaryConfigurationsNamespace, "zodiacBorder", {
    default: "#2b4a7a",
    projector: "#9aa3b2",
  }),
  zodiacDividerColorProperty: new ProfileColorProperty(PlanetaryConfigurationsNamespace, "zodiacDivider", {
    default: "rgba(150,170,210,0.25)",
    projector: "rgba(80,90,110,0.25)",
  }),
  zodiacLabelColorProperty: new ProfileColorProperty(PlanetaryConfigurationsNamespace, "zodiacLabel", {
    default: "#8ea2c8",
    projector: "#4a5363",
  }),
  starColorProperty: new ProfileColorProperty(PlanetaryConfigurationsNamespace, "star", {
    default: "#dfe7ff",
    projector: "#283593",
  }),
  constellationLineColorProperty: new ProfileColorProperty(PlanetaryConfigurationsNamespace, "constellationLine", {
    default: "rgba(160,180,230,0.35)",
    projector: "rgba(40,53,147,0.3)",
  }),
  referenceTickColorProperty: new ProfileColorProperty(PlanetaryConfigurationsNamespace, "referenceTick", {
    default: "#ffffff",
    projector: "#000000",
  }),
  historyLaneColorProperty: new ProfileColorProperty(PlanetaryConfigurationsNamespace, "historyLane", {
    default: "#0a1128",
    projector: "#f5f7fb",
  }),
  trailColorProperty: new ProfileColorProperty(PlanetaryConfigurationsNamespace, "trail", {
    default: "#9be7ff",
    projector: "#0277bd",
  }),
  retrogradeColorProperty: new ProfileColorProperty(PlanetaryConfigurationsNamespace, "retrograde", {
    default: "#ff8a65",
    projector: "#d84315",
  }),

  // ── Charts ────────────────────────────────────────────────────────────────────
  chartGridColorProperty: new ProfileColorProperty(PlanetaryConfigurationsNamespace, "chartGrid", {
    default: "rgba(150,170,210,0.18)",
    projector: "rgba(80,90,110,0.18)",
  }),
  chartAxisColorProperty: new ProfileColorProperty(PlanetaryConfigurationsNamespace, "chartAxis", {
    default: "#a9b4c8",
    projector: "#4a5363",
  }),
  synodicCurveColorProperty: new ProfileColorProperty(PlanetaryConfigurationsNamespace, "synodicCurve", {
    default: "#4fc3f7",
    projector: "#0277bd",
  }),
  siderealCurveColorProperty: new ProfileColorProperty(PlanetaryConfigurationsNamespace, "siderealCurve", {
    default: "#a5d6a7",
    projector: "#2e7d32",
  }),
  asymptoteColorProperty: new ProfileColorProperty(PlanetaryConfigurationsNamespace, "asymptote", {
    default: "rgba(255,255,255,0.45)",
    projector: "rgba(0,0,0,0.45)",
  }),
  calculatorPointColorProperty: new ProfileColorProperty(PlanetaryConfigurationsNamespace, "calculatorPoint", {
    default: "#ffd54f",
    projector: "#e65100",
  }),
};

/** Fill color for each planet, keyed by {@link PlanetKey}. */
export const PLANET_COLORS: Readonly<Record<PlanetKey, ProfileColorProperty>> = {
  mercury: PlanetaryConfigurationsColors.mercuryColorProperty,
  venus: PlanetaryConfigurationsColors.venusColorProperty,
  earth: PlanetaryConfigurationsColors.earthColorProperty,
  mars: PlanetaryConfigurationsColors.marsColorProperty,
  jupiter: PlanetaryConfigurationsColors.jupiterColorProperty,
  saturn: PlanetaryConfigurationsColors.saturnColorProperty,
  hypothetical: PlanetaryConfigurationsColors.hypotheticalColorProperty,
};

export default PlanetaryConfigurationsColors;
