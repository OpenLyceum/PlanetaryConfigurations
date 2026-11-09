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
import { planetaryConfigurationsPreferences } from "../../preferences/PlanetaryConfigurationsPreferencesModel.js";

/** Measured mean synodic periods seen from Earth (days), for comparison with the model. */
const MEASURED_SYNODIC_DAYS: Readonly<Partial<Record<PlanetKey, number>>> = {
  mercury: 115.88,
  venus: 583.92,
  mars: 779.94,
  jupiter: 398.88,
  saturn: 378.09,
};

export class OrbitalDataPanel extends PlanetaryConfigurationsPanel {
  public constructor(width: number) {
    const strings = StringManager.getInstance();
    const s = strings.getOrbitsStrings();
    const common = strings.getCommonStrings();
    const innerWidth = width - 24;

    const cell = (text: string | typeof common.noneStringProperty): Text =>
      new Text(text, { font: READOUT_FONT, fill: PlanetaryConfigurationsColors.textColorProperty, maxWidth: 70 });
    const header = (stringProperty: Parameters<typeof label>[0]): Text =>
      label(stringProperty, { maxWidth: 76, fill: PlanetaryConfigurationsColors.secondaryTextColorProperty });

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
          spacing: 6,
          children: [
            new Circle(5, { fill: PLANET_COLORS[planet.key] }),
            label(strings.getPlanetName(planet.key), { maxWidth: 70 }),
          ],
        }),
        cell(fixed(a, 3)),
        cell(fixed(siderealPeriod(a), 2)),
        cell(fixed(orbitalSpeed(a), 1)),
        measuredCell,
      ]);
    }
    planetaryConfigurationsPreferences.showRealPeriodsProperty.link((show) => {
      measuredHeader.visible = show;
      for (const measuredCell of measuredCells) {
        measuredCell.visible = show;
      }
    });

    super(
      new VBox({
        align: "left",
        spacing: 8,
        children: [
          heading(s.orbitalDataStringProperty, innerWidth),
          new GridBox({ xSpacing: 14, ySpacing: 5, xAlign: "right", rows, maxWidth: innerWidth }),
        ],
      }),
      { minWidth: width, maxWidth: width, align: "left" },
    );
  }
}
