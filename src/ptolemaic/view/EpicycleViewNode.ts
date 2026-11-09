/**
 * EpicycleViewNode.ts
 *
 * Ptolemy's construction, Earth at the centre: the deferent and its centre, the equant,
 * the epicycle, the planet and the path it has traced (the loops are the retrograde
 * motion), the Sun's direction, and the lines of sight from Earth.
 */

import { DerivedProperty, Multilink, type TReadOnlyProperty } from "scenerystack/axon";
import { type Bounds2, Vector2 } from "scenerystack/dot";
import { Shape } from "scenerystack/kite";
import { Circle, Node, Path, Rectangle, Text } from "scenerystack/scenery";
import { BodyNode } from "../../common/view/BodyNode.js";
import { SMALL_FONT } from "../../common/view/viewUtils.js";
import { StringManager } from "../../i18n/StringManager.js";
import PlanetaryConfigurationsColors, { PLANET_COLORS } from "../../PlanetaryConfigurationsColors.js";
import {
  OBSERVER_RADIUS,
  PLANET_RADIUS,
  PTOLEMAIC_SUN_ORBIT_RADIUS,
  SUN_RADIUS,
} from "../../PlanetaryConfigurationsConstants.js";
import type { PtolemaicModel } from "../model/PtolemaicModel.js";

/** Fraction of the half-size used by the Sun's circle. */
const FILL_FRACTION = 0.86;

/** The planet's display name: the preset's planet, or a generic "Planet" for custom parameters. */
export function ptolemaicPlanetNameProperty(model: PtolemaicModel): TReadOnlyProperty<string> {
  const strings = StringManager.getInstance();
  const genericName = strings.getConfigurationsStrings().planetStringProperty;
  const names = [
    strings.getPlanetName("venus"),
    strings.getPlanetName("mars"),
    strings.getPlanetName("jupiter"),
    strings.getPlanetName("saturn"),
    genericName,
  ] as const;
  return new DerivedProperty([model.presetProperty, ...names], (preset, venus, mars, jupiter, saturn, generic) => {
    const byKey = { venus, mars, jupiter, saturn, custom: generic };
    return byKey[preset.key];
  });
}

