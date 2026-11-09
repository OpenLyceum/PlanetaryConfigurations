/**
 * ConfigurationsControlPanel.ts
 *
 * Choose a superior or inferior hypothetical planet and its orbit radius, and what the
 * view shows: sight lines, the elongation angle, the east and west sides of Earth's sky,
 * where each named configuration lies, labels, and snapping.
 */

import type { Node } from "scenerystack/scenery";
import { VBox } from "scenerystack/scenery";
import { PlanetType } from "../../common/model/PlanetType.js";
import { PlanetaryConfigurationsPanel } from "../../common/PlanetaryConfigurationsPanel.js";
import { checkbox, heading, label, numberControl, radioGroup } from "../../common/view/viewUtils.js";
import { StringManager } from "../../i18n/StringManager.js";
import { PANEL_ROW_SPACING } from "../../PlanetaryConfigurationsConstants.js";
import { type ConfigurationsModel, INFERIOR_A_RANGE, SUPERIOR_A_RANGE } from "../model/ConfigurationsModel.js";

export class ConfigurationsControlPanel extends PlanetaryConfigurationsPanel {
  public readonly interactiveNodes: readonly Node[];

  public constructor(model: ConfigurationsModel, width: number) {
    const strings = StringManager.getInstance();
    const common = strings.getCommonStrings();
    const s = strings.getConfigurationsStrings();
    const a11y = strings.getConfigurationsA11yStrings().controls;
    const innerWidth = width - 24;

    const typeRadio = radioGroup(
      model.planetTypeProperty,
      [
        { value: PlanetType.SUPERIOR, stringProperty: common.superiorStringProperty },
        { value: PlanetType.INFERIOR, stringProperty: common.inferiorStringProperty },
      ],
      a11y.planetTypeStringProperty,
    );

    const radiusSpec = {
      decimalPlaces: 2,
      delta: 0.01,
      valuePattern: common.auPatternStringProperty,
      accessibleName: a11y.orbitRadiusStringProperty,
      titleMaxWidth: innerWidth - 110,
    };
    const superiorControl = numberControl(
      common.orbitRadiusStringProperty,
      model.superiorAProperty,
      SUPERIOR_A_RANGE,
      radiusSpec,
    );
    const inferiorControl = numberControl(
      common.orbitRadiusStringProperty,
      model.inferiorAProperty,
      INFERIOR_A_RANGE,
      radiusSpec,
    );
    model.planetTypeProperty.link((type) => {
      superiorControl.visible = type === PlanetType.SUPERIOR;
      inferiorControl.visible = type === PlanetType.INFERIOR;
    });

    const boxes = [
      checkbox(
        model.showSightLinesProperty,
        common.sightLinesStringProperty,
        common.sightLinesStringProperty,
        innerWidth,
      ),
      checkbox(
        model.showElongationArcProperty,
        common.elongationAngleStringProperty,
        common.elongationAngleStringProperty,
        innerWidth,
      ),
      checkbox(model.showSidesProperty, s.eastWestSidesStringProperty, a11y.eastWestSidesStringProperty, innerWidth),
      checkbox(
        model.showConfigurationPositionsProperty,
        s.configurationPositionsStringProperty,
        a11y.configurationPositionsStringProperty,
        innerWidth,
      ),
      checkbox(model.showLabelsProperty, common.labelsStringProperty, common.labelsStringProperty, innerWidth),
      checkbox(
        model.snapProperty,
        common.snapToConfigurationsStringProperty,
        common.snapToConfigurationsStringProperty,
        innerWidth,
      ),
    ];

    super(
      new VBox({
        align: "left",
        spacing: PANEL_ROW_SPACING + 2,
        children: [
          heading(s.planetStringProperty, innerWidth),
          label(common.planetTypeStringProperty, { maxWidth: innerWidth }),
          typeRadio,
          superiorControl,
          inferiorControl,
          new VBox({ align: "left", spacing: 6, children: boxes }),
        ],
      }),
      { minWidth: width, maxWidth: width, align: "left" },
    );
    this.interactiveNodes = [typeRadio, superiorControl, inferiorControl, ...boxes];
  }
}
