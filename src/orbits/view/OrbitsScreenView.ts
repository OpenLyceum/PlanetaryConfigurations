/**
 * OrbitsScreenView.ts
 *
 * Layout: the square orrery on the left; on the right, the view controls, the orbital
 * data table and the elapsed time; time controls and Reset All in the footer.
 */

import { DerivedProperty, PatternStringProperty } from "scenerystack/axon";
import { type EmptySelfOptions, optionize } from "scenerystack/phet-core";
import { HBox, Node, Text, VBox } from "scenerystack/scenery";
import { ResetAllButton } from "scenerystack/scenery-phet";
import { ScreenView, type ScreenViewOptions } from "scenerystack/sim";
import { FLAT_RESET_ALL_BUTTON_OPTIONS } from "../../common/PlanetaryConfigurationsButtonOptions.js";
import { PlanetaryConfigurationsPanel } from "../../common/PlanetaryConfigurationsPanel.js";
import { placeInRegion, viewAndPanelsLayout } from "../../common/view/ScreenLayout.js";
import {
  BIG_READOUT_FONT,
  checkbox,
  fixed,
  heading,
  label,
  radioGroup,
  timeControls,
} from "../../common/view/viewUtils.js";
import { StringManager } from "../../i18n/StringManager.js";
import PlanetaryConfigurationsColors from "../../PlanetaryConfigurationsColors.js";
import { PANEL_ROW_SPACING, REGION_GAP } from "../../PlanetaryConfigurationsConstants.js";
import { OrbitScale, type OrbitsModel } from "../model/OrbitsModel.js";
import { OrbitalDataPanel } from "./OrbitalDataPanel.js";
import { OrbitsScreenSummaryContent } from "./OrbitsScreenSummaryContent.js";
import { OrbitsViewNode } from "./OrbitsViewNode.js";

export type OrbitsScreenViewOptions = ScreenViewOptions;

/** Days stepped by one press of the step buttons. */
const STEP_DAYS = 5;

export class OrbitsScreenView extends ScreenView {
  public constructor(model: OrbitsModel, providedOptions?: OrbitsScreenViewOptions) {
    const options = optionize<OrbitsScreenViewOptions, EmptySelfOptions, ScreenViewOptions>()(
      { screenSummaryContent: new OrbitsScreenSummaryContent(model) },
      providedOptions,
    );
    super(options);

    const strings = StringManager.getInstance();
    const s = strings.getOrbitsStrings();
    const common = strings.getCommonStrings();
    const a11y = strings.getOrbitsA11yStrings().controls;
    const layout = viewAndPanelsLayout(this.layoutBounds, 74);
    const panelWidth = layout.panels.width;
    const innerWidth = panelWidth - 24;

    const viewNode = new OrbitsViewNode(model, layout.view);

    // ── View controls ────────────────────────────────────────────────────────
    const scaleRadio = radioGroup(
      model.scaleProperty,
      [
        { value: OrbitScale.INNER, stringProperty: s.innerPlanetsStringProperty },
        { value: OrbitScale.ALL, stringProperty: s.allPlanetsStringProperty },
      ],
      a11y.viewRadioGroupStringProperty,
    );
    const speedArrows = checkbox(
      model.showSpeedArrowsProperty,
      s.speedArrowsStringProperty,
      a11y.speedArrowsStringProperty,
    );
    const labels = checkbox(model.showLabelsProperty, common.labelsStringProperty, a11y.labelsStringProperty);
    const controlPanel = new PlanetaryConfigurationsPanel(
      new VBox({
        align: "left",
        spacing: PANEL_ROW_SPACING + 2,
        children: [heading(s.viewStringProperty, innerWidth), scaleRadio, speedArrows, labels],
      }),
      { minWidth: panelWidth, maxWidth: panelWidth, align: "left" },
    );

    // ── Elapsed time ─────────────────────────────────────────────────────────
    const timeText = new Text(
      new PatternStringProperty(common.yearsPatternStringProperty, {
        value: new DerivedProperty([model.timeProperty], (t) => fixed(t, 2)),
      }),
      { font: BIG_READOUT_FONT, fill: PlanetaryConfigurationsColors.textColorProperty, maxWidth: innerWidth / 2 },
    );
    const timePanel = new PlanetaryConfigurationsPanel(
      new HBox({ spacing: 12, children: [label(s.elapsedStringProperty, { maxWidth: innerWidth / 2 }), timeText] }),
      { minWidth: panelWidth, maxWidth: panelWidth, align: "left" },
    );

    const dataPanel = new OrbitalDataPanel(panelWidth);

    const timeControlNode = timeControls(
      model.isPlayingProperty,
      model.timeSpeedProperty,
      () => model.advanceDays(STEP_DAYS),
      () => model.advanceDays(-STEP_DAYS),
    );
    const resetAllButton = new ResetAllButton({
      ...FLAT_RESET_ALL_BUTTON_OPTIONS,
      listener: () => {
        this.interruptSubtreeInput();
        model.reset();
      },
    });

    this.addChild(placeInRegion(viewNode, layout.view, { xAlign: "left", yAlign: "top" }));
    this.addChild(
      placeInRegion(
        new VBox({ spacing: REGION_GAP, align: "left", children: [controlPanel, dataPanel, timePanel] }),
        layout.panels,
        { xAlign: "left", yAlign: "top" },
      ),
    );
    this.addChild(
      placeInRegion(
        new HBox({ spacing: 24, align: "bottom", children: [timeControlNode, resetAllButton] }),
        layout.footer,
        { xAlign: "right", yAlign: "bottom" },
      ),
    );

    this.addChild(new Node({ pdomOrder: [scaleRadio, speedArrows, labels, timeControlNode, resetAllButton] }));
  }
}