export class EpicycleViewNode extends Node {
  public constructor(model: PtolemaicModel, region: Bounds2) {
    super({ pickable: false });
    const strings = StringManager.getInstance();
    const p = strings.getPtolemaicStrings();
    const common = strings.getCommonStrings();
    const size = Math.min(region.width, region.height);
    const center = new Vector2(size / 2, size / 2);
    const scale = (FILL_FRACTION * size) / 2 / PTOLEMAIC_SUN_ORBIT_RADIUS;
    const toView = (q: Vector2): Vector2 => new Vector2(center.x + q.x * scale, center.y - q.y * scale);

    this.addChild(
      new Rectangle(0, 0, size, size, 8, 8, {
        fill: PlanetaryConfigurationsColors.viewBackgroundColorProperty,
        stroke: PlanetaryConfigurationsColors.viewBorderColorProperty,
      }),
    );
    const content = new Node({ clipArea: Shape.roundRect(0, 0, size, size, 8, 8) });
    this.addChild(content);

    const sunCircle = new Circle(PTOLEMAIC_SUN_ORBIT_RADIUS * scale, {
      center,
      stroke: PlanetaryConfigurationsColors.faintOrbitColorProperty,
      lineDash: [4, 5],
    });
    const deferent = new Circle(scale, { stroke: PlanetaryConfigurationsColors.deferentColorProperty, lineWidth: 1.5 });
    const deferentCenter = new Circle(3, { fill: PlanetaryConfigurationsColors.deferentColorProperty });
    const epicycle = new Circle(1, { stroke: PlanetaryConfigurationsColors.epicycleColorProperty, lineWidth: 1.5 });
    const epicycleCenter = new Circle(2.5, { fill: PlanetaryConfigurationsColors.epicycleColorProperty });
    const equantMark = new Path(new Shape().moveTo(-5, -5).lineTo(5, 5).moveTo(-5, 5).lineTo(5, -5), {
      stroke: PlanetaryConfigurationsColors.equantColorProperty,
      lineWidth: 2,
    });
    const equantLabel = new Text(p.equantStringProperty, {
      font: SMALL_FONT,
      fill: PlanetaryConfigurationsColors.equantColorProperty,
      maxWidth: 80,
    });
    const equant = new Node({ children: [equantMark, equantLabel] });
    equantLabel.boundsProperty.link(() => {
      equantLabel.left = 8;
      equantLabel.centerY = -10;
    });
    const path = new Path(null, { stroke: PlanetaryConfigurationsColors.pathColorProperty, lineWidth: 1.5 });
    const sunLine = new Path(null, {
      stroke: PlanetaryConfigurationsColors.sunLineColorProperty,
      lineDash: [6, 4],
      lineWidth: 1.5,
    });
    const planetLine = new Path(null, {
      stroke: PlanetaryConfigurationsColors.targetLineColorProperty,
      lineWidth: 1.5,
    });
    const sun = new BodyNode(SUN_RADIUS, PlanetaryConfigurationsColors.sunColorProperty, {
      glow: true,
      labelStringProperty: common.sunStringProperty,
    });
    const earth = new BodyNode(OBSERVER_RADIUS, PLANET_COLORS.earth, {
      labelStringProperty: common.earthStringProperty,
      ring: true,
    });
    earth.setViewPosition(center, center.plusXY(0, -1));
    const planet = new BodyNode(PLANET_RADIUS, PLANET_COLORS.mars, {
      labelStringProperty: ptolemaicPlanetNameProperty(model),
    });
    model.presetProperty.link((preset) => {
      planet.setFill(PLANET_COLORS[preset.planetKey]);
    });

    const deferentGroup = new Node({ children: [deferent, deferentCenter] });
    const epicycleGroup = new Node({ children: [epicycle, epicycleCenter] });
    content.children = [sunCircle, path, deferentGroup, epicycleGroup, equant, sunLine, planetLine, sun, earth, planet];

    model.showDeferentProperty.linkAttribute(deferentGroup, "visible");
    model.showEpicycleProperty.linkAttribute(epicycleGroup, "visible");
    model.showEquantProperty.linkAttribute(equant, "visible");
    model.showPathProperty.linkAttribute(path, "visible");
    model.showSunLineProperty.linkAttribute(sunLine, "visible");
    model.showPlanetLineProperty.linkAttribute(planetLine, "visible");

    Multilink.multilink([model.geometryProperty, model.epicycleSizeProperty], (g, epicycleSize) => {
      deferent.center = toView(g.deferentCenter);
      deferentCenter.center = toView(g.deferentCenter);
      equant.translation = toView(g.equant);
      epicycle.radius = Math.max(0.01, epicycleSize * scale);
      epicycle.center = toView(g.epicycleCenter);
      epicycleCenter.center = toView(g.epicycleCenter);
      const s = toView(g.sun);
      const q = toView(g.planet);
      sun.setViewPosition(s, center);
      planet.setViewPosition(q, center);
      sunLine.shape = new Shape().moveToPoint(center).lineToPoint(s);
      const direction = q.minus(center);
      const reach = direction.magnitude > 1e-6 ? direction.normalized().timesScalar(size) : direction;
      planetLine.shape = new Shape().moveToPoint(center).lineToPoint(center.plus(reach));
    });
    model.pathProperty.link((points) => {
      const shape = new Shape();
      points.forEach((point, i) => {
        const v = toView(point);
        if (i === 0) {
          shape.moveToPoint(v);
        } else {
          shape.lineToPoint(v);
        }
      });
      path.shape = shape;
    });
  }
}
