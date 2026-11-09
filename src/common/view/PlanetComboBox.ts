/**
 * PlanetComboBox.ts
 *
 * A combo box listing Mercury through Saturn plus the hypothetical planet, each with
 * its color swatch. The list pops up in `listParent`, a top-level layer of the screen
 * view, which is the only place where content is allowed to overlap the panels.
 */

import type { Property, TReadOnlyProperty } from "scenerystack/axon";
import { Circle, HBox, type Node, Text } from "scenerystack/scenery";
import { ComboBox, type ComboBoxItem } from "scenerystack/sun";
import { StringManager } from "../../i18n/StringManager.js";
import { PLANET_COLORS } from "../../PlanetaryConfigurationsColors.js";
import { PlanetChoice } from "../model/PlanetChoice.js";
import {
  LIGHT_SURFACE_TEXT_FILL,
  PLANETARY_CONFIGURATIONS_COMBO_BOX_OPTIONS,
} from "../PlanetaryConfigurationsButtonOptions.js";
import { LABEL_FONT } from "./viewUtils.js";

const CHOICES: readonly PlanetChoice[] = [...PlanetChoice.REAL_PLANETS, PlanetChoice.HYPOTHETICAL];

export class PlanetComboBox extends ComboBox<PlanetChoice> {
  public constructor(
    property: Property<PlanetChoice>,
    listParent: Node,
    accessibleName: TReadOnlyProperty<string>,
    maxTextWidth = 110,
  ) {
    const strings = StringManager.getInstance();
    const items: ComboBoxItem<PlanetChoice>[] = CHOICES.map((choice) => ({
      value: choice,
      createNode: () =>
        new HBox({
          spacing: 6,
          children: [
            new Circle(6, { fill: PLANET_COLORS[choice.key] }),
            new Text(strings.getPlanetName(choice.key), {
              font: LABEL_FONT,
              fill: LIGHT_SURFACE_TEXT_FILL,
              maxWidth: maxTextWidth,
            }),
          ],
        }),
      accessibleName: strings.getPlanetName(choice.key),
    }));
    super(property, items, listParent, {
      ...PLANETARY_CONFIGURATIONS_COMBO_BOX_OPTIONS,
      xMargin: 8,
      yMargin: 4,
      accessibleName,
    });
  }
}
