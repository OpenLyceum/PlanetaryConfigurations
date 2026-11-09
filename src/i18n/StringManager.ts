/**
 * StringManager.ts
 *
 * Centralizes all localized string access for the simulation.
 *
 * Strings are loaded from JSON files per locale and wrapped in reactive
 * Property objects by SceneryStack. When the user switches language in the
 * Preferences dialog, all StringProperties update automatically.
 *
 * ── How to add a locale ───────────────────────────────────────────────────────
 * 1. Create src/i18n/strings_XX.json with the same keys as strings_en.json
 * 2. Import it below and add `XX: stringsXX` to the locale map
 * 3. Add "XX" to `availableLocales` in src/init.ts
 *
 * ── How to add a string ───────────────────────────────────────────────────────
 * 1. Add the key + English value to strings_en.json
 * 2. Add the same key + translated value to ALL other locale files
 *    (TypeScript will show an error here if any locale is missing a key)
 * 3. Expose the new StringProperty via a getter method below
 */

import type { ReadOnlyProperty } from "scenerystack/axon";
import { LocalizedString } from "scenerystack/chipper";
import type { ConfigurationEventKey } from "../common/model/ConfigurationEvent.js";
import type { PlanetKey } from "../common/model/PlanetChoice.js";
import stringsEn from "./strings_en.json";
import stringsEs from "./strings_es.json";
import stringsFr from "./strings_fr.json";

// ── Compile-time key-parity check ─────────────────────────────────────────────
// English is the canonical shape; every other locale must match it exactly.
// TypeScript errors here if any locale file is missing (or adds) a key relative to
// English. Add one `satisfies` line per new locale so the check stays exhaustive.
// biome-ignore lint/complexity/noVoid: intentional compile-time type assertion
void (stringsFr satisfies typeof stringsEn);
// biome-ignore lint/complexity/noVoid: intentional compile-time type assertion
void (stringsEn satisfies typeof stringsFr);
// biome-ignore lint/complexity/noVoid: intentional compile-time type assertion
void (stringsEs satisfies typeof stringsEn);
// biome-ignore lint/complexity/noVoid: intentional compile-time type assertion
void (stringsEn satisfies typeof stringsEs);

// ── Build the reactive string property tree ───────────────────────────────────
const stringProperties = LocalizedString.getNestedStringProperties({
  en: stringsEn,
  fr: stringsFr,
  es: stringsEs,
});

type StringTree = typeof stringProperties;

/** The twelve zodiac constellations in order of increasing ecliptic longitude, starting at Pisces/Aries. */
const ZODIAC_ORDER = [
  "aries",
  "taurus",
  "gemini",
  "cancer",
  "leo",
  "virgo",
  "libra",
  "scorpius",
  "sagittarius",
  "capricornus",
  "aquarius",
  "pisces",
] as const;

export type ZodiacKey = (typeof ZODIAC_ORDER)[number];

/**
 * StringManager is a singleton that provides typed access to all localized
 * strings. Use `StringManager.getInstance()` everywhere — never construct it
 * directly.
 */
export class StringManager {
  private static instance: StringManager | null = null;

  private constructor() {
    // Private — obtain via getInstance()
  }

  public static getInstance(): StringManager {
    if (StringManager.instance === null) {
      StringManager.instance = new StringManager();
    }
    return StringManager.instance;
  }

  /** The simulation title shown in the navigation bar and browser tab. */
  public getTitleStringProperty(): ReadOnlyProperty<string> {
    return stringProperties.titleStringProperty;
  }

  /** Screen name StringProperties used when constructing Screen instances. */
  public getScreenNames(): StringTree["screens"] {
    return stringProperties.screens;
  }

  /** The localized name of a planet. */
  public getPlanetName(key: PlanetKey): ReadOnlyProperty<string> {
    return stringProperties.planets[`${key}StringProperty`];
  }

  /** The localized name of a configuration or stationary point. */
  public getEventName(key: ConfigurationEventKey): ReadOnlyProperty<string> {
    return stringProperties.events[`${key}StringProperty`];
  }

  /** The twelve zodiac constellation names, Aries first. */
  public getZodiacNames(): readonly { key: ZodiacKey; stringProperty: ReadOnlyProperty<string> }[] {
    return ZODIAC_ORDER.map((key) => ({ key, stringProperty: stringProperties.zodiac[`${key}StringProperty`] }));
  }

  /** Strings shared by several screens: directions, units, patterns, common checkboxes. */
  public getCommonStrings(): StringTree["common"] {
    return stringProperties.common;
  }

  public getOrbitsStrings(): StringTree["orbits"] {
    return stringProperties.orbits;
  }

  public getConfigurationsStrings(): StringTree["configurations"] {
    return stringProperties.configurations;
  }

  public getSynodicMotionStrings(): StringTree["synodic"] {
    return stringProperties.synodic;
  }

  public getPeriodsStrings(): StringTree["periods"] {
    return stringProperties.periods;
  }

  public getPtolemaicStrings(): StringTree["ptolemaic"] {
    return stringProperties.ptolemaic;
  }

  /** Labels for the sim-specific rows of the keyboard-help dialog. */
  public getKeyboardHelpStrings(): StringTree["keyboardHelp"] {
    return stringProperties.keyboardHelp;
  }

  /** Accessibility strings for the Orbits screen. */
  public getOrbitsA11yStrings(): StringTree["a11y"]["orbits"] {
    return stringProperties.a11y.orbits;
  }

  /** Accessibility strings for the Configurations screen. */
  public getConfigurationsA11yStrings(): StringTree["a11y"]["configurations"] {
    return stringProperties.a11y.configurations;
  }

  /** Accessibility strings for the Synodic Motion screen. */
  public getSynodicMotionA11yStrings(): StringTree["a11y"]["synodic"] {
    return stringProperties.a11y.synodic;
  }

  /** Accessibility strings for the Periods screen. */
  public getPeriodsA11yStrings(): StringTree["a11y"]["periods"] {
    return stringProperties.a11y.periods;
  }

  /** Accessibility strings for the Ptolemaic screen. */
  public getPtolemaicA11yStrings(): StringTree["a11y"]["ptolemaic"] {
    return stringProperties.a11y.ptolemaic;
  }

  /** Simulation-specific preference labels shown in Preferences → Simulation. */
  public getPreferences(): StringTree["preferences"] {
    return stringProperties.preferences;
  }
}
