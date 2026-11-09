/**
 * ConfigurationsViewNode.ts
 *
 * Top-down view for naming configurations (Q2–Q3). The Sun is at the centre and Earth
 * is fixed below it, so Earth looks "up" at the Sun: the left half of the view is the
 * eastern side of Earth's sky and the right half the western side. The hypothetical
 * planet can be dragged around its orbit or moved with the arrow keys.
 */

import { DerivedProperty, Multilink, PatternStringProperty } from "scenerystack/axon";
import { type Bounds2, Vector2 } from "scenerystack/dot";
import { Shape } from "scenerystack/kite";
import { Circle, Node, Rectangle, Text } from "scenerystack/scenery";
import { PhetFont } from "scenerystack/scenery-phet";
import { PlanetType } from "../../common/model/PlanetType.js";
import { BodyNode, makeRotatable } from "../../common/view/BodyNode.js";
import { elongationStringProperty } from "../../common/view/elongationStrings.js";
import { SightGeometryNode } from "../../common/view/SightGeometryNode.js";
import { eventNameProperty } from "../../common/view/viewUtils.js";
import { StringManager } from "../../i18n/StringManager.js";
import PlanetaryConfigurationsColors, { PLANET_COLORS } from "../../PlanetaryConfigurationsColors.js";
import { OBSERVER_RADIUS, PLANET_RADIUS, SUN_RADIUS } from "../../PlanetaryConfigurationsConstants.js";
import type { ConfigurationsModel } from "../model/ConfigurationsModel.js";
import { ConfigurationMarkerNode } from "./ConfigurationMarkerNode.js";

/** Fraction of the half-size used by the largest orbit. */
const FILL_FRACTION = 0.78;
const SIDE_LABEL_FONT = new PhetFont({ size: 16, weight: "bold" });

export class ConfigurationsViewNode extends Node {
  public readonly planetNode: BodyNode;

  public constructor(model: ConfigurationsModel, region: Bounds2) {
    super();
    const strings = StringManager.getInstance();
    const common = strings.getCommonStrings();
    const a11y = strings.getConfigurationsA11yStrings();
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

    // ── East / west halves of Earth's sky (split by the Earth–Sun line) ──────────
    const sides = new Node({
      children: [
        new Rectangle(0, 0, size / 2, size, { fill: PlanetaryConfigurationsColors.eastSideColorProperty }),
        new Rectangle(size / 2, 0, size / 2, size, { fill: PlanetaryConfigurationsColors.westSideColorProperty }),
      ],
      pickable: false,
    });
    const eastLabel = new Text(common.eastStringProperty, {
      font: SIDE_LABEL_FONT,
      fill: PlanetaryConfigurationsColors.eastLabelColorProperty,
      maxWidth: size / 3,
    });
    const westLabel = new Text(common.westStringProperty, {
      font: SIDE_LABEL_FONT,
      fill: PlanetaryConfigurationsColors.westLabelColorProperty,
      maxWidth: size / 3,
    });
    eastLabel.boundsProperty.link(() => eastLabel.setLeftTop(new Vector2(12, 10)));
    westLabel.boundsProperty.link(() => westLabel.setRightTop(new Vector2(size - 12, 10)));
    sides.addChild(eastLabel);
    sides.addChild(westLabel);
    model.showSidesProperty.linkAttribute(sides, "visible");

    // ── Scale: the larger of the planet's and Earth's orbits fills the view ───────
    const scaleProperty = new DerivedProperty([model.aProperty], (a) => (FILL_FRACTION * size) / 2 / Math.max(1, a));
    const toView = (p: Vector2, scale: number): Vector2 => new Vector2(center.x + p.x * scale, center.y - p.y * scale);

    const earthOrbit = new Circle(1, { stroke: PlanetaryConfigurationsColors.faintOrbitColorProperty, lineWidth: 1.5 });
    const planetOrbit = new Circle(1, { stroke: PlanetaryConfigurationsColors.orbitColorProperty, lineWidth: 1.5 });
    earthOrbit.center = center;
    planetOrbit.center = center;
    const sun = new BodyNode(SUN_RADIUS, PlanetaryConfigurationsColors.sunColorProperty, { glow: true });
    sun.translation = center;
    const sight = new SightGeometryNode();
    const earth = new BodyNode(OBSERVER_RADIUS, PLANET_COLORS.earth, {
      labelStringProperty: common.earthStringProperty,
      ring: true,
    });
    const planet = new BodyNode(PLANET_RADIUS, PLANET_COLORS.hypothetical, {
      labelStringProperty: strings.getConfigurationsStrings().planetStringProperty,
    });
    this.planetNode = planet;

    // ── Configuration markers (hidden until asked for) ───────────────────────────
    const markers = new Node({ pickable: false });
    model.showConfigurationPositionsProperty.linkAttribute(markers, "visible");

    content.children = [sides, earthOrbit, planetOrbit, markers, sight, sun, earth, planet];

    model.showLabelsProperty.link((visible) => {
      earth.setLabelVisible(visible);
      planet.setLabelVisible(visible);
    });
    model.showSightLinesProperty.link((visible) => sight.setLinesVisible(visible));
    model.showElongationArcProperty.link((visible) => sight.setArcVisible(visible));

    Multilink.multilink([scaleProperty, model.aProperty, model.planetPositionProperty], (scale, a, position) => {
      earthOrbit.radius = scale;
      planetOrbit.radius = a * scale;
      const e = toView(model.earthPosition, scale);
      const p = toView(position, scale);
      earth.setViewPosition(e, center);
      planet.setViewPosition(p, center);
      sight.update(e, center, p);
    });

    Multilink.multilink([scaleProperty, model.configurationPositionsProperty], (scale, positions) => {
      for (const child of markers.children) {
        child.dispose();
      }
      markers.children = positions.map(
        ({ event, position }) => new ConfigurationMarkerNode(event, toView(position, scale), center),
      );
    });

    // ── Interaction ──────────────────────────────────────────────────────────────
    const typeName = new DerivedProperty(
      [model.planetTypeProperty, common.superiorStringProperty, common.inferiorStringProperty],
      (type, superior, inferior) => (type === PlanetType.SUPERIOR ? superior : inferior),
    );
    const valueText = new PatternStringProperty(a11y.planetPatternStringProperty, {
      type: typeName,
      elongation: elongationStringProperty(model.elongationProperty),
      configuration: eventNameProperty(model.configurationProperty),
    });
    planet.tagName = "div";
    planet.focusable = true;
    planet.accessibleName = a11y.controls.planetStringProperty;
    planet.accessibleHelpText = a11y.controls.planetHelpStringProperty;
    makeRotatable(
      planet,
      () => center,
      (angle) => model.setPlanetLongitude(angle),
      (delta) => model.rotatePlanet(delta),
      { afterKey: () => planet.addAccessibleResponse(valueText.value) },
    );
  }
}
