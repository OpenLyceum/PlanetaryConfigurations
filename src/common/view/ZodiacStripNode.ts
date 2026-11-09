/**
 * ZodiacStripNode.ts
 *
 * The sky as seen from the observer's planet, unrolled along the ecliptic: a band of
 * zodiac constellations with the Sun and the target planet marked at their apparent
 * ecliptic longitudes. East is on the left and west on the right, as when facing
 * south from the northern hemisphere.
 *
 * Beneath the band, a motion-history lane plots the target's longitude over the recent
 * past (now at the top, older lower). Because the planets are coplanar the target never
 * leaves the ecliptic, so a retrograde loop would only retrace one line on the sky; the
 * lane spreads it out in time so the backward (westward) stretch shows as a zig-zag,
 * drawn in the retrograde color.
 *
 * Reference ticks mark where the Sun and target were when the counter was zeroed, so a
 * student can time how long either takes to return to the same place among the stars
 * (handout Q14, Q15).
 *
 * The strip lives for the whole sim (it belongs to a ScreenView), so it does not dispose.
 */

import type { TReadOnlyProperty } from "scenerystack/axon";
import { Shape } from "scenerystack/kite";
import { Circle, Line, Node, Path, Rectangle, Text, type TPaint } from "scenerystack/scenery";
import { PhetFont } from "scenerystack/scenery-phet";
import { StringManager, type ZodiacKey } from "../../i18n/StringManager.js";
import PlanetaryConfigurationsColors from "../../PlanetaryConfigurationsColors.js";
import { HISTORY_LANE_HEIGHT, ZODIAC_BAND_HEIGHT } from "../../PlanetaryConfigurationsConstants.js";
import { mod2pi, TWO_PI } from "../model/orbitalMath.js";
import type { TrailSample } from "../model/TrailSample.js";
import { ECLIPTIC_CONSTELLATIONS } from "../model/ZodiacConstellationsData.js";
import { SMALL_FONT } from "./viewUtils.js";

export type ZodiacStripNodeOptions = {
  readonly width: number;
  readonly titleStringProperty: TReadOnlyProperty<string>;
  readonly captionStringProperty: TReadOnlyProperty<string>;
  readonly sunLongitudeProperty: TReadOnlyProperty<number>;
  readonly targetLongitudeProperty: TReadOnlyProperty<number>;
  /** Fill of the target marker (changes with the chosen planet). */
  readonly targetFillProperty: TReadOnlyProperty<TPaint>;
  readonly trailProperty: TReadOnlyProperty<readonly TrailSample[]>;
  /** Where the Sun / target were when the counter was last zeroed; null hides the tick. */
  readonly referenceSunLongitudeProperty?: TReadOnlyProperty<number | null>;
  readonly referenceTargetLongitudeProperty?: TReadOnlyProperty<number | null>;
};

const HEADER_HEIGHT = 17;
const CAPTION_HEIGHT = 15;
const SUN_MARKER_RADIUS = 7;
const TARGET_MARKER_RADIUS = 5;
const STAR_RADIUS = 1.2;
const REFERENCE_TRIANGLE_SIZE = 6;
const CONSTELLATION_LABEL_FONT = new PhetFont(9);
const DIRECTION_FONT = new PhetFont({ size: 11, weight: "bold" });

