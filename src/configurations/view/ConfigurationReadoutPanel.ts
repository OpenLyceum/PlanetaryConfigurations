/**
 * ConfigurationReadoutPanel.ts
 *
 * What Earth sees: the planet's signed elongation, the configuration it is in, and
 * where it appears in Earth's sky (evening, morning, all night, or lost in the glare),
 * which answers "when is a planet easiest to observe?" (Q5, Q9).
 */

import type { TReadOnlyProperty } from "scenerystack/axon";
import { GridBox, Text, VBox } from "scenerystack/scenery";
import { PlanetaryConfigurationsPanel } from "../../common/PlanetaryConfigurationsPanel.js";
import { elongationStringProperty, skyStringProperty } from "../../common/view/elongationStrings.js";
import { BIG_READOUT_FONT, eventNameProperty, heading, label, READOUT_FONT } from "../../common/view/viewUtils.js";
import { StringManager } from "../../i18n/StringManager.js";
import PlanetaryConfigurationsColors from "../../PlanetaryConfigurationsColors.js";
import type { ConfigurationsModel } from "../model/ConfigurationsModel.js";

export class ConfigurationReadoutPanel extends PlanetaryConfigurationsPanel {
  public constructor(model: ConfigurationsModel, width: number) {
    const strings = StringManager.getInstance();
    const common = strings.getCommonStrings();
    const innerWidth = width - 24;

    const name = (stringProperty: TReadOnlyProperty<string>): Text =>
      label(stringProperty, {
        maxWidth: innerWidth * 0.34,
        fill: PlanetaryConfigurationsColors.secondaryTextColorProperty,
      });
    const value = (stringProperty: TReadOnlyProperty<string>, big = false): Text =>
      new Text(stringProperty, {
        font: big ? BIG_READOUT_FONT : READOUT_FONT,
        fill: PlanetaryConfigurationsColors.textColorProperty,
        maxWidth: innerWidth * 0.64,
      });

    const grid = new GridBox({
      xSpacing: 10,
      ySpacing: 8,
      xAlign: "left",
      rows: [
        [name(common.elongationStringProperty), value(elongationStringProperty(model.elongationProperty), true)],
        [name(common.configurationStringProperty), value(eventNameProperty(model.configurationProperty), true)],
        [name(common.skyStringProperty), value(skyStringProperty(model.elongationProperty))],
      ],
    });

    super(
      new VBox({
        align: "left",
        spacing: 10,
        children: [heading(strings.getConfigurationsStrings().readoutsStringProperty, innerWidth), grid],
      }),
      { minWidth: width, maxWidth: width, align: "left" },
    );
  }
}
