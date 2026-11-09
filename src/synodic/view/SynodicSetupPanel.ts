/**
 * SynodicSetupPanel.ts
 *
 * Choose the observer's and target planets, the hypothetical orbit (Q7: "create a
 * hypothetical 3rd inferior planet"), and what the orbit view draws.
 */

import { type Node, VBox } from "scenerystack/scenery";
import { PlanetaryConfigurationsPanel } from "../../common/PlanetaryConfigurationsPanel.js";
import { PlanetComboBox } from "../../common/view/PlanetComboBox.js";
import { checkbox, heading, label, numberControl } from "../../common/view/viewUtils.js";
import { StringManager } from "../../i18n/StringManager.js";
import { HYPOTHETICAL_A_RANGE, PANEL_ROW_SPACING } from "../../PlanetaryConfigurationsConstants.js";
import type { SynodicMotionModel } from "../model/SynodicMotionModel.js";

export class SynodicSetupPanel extends PlanetaryConfigurationsPanel {
  public readonly observerComboBox: PlanetComboBox;
  public readonly targetComboBox: PlanetComboBox;
  public readonly interactiveNodes: readonly Node[];

  public constructor(model: SynodicMotionModel, listParent: Node, width: number) {
    const strings = StringManager.getInstance();
    const s = strings.getSynodicMotionStrings();
    const common = strings.getCommonStrings();
    const a11y = strings.getSynodicMotionA11yStrings().controls;
    const innerWidth = width - 24;

    const observerComboBox = new PlanetComboBox(model.observerChoiceProperty, listParent, a11y.observerStringProperty);
    const targetComboBox = new PlanetComboBox(model.targetChoiceProperty, listParent, a11y.targetStringProperty);

    const orbitControl = numberControl(
      s.hypotheticalOrbitStringProperty,
      model.hypotheticalAProperty,
      HYPOTHETICAL_A_RANGE,
      {
        decimalPlaces: 2,
        delta: 0.01,
        valuePattern: common.auPatternStringProperty,
        accessibleName: a11y.hypotheticalOrbitStringProperty,
        enabledProperty: model.hasHypotheticalProperty,
        titleMaxWidth: innerWidth - 100,
      },
    );

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
      checkbox(model.showLabelsProperty, common.labelsStringProperty, common.labelsStringProperty, innerWidth),
      checkbox(
        model.snapProperty,
        common.snapToConfigurationsStringProperty,
        common.snapToConfigurationsStringProperty,
        innerWidth,
      ),
    ];

    const content = new VBox({
      align: "left",
      spacing: PANEL_ROW_SPACING,
      children: [
        heading(s.setupStringProperty, innerWidth),
        label(s.observerStringProperty, { maxWidth: innerWidth }),
        observerComboBox,
        label(s.targetStringProperty, { maxWidth: innerWidth }),
        targetComboBox,
        orbitControl,
        new VBox({ align: "left", spacing: 5, children: boxes }),
      ],
    });

    super(content, { minWidth: width, maxWidth: width, align: "left" });
    this.observerComboBox = observerComboBox;
    this.targetComboBox = targetComboBox;
    this.interactiveNodes = [observerComboBox, targetComboBox, orbitControl, ...boxes];
  }
}
