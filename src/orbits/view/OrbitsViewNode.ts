/**
 * OrbitsViewNode.ts
 *
 * The heliocentric orrery: the Sun, six circular orbits, the planets, and optional speed
 * arrows. Arrow length is a fixed number of pixels per km/s at either scale, so arrows
 * can be compared directly: Mercury's is about five times Saturn's.
 */

import { Multilink } from "scenerystack/axon";
import { type Bounds2, Vector2 } from "scenerystack/dot";
import { Shape } from "scenerystack/kite";
import { Circle, Node, Rectangle } from "scenerystack/scenery";
import { ArrowNode } from "scenerystack/scenery-phet";
import { orbitalSpeed } from "../../common/model/orbitalMath.js";
import { PlanetChoice } from "../../common/model/PlanetChoice.js";
import { BodyNode } from "../../common/view/BodyNode.js";
import { StringManager } from "../../i18n/StringManager.js";
import PlanetaryConfigurationsColors, { PLANET_COLORS } from "../../PlanetaryConfigurationsColors.js";
import { PLANET_RADIUS, SUN_RADIUS } from "../../PlanetaryConfigurationsConstants.js";
import { OrbitScale, type OrbitsModel } from "../model/OrbitsModel.js";

/** Speed-arrow length (px) per km/s. */
const PIXELS_PER_KM_S = 1.5;

export class OrbitsViewNode extends Node {
  public constructor(model: OrbitsModel, region: Bounds2) {
    super({ pickable: false });
    const strings = StringManager.getInstance();
    const size = Math.min(region.width, region.height);
    const center = new Vector2(size / 2, size / 2);

    this.addChild(
      new Rectangle(0, 0, size, size, 8, 8, {
        fill: PlanetaryConfigurationsColors.viewBackgroundColorProperty,
        stroke: PlanetaryConfigurationsColors.viewBorderColorProperty,
      }),
    );
    const content = new Node({ clipArea: Shape.roundRect(0, 0, size, size, 8, 8) });
    this.addChild(content);

    const orbitLayer = new Node();
    const arrowLayer = new Node();
    const bodyLayer = new Node();
    content.children = [orbitLayer, arrowLayer, bodyLayer];

    const sun = new BodyNode(SUN_RADIUS, PlanetaryConfigurationsColors.sunColorProperty, { glow: true });
    sun.translation = center;
    bodyLayer.addChild(sun);

    const planets = PlanetChoice.REAL_PLANETS.map((planet) => {
      const orbit = new Circle(1, { stroke: PlanetaryConfigurationsColors.orbitColorProperty, lineWidth: 1 });
      orbit.center = center;
      orbitLayer.addChild(orbit);
      const body = new BodyNode(PLANET_RADIUS, PLANET_COLORS[planet.key], {
        labelStringProperty: strings.getPlanetName(planet.key),
        ring: planet === PlanetChoice.EARTH,
      });
      bodyLayer.addChild(body);
      const arrow = new ArrowNode(0, 0, 1, 0, {
        fill: PlanetaryConfigurationsColors.speedArrowColorProperty,
        stroke: null,
        headWidth: 8,
        headHeight: 7,
        tailWidth: 2.5,
      });
      arrowLayer.addChild(arrow);
      return { planet, orbit, body, arrow, speed: orbitalSpeed(planet.axis(1)) };
    });

    model.showSpeedArrowsProperty.linkAttribute(arrowLayer, "visible");
    model.showLabelsProperty.link((visible) => {
      for (const p of planets) {
        p.body.setLabelVisible(visible);
      }
    });

    Multilink.multilink([model.scaleProperty, model.timeProperty], (scale) => {
      const pixelsPerAU = (0.47 * size) / scale.radius;
      for (const p of planets) {
        const a = p.planet.axis(1);
        p.orbit.radius = a * pixelsPerAU;
        const position = model.positionOf(p.planet);
        const view = new Vector2(center.x + position.x * pixelsPerAU, center.y - position.y * pixelsPerAU);
        p.body.setViewPosition(view, center);
        // Counter-clockwise tangent; screen y is flipped.
        const tangent = new Vector2(-position.y, -position.x).normalized();
        const length = p.speed * PIXELS_PER_KM_S;
        p.arrow.setTailAndTip(view.x, view.y, view.x + tangent.x * length, view.y + tangent.y * length);
        // Outer planets fall far outside the frame at the inner scale.
        const visible = scale === OrbitScale.ALL || a < OrbitScale.INNER.radius;
        p.body.visible = visible;
        p.arrow.visible = visible;
      }
    });
  }
}
