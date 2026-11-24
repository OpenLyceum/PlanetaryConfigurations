import { ORBITAL_DATA_PANEL_SETTINGS } from "../../PlanetaryConfigurationsConstants.js";
/**
 * OrbitalDataPanel.ts
 *
 * A table of each planet's distance a (AU), sidereal period P = a^1.5 (yr) and orbital
 * speed v (km/s), so the speed–distance trend of Q1 can be read off as numbers too.
 * With the "Show measured periods" preference, a column lists each planet's measured
 * synodic period seen from Earth.
 */

import { Circle, GridBox, HBox, type Node, Text, VBox } from "scenerystack/scenery";
import { orbitalSpeed, siderealPeriod } from "../../common/model/orbitalMath.js";
import { PlanetChoice, type PlanetKey } from "../../common/model/PlanetChoice.js";
import { PlanetaryConfigurationsPanel } from "../../common/PlanetaryConfigurationsPanel.js";
import { fixed, heading, label, READOUT_FONT } from "../../common/view/viewUtils.js";
import { StringManager } from "../../i18n/StringManager.js";
import PlanetaryConfigurationsColors, { PLANET_COLORS } from "../../PlanetaryConfigurationsColors.js";
import type { PlanetaryConfigurationsPreferencesModel } from "../../preferences/PlanetaryConfigurationsPreferencesModel.js";

/** Measured mean synodic periods seen from Earth (days), for comparison with the model. */
const MEASURED_SYNODIC_DAYS: Readonly<Partial<Record<PlanetKey, number>>> = {
  mercury: 115.88,
  venus: 583.92,
  mars: 779.94,
  jupiter: 398.88,
  saturn: 378.09,
};

export class OrbitalDataPanel extends PlanetaryConfigurationsPanel {
  public constructor(width: number, preferences: PlanetaryConfigurationsPreferencesModel) {
    const strings = StringManager.getInstance();
    const s = strings.getOrbitsStrings();
    const common = strings.getCommonStrings();
    const innerWidth = width - 24;

    const cell = (text: string | typeof common.noneStringProperty): Text =>
      new Text(text, {
        font: READOUT_FONT,
        fill: PlanetaryConfigurationsColors.textColorProperty,
        maxWidth: ORBITAL_DATA_PANEL_SETTINGS.CELL_MAX_WIDTH,
      });
    const header = (stringProperty: Parameters<typeof label>[0]): Text =>
      label(stringProperty, {
        maxWidth: ORBITAL_DATA_PANEL_SETTINGS.HEADER_MAX_WIDTH,
        fill: PlanetaryConfigurationsColors.secondaryTextColorProperty,
      });

    const measuredHeader = header(s.measuredSynodicStringProperty);
    const measuredCells: Node[] = [];
    const rows: Node[][] = [
      [
        header(s.planetStringProperty),
        header(s.distanceStringProperty),
        header(s.periodStringProperty),
        header(s.speedStringProperty),
        measuredHeader,
      ],
    ];
    for (const planet of PlanetChoice.REAL_PLANETS) {
      const a = planet.axis(1);
      const measured = MEASURED_SYNODIC_DAYS[planet.key];
      const measuredCell = cell(measured === undefined ? common.noneStringProperty : fixed(measured, 1));
      measuredCells.push(measuredCell);
      rows.push([
        new HBox({
          spacing: ORBITAL_DATA_PANEL_SETTINGS.ROW_SPACING,
          children: [
            new Circle(ORBITAL_DATA_PANEL_SETTINGS.RADIUS, { fill: PLANET_COLORS[planet.key] }),
            label(strings.getPlanetName(planet.key), { maxWidth: ORBITAL_DATA_PANEL_SETTINGS.MAX_WIDTH }),
          ],
        }),
        cell(fixed(a, ORBITAL_DATA_PANEL_SETTINGS.FIXED_DECIMALS)),
        cell(fixed(siderealPeriod(a), ORBITAL_DATA_PANEL_SETTINGS.FIXED_DECIMALS_SEGMENT_2)),
        cell(fixed(orbitalSpeed(a), 1)),
        measuredCell,
      ]);
    }
    preferences.showRealPeriodsProperty.link((show) => {
      measuredHeader.visible = show;
      for (const measuredCell of measuredCells) {
        measuredCell.visible = show;
      }
    });

    super(
      new VBox({
        align: "left",
        spacing: ORBITAL_DATA_PANEL_SETTINGS.SPACING,
        children: [
          heading(s.orbitalDataStringProperty, innerWidth),
          new GridBox({
            xSpacing: ORBITAL_DATA_PANEL_SETTINGS.X_SPACING,
            ySpacing: ORBITAL_DATA_PANEL_SETTINGS.Y_SPACING,
            xAlign: "right",
            rows,
            maxWidth: innerWidth,
          }),
        ],
      }),
      { minWidth: width, maxWidth: width, align: "left" },
    );
  }
}
