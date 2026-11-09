/**
 * SynodicOrbitViewNode.ts
 *
 * Top-down view of the observer's and target's orbits. The scale re-fits whenever the
 * planets change so the outer orbit always fills the region. Both planets can be dragged
 * around their orbits (or moved with the arrow keys); either way time changes to match.
 */

import { DerivedProperty, Multilink, PatternStringProperty, type TReadOnlyProperty } from "scenerystack/axon";
import { type Bounds2, Vector2 } from "scenerystack/dot";
import { Shape } from "scenerystack/kite";
import { Circle, Node, Rectangle } from "scenerystack/scenery";
import { mod2pi, toDegrees } from "../../common/model/orbitalMath.js";
import { BodyNode, makeRotatable } from "../../common/view/BodyNode.js";
import { SightGeometryNode } from "../../common/view/SightGeometryNode.js";
import { fixed, planetNameProperty } from "../../common/view/viewUtils.js";
import { StringManager } from "../../i18n/StringManager.js";
import PlanetaryConfigurationsColors, { PLANET_COLORS } from "../../PlanetaryConfigurationsColors.js";
import { OBSERVER_RADIUS, PLANET_RADIUS, SUN_RADIUS } from "../../PlanetaryConfigurationsConstants.js";
import type { PlanetRole, SynodicMotionModel } from "../model/SynodicMotionModel.js";

/** Fraction of the region's half-width used by the outer orbit. */
const FILL_FRACTION = 0.8;

export class SynodicOrbitViewNode extends Node {
  /** The focusable planet nodes, in traversal order (observer first). */
  public readonly planetNodes: readonly BodyNode[];

  public constructor(model: SynodicMotionModel, region: Bounds2) {
    super();
    const strings = StringManager.getInstance();
    const a11y = strings.getSynodicMotionA11yStrings();
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

    // Pixels per AU: the larger orbit fills FILL_FRACTION of the half-size.
    const scaleProperty = new DerivedProperty(
      [model.pairProperty],
      (pair) => (FILL_FRACTION * size) / 2 / Math.max(pair.aObserver, pair.aTarget),
    );
    const toView = (p: Vector2, scale: number): Vector2 => new Vector2(center.x + p.x * scale, center.y - p.y * scale);

    const observerOrbit = new Circle(1, { stroke: PlanetaryConfigurationsColors.orbitColorProperty, lineWidth: 1.5 });
    const targetOrbit = new Circle(1, { stroke: PlanetaryConfigurationsColors.orbitColorProperty, lineWidth: 1.5 });
    observerOrbit.center = center;
    targetOrbit.center = center;
    const sun = new BodyNode(SUN_RADIUS, PlanetaryConfigurationsColors.sunColorProperty, { glow: true });
    sun.translation = center;
    const sight = new SightGeometryNode();

    const observerLabel = planetNameProperty(model.observerChoiceProperty);
    const targetLabel = planetNameProperty(model.targetChoiceProperty);

    const observer = new BodyNode(OBSERVER_RADIUS, PLANET_COLORS.earth, {
      labelStringProperty: observerLabel,
      ring: true,
    });
    const target = new BodyNode(PLANET_RADIUS, PLANET_COLORS.mars, { labelStringProperty: targetLabel });
    content.children = [observerOrbit, targetOrbit, sight, sun, target, observer];
    this.planetNodes = [observer, target];

    model.observerChoiceProperty.link((choice) => observer.setFill(PLANET_COLORS[choice.key]));
    model.targetChoiceProperty.link((choice) => target.setFill(PLANET_COLORS[choice.key]));
    model.showLabelsProperty.link((visible) => {
      observer.setLabelVisible(visible);
      target.setLabelVisible(visible);
    });
    model.showSightLinesProperty.link((visible) => sight.setLinesVisible(visible));
    model.showElongationArcProperty.link((visible) => sight.setArcVisible(visible));

    Multilink.multilink(
      [model.pairProperty, scaleProperty, model.observerPositionProperty, model.targetPositionProperty],
      (pair, scale, observerPosition, targetPosition) => {
        observerOrbit.radius = pair.aObserver * scale;
        targetOrbit.radius = pair.aTarget * scale;
        const o = toView(observerPosition, scale);
        const t = toView(targetPosition, scale);
        observer.setViewPosition(o, center);
        target.setViewPosition(t, center);
        sight.update(o, center, t);
      },
    );

    // ── Interaction: drag or arrow keys move a planet along its orbit ───────────
    const wire = (node: BodyNode, role: PlanetRole, nameProperty: TReadOnlyProperty<string>): void => {
      const longitudeProperty = role === "observer" ? model.observerLongitudeProperty : model.targetLongitudeProperty;
      const valueText = new PatternStringProperty(a11y.planetPatternStringProperty, {
        planet: nameProperty,
        longitude: new DerivedProperty([longitudeProperty], (l) => fixed(toDegrees(mod2pi(l)), 0)),
      });
      node.tagName = "div";
      node.focusable = true;
      node.accessibleName = valueText;
      node.accessibleHelpText = a11y.controls.planetHelpStringProperty;
      makeRotatable(
        node,
        () => center,
        (angle) => model.dragPlanetTo(role, angle),
        (delta) => model.rotatePlanet(role, delta),
        {
          start: () => {
            model.isPlayingProperty.value = false;
          },
          afterKey: () => node.addAccessibleResponse(valueText.value),
        },
      );
    };
    wire(observer, "observer", observerLabel);
    wire(target, "target", targetLabel);
  }
}
