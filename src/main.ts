/**
 * main.ts
 *
 * Entry point for the simulation. Initializes SceneryStack, creates the
 * screens, and starts the main event loop.
 *
 * !! CRITICAL IMPORT ORDER !!
 * brand.js MUST be the first import. Each module imports the next, so the import nesting is
 *
 *   main → brand → splash → assert → init
 *
 * and therefore the actual EXECUTION order (deepest import runs first) is the reverse:
 *
 *   init → assert → splash → brand → main
 *
 * SceneryStack requires this exact load order. Never reorder these imports.
 */

// brand.js MUST be first; importing it runs the whole chain (init→assert→splash→brand) before main.
import "./brand.js";

import { onReadyToLaunch, PreferencesModel, Sim } from "scenerystack/sim";
import { Tandem } from "scenerystack/tandem";
import { ConfigurationsScreen } from "./configurations/ConfigurationsScreen.js";
import { StringManager } from "./i18n/StringManager.js";
import { OrbitsScreen } from "./orbits/OrbitsScreen.js";
import PlanetaryConfigurationsColors from "./PlanetaryConfigurationsColors.js";
import { PeriodsScreen } from "./periods/PeriodsScreen.js";
import { planetaryConfigurationsPreferences } from "./preferences/PlanetaryConfigurationsPreferencesModel.js";
import { PlanetaryConfigurationsPreferencesNode } from "./preferences/PlanetaryConfigurationsPreferencesNode.js";
import { PtolemaicScreen } from "./ptolemaic/PtolemaicScreen.js";
import { SynodicMotionScreen } from "./synodic/SynodicMotionScreen.js";

onReadyToLaunch(() => {
  const stringManager = StringManager.getInstance();

  const screens = [
    new OrbitsScreen({
      name: stringManager.getScreenNames().orbitsStringProperty,
      tandem: Tandem.ROOT.createTandem("orbitsScreen"),
      backgroundColorProperty: PlanetaryConfigurationsColors.backgroundColorProperty,
    }),
    new ConfigurationsScreen({
      name: stringManager.getScreenNames().configurationsStringProperty,
      tandem: Tandem.ROOT.createTandem("configurationsScreen"),
      backgroundColorProperty: PlanetaryConfigurationsColors.backgroundColorProperty,
    }),
    new SynodicMotionScreen({
      name: stringManager.getScreenNames().synodicStringProperty,
      tandem: Tandem.ROOT.createTandem("synodicScreen"),
      backgroundColorProperty: PlanetaryConfigurationsColors.backgroundColorProperty,
    }),
    new PeriodsScreen({
      name: stringManager.getScreenNames().periodsStringProperty,
      tandem: Tandem.ROOT.createTandem("periodsScreen"),
      backgroundColorProperty: PlanetaryConfigurationsColors.backgroundColorProperty,
    }),
    new PtolemaicScreen({
      name: stringManager.getScreenNames().ptolemaicStringProperty,
      tandem: Tandem.ROOT.createTandem("ptolemaicScreen"),
      backgroundColorProperty: PlanetaryConfigurationsColors.backgroundColorProperty,
    }),
  ];

  const sim = new Sim(stringManager.getTitleStringProperty(), screens, {
    preferencesModel: new PreferencesModel({
      visualOptions: {
        // Adds a "Projector Mode" toggle in Preferences → Visual
        supportsProjectorMode: true,
        // Enables keyboard-navigation highlight outlines
        supportsInteractiveHighlights: true,
      },
      simulationOptions: {
        customPreferences: [
          {
            createContent: (tandem: Tandem) =>
              new PlanetaryConfigurationsPreferencesNode(planetaryConfigurationsPreferences, tandem),
          },
        ],
      },
      localizationOptions: {
        // Adds a language picker in Preferences → Language
        supportsDynamicLocale: true,
      },
    }),

    // Optional: fill in credits shown in Help → About
    credits: {
      leadDesign: "",
      softwareDevelopment: "",
      team: "",
      qualityAssurance: "",
    },
  });

  sim.start();
});
