/**
 * PlanetaryConfigurationsPanel.ts
 *
 * A pre-themed Panel that automatically uses PlanetaryConfigurationsColors for background and
 * border. Use this for all control panels and info boxes in the sim so that
 * default / projector mode switching is handled automatically.
 *
 * ── Basic usage ───────────────────────────────────────────────────────────────
 *
 *   import { PlanetaryConfigurationsPanel } from "../../common/PlanetaryConfigurationsPanel.js";
 *   import { VBox, Text } from "scenerystack/scenery";
 *
 *   const content = new VBox({
 *     children: [ new Text("label"), slider ],
 *     spacing: 8,
 *   });
 *   const panel = new PlanetaryConfigurationsPanel(content);
 *
 * ── Overriding defaults ───────────────────────────────────────────────────────
 *
 *   // Wider margins, sharper corners, custom stroke
 *   const panel = new PlanetaryConfigurationsPanel(content, { xMargin: 20, cornerRadius: 0 });
 *
 *   // Transparent background (decorative border only)
 *   const panel = new PlanetaryConfigurationsPanel(content, { fill: "transparent" });
 */

import { type EmptySelfOptions, optionize } from "scenerystack/phet-core";
import type { Node } from "scenerystack/scenery";
import { Panel, type PanelOptions } from "scenerystack/sun";
import PlanetaryConfigurationsColors from "../PlanetaryConfigurationsColors.js";
import { PANEL_CORNER_RADIUS } from "../PlanetaryConfigurationsConstants.js";

export type PlanetaryConfigurationsPanelOptions = PanelOptions;

export class PlanetaryConfigurationsPanel extends Panel {
  public constructor(content: Node, providedOptions?: PlanetaryConfigurationsPanelOptions) {
    const options = optionize<PlanetaryConfigurationsPanelOptions, EmptySelfOptions, PanelOptions>()(
      {
        fill: PlanetaryConfigurationsColors.panelBackgroundColorProperty,
        stroke: PlanetaryConfigurationsColors.panelBorderColorProperty,
        cornerRadius: PANEL_CORNER_RADIUS,
        xMargin: 12,
        yMargin: 10,
      },
      providedOptions,
    );
    super(content, options);
  }
}
