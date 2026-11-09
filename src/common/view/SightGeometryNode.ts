/**
 * SightGeometryNode.ts
 *
 * The lines of sight from the observer to the Sun and to the target planet, and the
 * elongation arc between them, drawn at the observer. All coordinates are view
 * coordinates; the owning view calls {@link update} whenever a body moves.
 */

import { Shape } from "scenerystack/kite";
import { Node, Path } from "scenerystack/scenery";
import PlanetaryConfigurationsColors from "../../PlanetaryConfigurationsColors.js";
import { wrapPi } from "../model/orbitalMath.js";

/** How far (px) the observer → target line continues past the target. */
const TARGET_LINE_OVERSHOOT = 40;

/** Radius (px) of the elongation arc. */
const ARC_RADIUS = 34;

export class SightGeometryNode extends Node {
  private readonly sunLine: Path;
  private readonly targetLine: Path;
  private readonly arc: Path;

  public constructor() {
    super({ pickable: false });
    this.sunLine = new Path(null, {
      stroke: PlanetaryConfigurationsColors.sunLineColorProperty,
      lineWidth: 1.5,
      lineDash: [6, 4],
    });
    this.targetLine = new Path(null, { stroke: PlanetaryConfigurationsColors.targetLineColorProperty, lineWidth: 1.5 });
    this.arc = new Path(null, { stroke: PlanetaryConfigurationsColors.elongationArcColorProperty, lineWidth: 2 });
    this.children = [this.sunLine, this.targetLine, this.arc];
  }

  public setLinesVisible(visible: boolean): void {
    this.sunLine.visible = visible;
    this.targetLine.visible = visible;
  }

  public setArcVisible(visible: boolean): void {
    this.arc.visible = visible;
  }

  public update(
    observer: { x: number; y: number },
    sun: { x: number; y: number },
    target: { x: number; y: number },
  ): void {
    const sunAngle = Math.atan2(sun.y - observer.y, sun.x - observer.x);
    const targetAngle = Math.atan2(target.y - observer.y, target.x - observer.x);
    const targetDistance = Math.hypot(target.x - observer.x, target.y - observer.y);
    const reach = targetDistance + TARGET_LINE_OVERSHOOT;

    this.sunLine.shape = new Shape().moveTo(observer.x, observer.y).lineTo(sun.x, sun.y);
    this.targetLine.shape = new Shape()
      .moveTo(observer.x, observer.y)
      .lineTo(observer.x + reach * Math.cos(targetAngle), observer.y + reach * Math.sin(targetAngle));

    const sweep = wrapPi(targetAngle - sunAngle);
    const radius = Math.min(ARC_RADIUS, 0.8 * Math.hypot(sun.x - observer.x, sun.y - observer.y));
    this.arc.shape =
      Math.abs(sweep) < 1e-4
        ? null
        : new Shape().arc(observer.x, observer.y, radius, sunAngle, sunAngle + sweep, sweep < 0);
  }
}
