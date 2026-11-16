import { EPICYCLE_VIEW_NODE_SETTINGS } from "../../PlanetaryConfigurationsConstants.js";
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
const FILL_FRACTION: number = EPICYCLE_VIEW_NODE_SETTINGS.FILL_FRACTION;

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
      new Rectangle(
        0,
        0,
        size,
        size,
        EPICYCLE_VIEW_NODE_SETTINGS.CONSTRUCTOR_CORNER_X,
        EPICYCLE_VIEW_NODE_SETTINGS.CONSTRUCTOR_CORNER_Y,
        {
          fill: PlanetaryConfigurationsColors.viewBackgroundColorProperty,
          stroke: PlanetaryConfigurationsColors.viewBorderColorProperty,
        },
      ),
    );
    const content = new Node({
      clipArea: Shape.roundRect(
        0,
        0,
        size,
        size,
        EPICYCLE_VIEW_NODE_SETTINGS.CONTENT_CORNER_X,
        EPICYCLE_VIEW_NODE_SETTINGS.CONTENT_CORNER_Y,
      ),
    });
    this.addChild(content);

    const sunCircle = new Circle(PTOLEMAIC_SUN_ORBIT_RADIUS * scale, {
      center,
      stroke: PlanetaryConfigurationsColors.faintOrbitColorProperty,
      lineDash: [
        EPICYCLE_VIEW_NODE_SETTINGS.SUN_CIRCLE_LINE_DASH_DASH,
        EPICYCLE_VIEW_NODE_SETTINGS.CONSTRUCTOR_SUN_CIRCLE_LINE_DASH_DASH,
      ],
    });
    const deferent = new Circle(scale, {
      stroke: PlanetaryConfigurationsColors.deferentColorProperty,
      lineWidth: EPICYCLE_VIEW_NODE_SETTINGS.DEFERENT_LINE_WIDTH,
    });
    const deferentCenter = new Circle(EPICYCLE_VIEW_NODE_SETTINGS.DEFERENT_CENTER_RADIUS, {
      fill: PlanetaryConfigurationsColors.deferentColorProperty,
    });
    const epicycle = new Circle(1, {
      stroke: PlanetaryConfigurationsColors.epicycleColorProperty,
      lineWidth: EPICYCLE_VIEW_NODE_SETTINGS.EPICYCLE_LINE_WIDTH,
    });
    const epicycleCenter = new Circle(EPICYCLE_VIEW_NODE_SETTINGS.EPICYCLE_CENTER_RADIUS, {
      fill: PlanetaryConfigurationsColors.epicycleColorProperty,
    });
    const equantMark = new Path(
      new Shape()
        .moveTo(EPICYCLE_VIEW_NODE_SETTINGS.EQUANT_MARK_X, EPICYCLE_VIEW_NODE_SETTINGS.EQUANT_MARK_Y)
        .lineTo(
          EPICYCLE_VIEW_NODE_SETTINGS.EQUANT_MARK_X_SEGMENT_2,
          EPICYCLE_VIEW_NODE_SETTINGS.EQUANT_MARK_Y_SEGMENT_2,
        )
        .moveTo(EPICYCLE_VIEW_NODE_SETTINGS.EQUANT_MARK_X, EPICYCLE_VIEW_NODE_SETTINGS.EQUANT_MARK_X_MOVE_TO_Y)
        .lineTo(EPICYCLE_VIEW_NODE_SETTINGS.EQUANT_MARK_X_SEGMENT_2, EPICYCLE_VIEW_NODE_SETTINGS.EQUANT_MARK_Y),
      {
        stroke: PlanetaryConfigurationsColors.equantColorProperty,
        lineWidth: EPICYCLE_VIEW_NODE_SETTINGS.EQUANT_MARK_LINE_WIDTH,
      },
    );
    const equantLabel = new Text(p.equantStringProperty, {
      font: SMALL_FONT,
      fill: PlanetaryConfigurationsColors.equantColorProperty,
      maxWidth: EPICYCLE_VIEW_NODE_SETTINGS.EQUANT_LABEL_MAX_WIDTH,
    });
    const equant = new Node({ children: [equantMark, equantLabel] });
    equantLabel.boundsProperty.link(() => {
      equantLabel.left = EPICYCLE_VIEW_NODE_SETTINGS.LEFT_LEFT;
      equantLabel.centerY = EPICYCLE_VIEW_NODE_SETTINGS.CENTER_Y_CENTER_Y;
    });
    const path = new Path(null, {
      stroke: PlanetaryConfigurationsColors.pathColorProperty,
      lineWidth: EPICYCLE_VIEW_NODE_SETTINGS.PATH_LINE_WIDTH,
    });
    const sunLine = new Path(null, {
      stroke: PlanetaryConfigurationsColors.sunLineColorProperty,
      lineDash: [
        EPICYCLE_VIEW_NODE_SETTINGS.SUN_LINE_LINE_DASH_DASH,
        EPICYCLE_VIEW_NODE_SETTINGS.CONSTRUCTOR_SUN_LINE_LINE_DASH_DASH,
      ],
      lineWidth: EPICYCLE_VIEW_NODE_SETTINGS.SUN_LINE_LINE_WIDTH,
    });
    const planetLine = new Path(null, {
      stroke: PlanetaryConfigurationsColors.targetLineColorProperty,
      lineWidth: EPICYCLE_VIEW_NODE_SETTINGS.PLANET_LINE_LINE_WIDTH,
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
      epicycle.radius = Math.max(EPICYCLE_VIEW_NODE_SETTINGS.CONSTRUCTOR_RADIUS, epicycleSize * scale);
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
