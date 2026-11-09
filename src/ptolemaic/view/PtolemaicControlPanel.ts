/**
 * PtolemaicControlPanel.ts
 *
 * Pick a planet preset (Ptolemy's values from the NAAP simulator) or adjust the
 * construction: superior/inferior, epicycle size, eccentricity, mean motion rate, and
 * the direction of the apogee.
 */

import { Circle, HBox, type Node, Text, VBox } from "scenerystack/scenery";
import { ComboBox, type ComboBoxItem } from "scenerystack/sun";
import { PlanetType } from "../../common/model/PlanetType.js";
import {
  LIGHT_SURFACE_TEXT_FILL,
  PLANETARY_CONFIGURATIONS_COMBO_BOX_OPTIONS,
} from "../../common/PlanetaryConfigurationsButtonOptions.js";
import { PlanetaryConfigurationsPanel } from "../../common/PlanetaryConfigurationsPanel.js";
import { heading, LABEL_FONT, label, numberControl, radioGroup } from "../../common/view/viewUtils.js";
import { StringManager } from "../../i18n/StringManager.js";
import { PLANET_COLORS } from "../../PlanetaryConfigurationsColors.js";
import {
  APOGEE_ANGLE_RANGE,
  ECCENTRICITY_RANGE,
  EPICYCLE_SIZE_RANGE,
  MOTION_RATE_RANGE,
  PANEL_ROW_SPACING,
} from "../../PlanetaryConfigurationsConstants.js";
import { type PtolemaicModel, PtolemaicPreset } from "../model/PtolemaicModel.js";

export class PtolemaicControlPanel extends PlanetaryConfigurationsPanel {
  public readonly interactiveNodes: readonly Node[];

  public constructor(model: PtolemaicModel, listParent: Node, width: number) {
    const strings = StringManager.getInstance();
    const p = strings.getPtolemaicStrings();
    const common = strings.getCommonStrings();
    const a11y = strings.getPtolemaicA11yStrings().controls;
    const innerWidth = width - 24;

    const presetItems: ComboBoxItem<PtolemaicPreset>[] = [
      PtolemaicPreset.VENUS,
      PtolemaicPreset.MARS,
      PtolemaicPreset.JUPITER,
      PtolemaicPreset.SATURN,
      PtolemaicPreset.CUSTOM,
    ].map((preset) => {
      const nameProperty =
        preset === PtolemaicPreset.CUSTOM ? p.customStringProperty : strings.getPlanetName(preset.planetKey);
      const fill = PLANET_COLORS[preset.planetKey];
      return {
        value: preset,
        createNode: () =>
          new HBox({
            spacing: 6,
            children: [
              new Circle(6, { fill }),
              new Text(nameProperty, { font: LABEL_FONT, fill: LIGHT_SURFACE_TEXT_FILL, maxWidth: 110 }),
            ],
          }),
        accessibleName: nameProperty,
      };
    });
    const presetComboBox = new ComboBox(model.presetProperty, presetItems, listParent, {
      ...PLANETARY_CONFIGURATIONS_COMBO_BOX_OPTIONS,
      xMargin: 8,
      yMargin: 4,
      accessibleName: a11y.presetStringProperty,
    });

    const typeRadio = radioGroup(
      model.planetTypeProperty,
      [
        { value: PlanetType.SUPERIOR, stringProperty: common.superiorStringProperty },
        { value: PlanetType.INFERIOR, stringProperty: common.inferiorStringProperty },
      ],
      a11y.planetTypeStringProperty,
    );

    const titleMaxWidth = innerWidth - 100;
    const epicycleSize = numberControl(p.epicycleSizeStringProperty, model.epicycleSizeProperty, EPICYCLE_SIZE_RANGE, {
      decimalPlaces: 3,
      delta: 0.005,
      accessibleName: a11y.epicycleSizeStringProperty,
      titleMaxWidth,
    });
    const eccentricity = numberControl(p.eccentricityStringProperty, model.eccentricityProperty, ECCENTRICITY_RANGE, {
      decimalPlaces: 3,
      delta: 0.005,
      accessibleName: a11y.eccentricityStringProperty,
      titleMaxWidth,
    });
    const motionRate = numberControl(p.motionRateStringProperty, model.motionRateProperty, MOTION_RATE_RANGE, {
      decimalPlaces: 3,
      delta: 0.01,
      accessibleName: a11y.motionRateStringProperty,
      titleMaxWidth,
    });
    const apogeeAngle = numberControl(p.apogeeAngleStringProperty, model.apogeeAngleProperty, APOGEE_ANGLE_RANGE, {
      decimalPlaces: 0,
      delta: 1,
      accessibleName: a11y.apogeeAngleStringProperty,
      titleMaxWidth,
    });

    super(
      new VBox({
        align: "left",
        spacing: PANEL_ROW_SPACING,
        children: [
          heading(p.presetStringProperty, innerWidth),
          presetComboBox,
          label(common.planetTypeStringProperty, { maxWidth: innerWidth }),
          typeRadio,
          epicycleSize,
          eccentricity,
          motionRate,
          apogeeAngle,
        ],
      }),
      { minWidth: width, maxWidth: width, align: "left" },
    );
    this.interactiveNodes = [presetComboBox, typeRadio, epicycleSize, eccentricity, motionRate, apogeeAngle];
  }
}
