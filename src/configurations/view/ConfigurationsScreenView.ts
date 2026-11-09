/**
 * ConfigurationsScreenView.ts
 *
 * Layout: the square orbit view on the left; on the right, the readout panel, the
 * planet/control panel, and Reset All at the bottom. Each sits in its own region.
 */

import { type EmptySelfOptions, optionize } from "scenerystack/phet-core";
import { Node, VBox } from "scenerystack/scenery";
import { ResetAllButton } from "scenerystack/scenery-phet";
import { ScreenView, type ScreenViewOptions } from "scenerystack/sim";
import { FLAT_RESET_ALL_BUTTON_OPTIONS } from "../../common/PlanetaryConfigurationsButtonOptions.js";
import { placeInRegion, viewAndPanelsLayout } from "../../common/view/ScreenLayout.js";
import { REGION_GAP } from "../../PlanetaryConfigurationsConstants.js";
import type { ConfigurationsModel } from "../model/ConfigurationsModel.js";
import { ConfigurationReadoutPanel } from "./ConfigurationReadoutPanel.js";
import { ConfigurationsControlPanel } from "./ConfigurationsControlPanel.js";
import { ConfigurationsScreenSummaryContent } from "./ConfigurationsScreenSummaryContent.js";
import { ConfigurationsViewNode } from "./ConfigurationsViewNode.js";

export type ConfigurationsScreenViewOptions = ScreenViewOptions;

export class ConfigurationsScreenView extends ScreenView {
  public constructor(model: ConfigurationsModel, providedOptions?: ConfigurationsScreenViewOptions) {
    const options = optionize<ConfigurationsScreenViewOptions, EmptySelfOptions, ScreenViewOptions>()(
      { screenSummaryContent: new ConfigurationsScreenSummaryContent(model) },
      providedOptions,
    );
    super(options);

    const layout = viewAndPanelsLayout(this.layoutBounds);
    const viewNode = new ConfigurationsViewNode(model, layout.view);
    const readoutPanel = new ConfigurationReadoutPanel(model, layout.panels.width);
    const controlPanel = new ConfigurationsControlPanel(model, layout.panels.width);
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
        new VBox({ spacing: REGION_GAP, align: "left", children: [readoutPanel, controlPanel] }),
        layout.panels,
        { xAlign: "left", yAlign: "top" },
      ),
    );
    this.addChild(placeInRegion(resetAllButton, layout.footer, { xAlign: "right", yAlign: "bottom" }));

    this.addChild(new Node({ pdomOrder: [viewNode.planetNode, ...controlPanel.interactiveNodes, resetAllButton] }));
  }
}