export class ZodiacStripNode extends Node {
  public constructor(options: ZodiacStripNodeOptions) {
    super();
    const width = options.width;
    const common = StringManager.getInstance().getCommonStrings();

    /** Ecliptic longitude → x: east (larger longitude) to the left, longitude 0 at the right edge. */
    const lonToX = (longitude: number): number => width * (1 - mod2pi(longitude) / TWO_PI);

    // ── Header: "← East", title, "West →" ─────────────────────────────────────
    const eastText = new Text(`← ${common.eastStringProperty.value}`, {
      font: DIRECTION_FONT,
      fill: PlanetaryConfigurationsColors.eastLabelColorProperty,
      maxWidth: width * 0.2,
    });
    const westText = new Text(`${common.westStringProperty.value} →`, {
      font: DIRECTION_FONT,
      fill: PlanetaryConfigurationsColors.westLabelColorProperty,
      maxWidth: width * 0.2,
    });
    common.eastStringProperty.link((east) => {
      eastText.string = `← ${east}`;
    });
    common.westStringProperty.link((west) => {
      westText.string = `${west} →`;
      westText.right = width;
    });
    const title = new Text(options.titleStringProperty, {
      font: new PhetFont({ size: 12, weight: "bold" }),
      fill: PlanetaryConfigurationsColors.textColorProperty,
      maxWidth: width * 0.55,
    });
    title.boundsProperty.link(() => {
      title.centerX = width / 2;
      title.centerY = HEADER_HEIGHT / 2;
    });
    eastText.left = 0;
    eastText.centerY = HEADER_HEIGHT / 2;
    westText.right = width;
    westText.centerY = HEADER_HEIGHT / 2;
    this.addChild(eastText);
    this.addChild(westText);
    this.addChild(title);

    // ── Sky band with constellations ─────────────────────────────────────────
    const bandTop = HEADER_HEIGHT;
    const bandCenterY = bandTop + ZODIAC_BAND_HEIGHT / 2;
    const band = new Rectangle(0, bandTop, width, ZODIAC_BAND_HEIGHT, {
      fill: PlanetaryConfigurationsColors.zodiacBandColorProperty,
      stroke: PlanetaryConfigurationsColors.zodiacBorderColorProperty,
    });
    this.addChild(band);

    const sky = new Node({ clipArea: Shape.rectangle(0, bandTop, width, ZODIAC_BAND_HEIGHT), pickable: false });
    this.addChild(sky);
    const angularScale = width / TWO_PI; // px per radian, same scale in latitude
    const zodiacNames = new Map(
      StringManager.getInstance()
        .getZodiacNames()
        .map((z) => [z.key, z.stringProperty]),
    );

    for (const constellation of ECLIPTIC_CONSTELLATIONS) {
      // Unwrap the stars' x around the first star so a constellation straddling the edge stays whole.
      const firstX = lonToX(constellation.eclipticStars[0]?.lon ?? 0);
      const points = constellation.eclipticStars.map((star) => {
        let x = lonToX(star.lon);
        if (x - firstX > width / 2) {
          x -= width;
        } else if (firstX - x > width / 2) {
          x += width;
        }
        return { x, y: bandCenterY - star.lat * angularScale };
      });
      const lines = new Shape();
      for (const polyline of constellation.polylines) {
        for (let i = 0; i < polyline.length; i++) {
          const p = points[polyline[i] ?? -1];
          if (p === undefined) {
            continue;
          }
          if (i === 0) {
            lines.moveTo(p.x, p.y);
          } else {
            lines.lineTo(p.x, p.y);
          }
        }
      }
      const stars = new Shape();
      for (const p of points) {
        stars.circle(p.x, p.y, STAR_RADIUS);
      }
      const meanX = points.reduce((sum, p) => sum + p.x, 0) / Math.max(1, points.length);
      const nameProperty = zodiacNames.get(constellation.name as ZodiacKey);

      for (const dx of [-width, 0, width]) {
        sky.addChild(
          new Path(lines, {
            stroke: PlanetaryConfigurationsColors.constellationLineColorProperty,
            lineWidth: 1,
            x: dx,
          }),
        );
        sky.addChild(new Path(stars, { fill: PlanetaryConfigurationsColors.starColorProperty, x: dx }));
        if (nameProperty !== undefined) {
          const name = new Text(nameProperty, {
            font: CONSTELLATION_LABEL_FONT,
            fill: PlanetaryConfigurationsColors.zodiacLabelColorProperty,
            maxWidth: width / 13,
          });
          name.boundsProperty.link(() => {
            name.centerX = meanX + dx;
            name.bottom = bandTop + ZODIAC_BAND_HEIGHT - 2;
          });
          sky.addChild(name);
        }
      }
    }

    // ── Reference ticks (where the Sun / target were at the last Zero Counter) ──
    const referenceTick = (fill: TPaint): { node: Node; triangle: Path } => {
      const triangle = new Path(
        new Shape()
          .moveTo(-REFERENCE_TRIANGLE_SIZE, 0)
          .lineTo(REFERENCE_TRIANGLE_SIZE, 0)
          .lineTo(0, REFERENCE_TRIANGLE_SIZE * 1.4)
          .close(),
        { fill, stroke: PlanetaryConfigurationsColors.referenceTickColorProperty, lineWidth: 0.75, y: bandTop },
      );
      const line = new Line(0, bandTop, 0, bandTop + ZODIAC_BAND_HEIGHT, {
        stroke: PlanetaryConfigurationsColors.referenceTickColorProperty,
        lineDash: [3, 3],
        lineWidth: 1,
        opacity: 0.6,
      });
      return { node: new Node({ children: [line, triangle], visible: false, pickable: false }), triangle };
    };
    const sunReference = referenceTick(PlanetaryConfigurationsColors.sunColorProperty);
    const targetReference = referenceTick(PlanetaryConfigurationsColors.hypotheticalColorProperty);
    this.addChild(sunReference.node);
    this.addChild(targetReference.node);
    const linkReference = (node: Node, property: TReadOnlyProperty<number | null> | undefined): void => {
      property?.link((longitude) => {
        node.visible = longitude !== null;
        if (longitude !== null) {
          node.x = lonToX(longitude);
        }
      });
    };
    linkReference(sunReference.node, options.referenceSunLongitudeProperty);
    linkReference(targetReference.node, options.referenceTargetLongitudeProperty);
    options.targetFillProperty.link((fill) => {
      targetReference.triangle.fill = fill;
    });

    // ── Sun and target markers ───────────────────────────────────────────────
    const sunMarker = new Node({
      children: [
        new Circle(SUN_MARKER_RADIUS + 4, { fill: PlanetaryConfigurationsColors.sunGlowColorProperty }),
        new Circle(SUN_MARKER_RADIUS, { fill: PlanetaryConfigurationsColors.sunColorProperty }),
      ],
      y: bandCenterY,
      pickable: false,
    });
    const targetMarker = new Circle(TARGET_MARKER_RADIUS, {
      stroke: PlanetaryConfigurationsColors.observerRingColorProperty,
      lineWidth: 1,
      y: bandCenterY,
      pickable: false,
    });
    options.targetFillProperty.link((fill) => {
      targetMarker.fill = fill;
    });
    this.addChild(sunMarker);
    this.addChild(targetMarker);
    options.sunLongitudeProperty.link((longitude) => {
      sunMarker.x = lonToX(longitude);
    });
    options.targetLongitudeProperty.link((longitude) => {
      targetMarker.x = lonToX(longitude);
    });

    // ── Motion-history lane ──────────────────────────────────────────────────
    const laneTop = bandTop + ZODIAC_BAND_HEIGHT;
    this.addChild(
      new Rectangle(0, laneTop, width, HISTORY_LANE_HEIGHT, {
        fill: PlanetaryConfigurationsColors.historyLaneColorProperty,
        stroke: PlanetaryConfigurationsColors.zodiacBorderColorProperty,
      }),
    );
    const directPath = new Path(null, {
      stroke: PlanetaryConfigurationsColors.trailColorProperty,
      lineWidth: 1.5,
      pickable: false,
    });
    const retrogradePath = new Path(null, {
      stroke: PlanetaryConfigurationsColors.retrogradeColorProperty,
      lineWidth: 2.5,
      pickable: false,
    });
    const lane = new Node({
      children: [directPath, retrogradePath],
      clipArea: Shape.rectangle(0, laneTop, width, HISTORY_LANE_HEIGHT),
    });
    this.addChild(lane);
    const laneInset = 3;
    options.trailProperty.link((samples) => {
      const direct = new Shape();
      const retrograde = new Shape();
      for (let i = 1; i < samples.length; i++) {
        const a = samples[i - 1];
        const b = samples[i];
        if (a === undefined || b === undefined) {
          continue;
        }
        const ax = lonToX(a.longitude);
        const bx = lonToX(b.longitude);
        if (Math.abs(ax - bx) > width / 2) {
          continue; // wrapped across the strip edge
        }
        const ay = laneTop + laneInset + a.age * (HISTORY_LANE_HEIGHT - 2 * laneInset);
        const by = laneTop + laneInset + b.age * (HISTORY_LANE_HEIGHT - 2 * laneInset);
        const shape = b.retrograde ? retrograde : direct;
        shape.moveTo(ax, ay).lineTo(bx, by);
      }
      directPath.shape = direct;
      retrogradePath.shape = retrograde;
    });

    // ── Caption under the lane ────────────────────────────────────────────────
    const caption = new Text(options.captionStringProperty, {
      font: SMALL_FONT,
      fill: PlanetaryConfigurationsColors.secondaryTextColorProperty,
      maxWidth: width,
    });
    caption.boundsProperty.link(() => {
      caption.left = 0;
      caption.top = laneTop + HISTORY_LANE_HEIGHT + 2;
    });
    this.addChild(caption);
    const retrogradeKey = new Text(common.retrogradeStringProperty, {
      font: SMALL_FONT,
      fill: PlanetaryConfigurationsColors.retrogradeColorProperty,
      maxWidth: width * 0.4,
    });
    retrogradeKey.boundsProperty.link(() => {
      retrogradeKey.right = width;
      retrogradeKey.top = laneTop + HISTORY_LANE_HEIGHT + 2;
    });
    this.addChild(retrogradeKey);

    // An unfilled spacer fixes the node's bounds, so the layout never shifts as labels change.
    this.addChild(new Rectangle(0, 0, width, laneTop + HISTORY_LANE_HEIGHT + CAPTION_HEIGHT + 2, { pickable: false }));
  }
}
