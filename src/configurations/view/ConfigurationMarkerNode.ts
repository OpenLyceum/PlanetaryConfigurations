/**
 * ConfigurationMarkerNode.ts
 *
 * A ring on the planet's orbit where a named configuration lies, with the name placed
 * just outside the orbit. The markers are rebuilt whenever the orbit changes, so each
 * one is disposed when it is replaced.
 */

import type { Vector2 } from "scenerystack/dot";
import { Circle, Node, Text } from "scenerystack/scenery";
import type { ConfigurationEvent } from "../../common/model/ConfigurationEvent.js";
import { SMALL_FONT } from "../../common/view/viewUtils.js";
import { StringManager } from "../../i18n/StringManager.js";
import PlanetaryConfigurationsColors from "../../PlanetaryConfigurationsColors.js";

const MARKER_RADIUS = 5;
const LABEL_GAP = 14;

export class ConfigurationMarkerNode extends Node {
  /**
   * @param event - the configuration
   * @param position - where it lies (view coordinates)
   * @param center - the Sun (view coordinates); the label goes outward from it
   */
  public constructor(event: ConfigurationEvent, position: Vector2, center: Vector2) {
    const name = new Text(StringManager.getInstance().getEventName(event.key), {
      font: SMALL_FONT,
      fill: PlanetaryConfigurationsColors.configurationMarkerColorProperty,
      maxWidth: 120,
    });
    const outward = position.minus(center).normalized();
    const place = (): void => {
      name.center = position.plus(outward.timesScalar(LABEL_GAP + (Math.abs(outward.x) * name.width) / 2 + 2));
    };
    place();
    name.localBoundsProperty.lazyLink(place);
    super({
      children: [
        new Circle(MARKER_RADIUS, {
          center: position,
          stroke: PlanetaryConfigurationsColors.configurationMarkerColorProperty,
          lineWidth: 1.5,
        }),
        name,
      ],
      pickable: false,
    });
  }
}
