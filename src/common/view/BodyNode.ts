/**
 * BodyNode.ts
 *
 * A planet or the Sun drawn in an orbit view: a filled disc, an optional ring for the
 * observer's planet, and an optional name label placed radially outward from the Sun
 * so it never sits on top of an orbit line.
 *
 * Planets that the student can move get {@link makeRotatable}: a pointer drag that
 * reports the angle around the Sun, plus arrow-key rotation for keyboard users.
 */

import type { TReadOnlyProperty } from "scenerystack/axon";
import { Vector2 } from "scenerystack/dot";
import { Circle, DragListener, KeyboardListener, Node, Text, type TPaint } from "scenerystack/scenery";
import PlanetaryConfigurationsColors from "../../PlanetaryConfigurationsColors.js";
import {
  KEYBOARD_FINE_ROTATION_DEGREES,
  KEYBOARD_ROTATION_DEGREES,
  PLANET_TOUCH_DILATION,
} from "../../PlanetaryConfigurationsConstants.js";
import { toRadians } from "../model/orbitalMath.js";
import PlanetaryConfigurationsHotkeyData from "../PlanetaryConfigurationsHotkeyData.js";
import { SMALL_FONT } from "./viewUtils.js";

export type BodyNodeOptions = {
  readonly labelStringProperty?: TReadOnlyProperty<string> | null;
  readonly ring?: boolean;
  readonly glow?: boolean;
};

const LABEL_GAP = 9;

export class BodyNode extends Node {
  private readonly disc: Circle;
  private readonly radius: number;
  private readonly labelText: Text | null;

  public constructor(radius: number, fill: TPaint, options: BodyNodeOptions = {}) {
    super();
    this.radius = radius;
    if (options.glow === true) {
      this.addChild(new Circle(radius * 1.7, { fill: PlanetaryConfigurationsColors.sunGlowColorProperty }));
    }
    this.disc = new Circle(radius, {
      fill,
      stroke: options.ring === true ? PlanetaryConfigurationsColors.observerRingColorProperty : null,
      lineWidth: 2,
    });
    this.addChild(this.disc);
    this.labelText =
      options.labelStringProperty === undefined || options.labelStringProperty === null
        ? null
        : new Text(options.labelStringProperty, {
            font: SMALL_FONT,
            fill: PlanetaryConfigurationsColors.textColorProperty,
            maxWidth: 90,
            pickable: false,
          });
    if (this.labelText !== null) {
      this.addChild(this.labelText);
    }
    this.mouseArea = this.disc.bounds.dilated(PLANET_TOUCH_DILATION / 2);
    this.touchArea = this.disc.bounds.dilated(PLANET_TOUCH_DILATION);
  }

  public setFill(fill: TPaint): void {
    this.disc.fill = fill;
  }

  public setLabelVisible(visible: boolean): void {
    if (this.labelText !== null) {
      this.labelText.visible = visible;
    }
  }

  /**
   * Moves the body to `viewPosition` and places the label outward from `sunViewPosition`.
   */
  public setViewPosition(viewPosition: Vector2, sunViewPosition: Vector2): void {
    this.translation = viewPosition;
    if (this.labelText !== null) {
      const outward = viewPosition.minus(sunViewPosition);
      const direction = outward.magnitude > 1e-6 ? outward.normalized() : new Vector2(0, -1);
      // Push the label's box just clear of the disc along the outward direction.
      const offset =
        this.radius +
        LABEL_GAP / 2 +
        (Math.abs(direction.x) * this.labelText.width) / 2 +
        (Math.abs(direction.y) * this.labelText.height) / 2;
      this.labelText.center = direction.timesScalar(offset);
    }
  }
}

/**
 * Makes `node` draggable around `centerViewPosition()` and rotatable with the arrow keys.
 *
 * @param dragToAngle - called with the view-space angle (rad, measured counter-clockwise on
 *   screen from +x) of the pointer around the centre
 * @param rotateBy - called with an increment (rad, counter-clockwise positive) for key presses
 */
export function makeRotatable(
  node: Node,
  centerViewPosition: () => Vector2,
  dragToAngle: (angle: number) => void,
  rotateBy: (delta: number) => void,
  callbacks: { start?: () => void; end?: () => void; afterKey?: () => void } = {},
): void {
  node.cursor = "pointer";
  node.addInputListener(
    new DragListener({
      start: () => callbacks.start?.(),
      end: () => callbacks.end?.(),
      drag: (event) => {
        const parent = node.getParent();
        if (parent === null) {
          return;
        }
        const point = parent.globalToLocalPoint(event.pointer.point);
        const center = centerViewPosition();
        // Screen y points down; negate so the angle is counter-clockwise as seen on screen.
        dragToAngle(Math.atan2(-(point.y - center.y), point.x - center.x));
      },
    }),
  );
  node.addInputListener(
    new KeyboardListener({
      keyStringProperties: [
        ...PlanetaryConfigurationsHotkeyData.ROTATE_FORWARD.keyStringProperties,
        ...PlanetaryConfigurationsHotkeyData.ROTATE_BACKWARD.keyStringProperties,
        ...PlanetaryConfigurationsHotkeyData.ROTATE_FINE.keyStringProperties,
      ],
      fireOnHold: true,
      fire: (_event, keysPressed) => {
        const fine = PlanetaryConfigurationsHotkeyData.ROTATE_FINE.hasKeyStroke(keysPressed);
        const step = toRadians(fine ? KEYBOARD_FINE_ROTATION_DEGREES : KEYBOARD_ROTATION_DEGREES);
        const backward = keysPressed.endsWith("arrowLeft") || keysPressed.endsWith("arrowDown");
        rotateBy(backward ? -step : step);
        callbacks.afterKey?.();
      },
    }),
  );
}
