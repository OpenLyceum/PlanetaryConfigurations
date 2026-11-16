/**
 * PlanetaryConfigurationsScreenIcons.ts
 *
 * Programmatic home-screen / navigation-bar icons for each screen, drawn on the
 * standard PhET 548 × 373 canvas using PlanetaryConfigurationsColors.
 */
import { Shape } from "scenerystack/kite";
import { Circle, Line, Node, Path, Rectangle } from "scenerystack/scenery";
import { ArrowNode } from "scenerystack/scenery-phet";
import { ScreenIcon } from "scenerystack/sim";
import PlanetaryConfigurationsColors, { PLANET_COLORS } from "../PlanetaryConfigurationsColors.js";
import { PLANETARY_CONFIGURATIONS_SCREEN_ICONS_SETTINGS } from "../PlanetaryConfigurationsConstants.js";

const W = 548;
const H = 373;

function background(): Rectangle {
  return new Rectangle(0, 0, W, H, { fill: PlanetaryConfigurationsColors.backgroundColorProperty });
}

function iconFrom(...children: Node[]): ScreenIcon {
  return new ScreenIcon(new Node({ children: [background(), ...children] }), {
    maxIconWidthProportion: 1,
    maxIconHeightProportion: 1,
    fill: PlanetaryConfigurationsColors.backgroundColorProperty,
  });
}

function sun(x: number, y: number, r = 22): Node {
  return new Node({
    children: [
      new Circle(r * 1.6, { fill: PlanetaryConfigurationsColors.sunGlowColorProperty }),
      new Circle(r, { fill: PlanetaryConfigurationsColors.sunColorProperty }),
    ],
    x,
    y,
  });
}

function orbit(x: number, y: number, r: number): Circle {
  return new Circle(r, {
    x,
    y,
    stroke: PlanetaryConfigurationsColors.orbitColorProperty,
    lineWidth: PLANETARY_CONFIGURATIONS_SCREEN_ICONS_SETTINGS.ORBIT_LINE_WIDTH,
  });
}

/** Orbits: four planets with speed arrows shrinking outward. */
export function createOrbitsIcon(): ScreenIcon {
  const cx = W / 2;
  const cy = H / 2;
  const children: Node[] = [sun(cx, cy)];
  const planets = [
    { r: 55, angle: -0.5, key: "mercury", v: 85 },
    { r: 95, angle: 2.2, key: "venus", v: 65 },
    { r: 135, angle: 0.9, key: "earth", v: 55 },
    { r: 172, angle: 3.9, key: "mars", v: 45 },
  ] as const;
  for (const p of planets) {
    const x = cx + p.r * Math.cos(p.angle);
    const y = cy - p.r * Math.sin(p.angle);
    children.push(orbit(cx, cy, p.r));
    children.push(
      new ArrowNode(x, y, x - p.v * Math.sin(p.angle), y - p.v * Math.cos(p.angle), {
        fill: PlanetaryConfigurationsColors.speedArrowColorProperty,
        stroke: null,
        headWidth: PLANETARY_CONFIGURATIONS_SCREEN_ICONS_SETTINGS.CREATE_ORBITS_ICON_HEAD_WIDTH,
        headHeight: PLANETARY_CONFIGURATIONS_SCREEN_ICONS_SETTINGS.CREATE_ORBITS_ICON_HEAD_HEIGHT,
        tailWidth: PLANETARY_CONFIGURATIONS_SCREEN_ICONS_SETTINGS.CREATE_ORBITS_ICON_TAIL_WIDTH,
      }),
    );
    children.push(
      new Circle(PLANETARY_CONFIGURATIONS_SCREEN_ICONS_SETTINGS.CREATE_ORBITS_ICON_RADIUS, {
        x,
        y,
        fill: PLANET_COLORS[p.key],
      }),
    );
  }
  return iconFrom(...children);
}

/** Configurations: Earth below the Sun, a planet, the sight lines and the elongation arc. */
export function createConfigurationsIcon(): ScreenIcon {
  const sx = W / 2;
  const sy = 140;
  const ex = W / 2;
  const ey = 290;
  const px = 420;
  const py = 95;
  const angleSun = Math.atan2(sy - ey, sx - ex);
  const anglePlanet = Math.atan2(py - ey, px - ex);
  return iconFrom(
    new Rectangle(0, 0, W / 2, H, { fill: PlanetaryConfigurationsColors.eastSideColorProperty }),
    new Rectangle(W / 2, 0, W / 2, H, { fill: PlanetaryConfigurationsColors.westSideColorProperty }),
    orbit(sx, sy, 150),
    new Line(ex, ey, sx, sy, {
      stroke: PlanetaryConfigurationsColors.sunLineColorProperty,
      lineWidth: PLANETARY_CONFIGURATIONS_SCREEN_ICONS_SETTINGS.CREATE_CONFIGURATIONS_ICON_LINE_WIDTH,
      lineDash: [PLANETARY_CONFIGURATIONS_SCREEN_ICONS_SETTINGS.CREATE_CONFIGURATIONS_ICON_LINE_DASH_DASH, 10],
    }),
    new Line(ex, ey, px, py, {
      stroke: PlanetaryConfigurationsColors.targetLineColorProperty,
      lineWidth: PLANETARY_CONFIGURATIONS_SCREEN_ICONS_SETTINGS.CREATE_CONFIGURATIONS_ICON_LINE_WIDTH,
    }),
    new Path(
      new Shape().arc(
        ex,
        ey,
        PLANETARY_CONFIGURATIONS_SCREEN_ICONS_SETTINGS.CREATE_CONFIGURATIONS_ICON_RADIUS,
        angleSun,
        anglePlanet,
        false,
      ),
      {
        stroke: PlanetaryConfigurationsColors.elongationArcColorProperty,
        lineWidth: PLANETARY_CONFIGURATIONS_SCREEN_ICONS_SETTINGS.CREATE_CONFIGURATIONS_ICON_LINE_WIDTH_VARIANT_2,
      },
    ),
    sun(sx, sy),
    new Circle(PLANETARY_CONFIGURATIONS_SCREEN_ICONS_SETTINGS.CREATE_CONFIGURATIONS_ICON_RADIUS_SEGMENT_2, {
      x: ex,
      y: ey,
      fill: PLANET_COLORS.earth,
      stroke: PlanetaryConfigurationsColors.observerRingColorProperty,
      lineWidth: PLANETARY_CONFIGURATIONS_SCREEN_ICONS_SETTINGS.CREATE_CONFIGURATIONS_ICON_LINE_WIDTH_VARIANT_3,
    }),
    new Circle(PLANETARY_CONFIGURATIONS_SCREEN_ICONS_SETTINGS.CREATE_CONFIGURATIONS_ICON_RADIUS_SEGMENT_3, {
      x: px,
      y: py,
      fill: PLANET_COLORS.hypothetical,
    }),
  );
}

/** Synodic Motion: two orbits and, below, a zodiac band with a retrograde zig-zag. */
export function createSynodicMotionIcon(): ScreenIcon {
  const cx = W / 2;
  const cy = 130;
  const zigzag = new Shape().moveTo(
    PLANETARY_CONFIGURATIONS_SCREEN_ICONS_SETTINGS.ZIGZAG_X,
    PLANETARY_CONFIGURATIONS_SCREEN_ICONS_SETTINGS.ZIGZAG_Y,
  );
  const points = [
    [140, 330],
    [250, 300],
    [300, 285],
    [270, 270],
    [240, 258],
    [290, 248],
    [400, 228],
    [508, 212],
  ] as const;
  for (const [x, y] of points) {
    zigzag.lineTo(x, y);
  }
  return iconFrom(
    orbit(cx, cy, 60),
    orbit(cx, cy, 105),
    sun(cx, cy, 18),
    new Line(cx + 60, cy, cx + 105 * Math.cos(0.5), cy - 105 * Math.sin(0.5), {
      stroke: PlanetaryConfigurationsColors.targetLineColorProperty,
      lineWidth: PLANETARY_CONFIGURATIONS_SCREEN_ICONS_SETTINGS.CREATE_SYNODIC_MOTION_ICON_LINE_WIDTH,
    }),
    new Circle(PLANETARY_CONFIGURATIONS_SCREEN_ICONS_SETTINGS.CREATE_SYNODIC_MOTION_ICON_RADIUS, {
      x: cx + PLANETARY_CONFIGURATIONS_SCREEN_ICONS_SETTINGS.CREATE_SYNODIC_MOTION_ICON_X_OFFSET,
      y: cy,
      fill: PLANET_COLORS.earth,
      stroke: PlanetaryConfigurationsColors.observerRingColorProperty,
      lineWidth: PLANETARY_CONFIGURATIONS_SCREEN_ICONS_SETTINGS.CREATE_SYNODIC_MOTION_ICON_LINE_WIDTH_VARIANT_2,
    }),
    new Circle(PLANETARY_CONFIGURATIONS_SCREEN_ICONS_SETTINGS.CREATE_SYNODIC_MOTION_ICON_RADIUS_SEGMENT_2, {
      x: cx + PLANETARY_CONFIGURATIONS_SCREEN_ICONS_SETTINGS.CREATE_SYNODIC_MOTION_ICON_X_FACTOR * Math.cos(0.5),
      y: cy - PLANETARY_CONFIGURATIONS_SCREEN_ICONS_SETTINGS.CREATE_SYNODIC_MOTION_ICON_Y_FACTOR * Math.sin(0.5),
      fill: PLANET_COLORS.mars,
    }),
    new Rectangle(
      PLANETARY_CONFIGURATIONS_SCREEN_ICONS_SETTINGS.CREATE_SYNODIC_MOTION_ICON_X,
      PLANETARY_CONFIGURATIONS_SCREEN_ICONS_SETTINGS.CREATE_SYNODIC_MOTION_ICON_Y,
      W - 40,
      PLANETARY_CONFIGURATIONS_SCREEN_ICONS_SETTINGS.CREATE_SYNODIC_MOTION_ICON_HEIGHT,
      PLANETARY_CONFIGURATIONS_SCREEN_ICONS_SETTINGS.CREATE_SYNODIC_MOTION_ICON_CORNER_X,
      PLANETARY_CONFIGURATIONS_SCREEN_ICONS_SETTINGS.CREATE_SYNODIC_MOTION_ICON_CORNER_Y,
      {
        fill: PlanetaryConfigurationsColors.zodiacBandColorProperty,
        stroke: PlanetaryConfigurationsColors.zodiacBorderColorProperty,
        lineWidth: PLANETARY_CONFIGURATIONS_SCREEN_ICONS_SETTINGS.CREATE_SYNODIC_MOTION_ICON_LINE_WIDTH_VARIANT_3,
      },
    ),
    new Path(zigzag, {
      stroke: PlanetaryConfigurationsColors.trailColorProperty,
      lineWidth: PLANETARY_CONFIGURATIONS_SCREEN_ICONS_SETTINGS.CREATE_SYNODIC_MOTION_ICON_LINE_WIDTH_VARIANT_4,
    }),
    new Path(
      new Shape()
        .moveTo(
          PLANETARY_CONFIGURATIONS_SCREEN_ICONS_SETTINGS.CREATE_SYNODIC_MOTION_ICON_X_SEGMENT_2,
          PLANETARY_CONFIGURATIONS_SCREEN_ICONS_SETTINGS.CREATE_SYNODIC_MOTION_ICON_Y_SEGMENT_2,
        )
        .lineTo(
          PLANETARY_CONFIGURATIONS_SCREEN_ICONS_SETTINGS.CREATE_SYNODIC_MOTION_ICON_X_SEGMENT_3,
          PLANETARY_CONFIGURATIONS_SCREEN_ICONS_SETTINGS.CREATE_SYNODIC_MOTION_ICON_Y_SEGMENT_3,
        )
        .lineTo(
          PLANETARY_CONFIGURATIONS_SCREEN_ICONS_SETTINGS.CREATE_SYNODIC_MOTION_ICON_X_SEGMENT_4,
          PLANETARY_CONFIGURATIONS_SCREEN_ICONS_SETTINGS.CREATE_SYNODIC_MOTION_ICON_Y_SEGMENT_4,
        ),
      {
        stroke: PlanetaryConfigurationsColors.retrogradeColorProperty,
        lineWidth: PLANETARY_CONFIGURATIONS_SCREEN_ICONS_SETTINGS.CREATE_SYNODIC_MOTION_ICON_LINE_WIDTH_VARIANT_5,
      },
    ),
  );
}

/** Periods: the synodic-period curve diverging at Earth's orbit and levelling off at one year. */
export function createPeriodsIcon(): ScreenIcon {
  const left: number = PLANETARY_CONFIGURATIONS_SCREEN_ICONS_SETTINGS.LEFT;
  const bottom: number = PLANETARY_CONFIGURATIONS_SCREEN_ICONS_SETTINGS.BOTTOM;
  const oneYear = 230;
  const asymptoteX = 230;
  const branchA = new Shape().moveTo(left, bottom - 5);
  const branchB = new Shape().moveTo(asymptoteX + 18, PLANETARY_CONFIGURATIONS_SCREEN_ICONS_SETTINGS.BRANCH_B_Y);
  for (let i = 1; i <= 40; i++) {
    const f = i / 40;
    branchA.lineTo(left + f * (asymptoteX - 12 - left), bottom - 5 - 300 * f ** 4);
    branchB.lineTo(asymptoteX + 18 + f * (W - 40 - asymptoteX - 18), oneYear - 200 * (1 - f) ** 4);
  }
  return iconFrom(
    new Path(
      new Shape()
        .moveTo(left, PLANETARY_CONFIGURATIONS_SCREEN_ICONS_SETTINGS.CREATE_PERIODS_ICON_Y)
        .lineTo(left, bottom)
        .lineTo(W - 30, bottom),
      {
        stroke: PlanetaryConfigurationsColors.chartAxisColorProperty,
        lineWidth: PLANETARY_CONFIGURATIONS_SCREEN_ICONS_SETTINGS.CREATE_PERIODS_ICON_LINE_WIDTH,
      },
    ),
    new Line(
      asymptoteX,
      PLANETARY_CONFIGURATIONS_SCREEN_ICONS_SETTINGS.CREATE_PERIODS_ICON_START_Y,
      asymptoteX,
      bottom,
      {
        stroke: PlanetaryConfigurationsColors.asymptoteColorProperty,
        lineWidth: PLANETARY_CONFIGURATIONS_SCREEN_ICONS_SETTINGS.CREATE_PERIODS_ICON_LINE_WIDTH_VARIANT_2,
        lineDash: [PLANETARY_CONFIGURATIONS_SCREEN_ICONS_SETTINGS.CREATE_PERIODS_ICON_LINE_DASH_DASH, 10],
      },
    ),
    new Line(left, oneYear, W - 30, oneYear, {
      stroke: PlanetaryConfigurationsColors.asymptoteColorProperty,
      lineWidth: PLANETARY_CONFIGURATIONS_SCREEN_ICONS_SETTINGS.CREATE_PERIODS_ICON_LINE_WIDTH_VARIANT_2,
      lineDash: [PLANETARY_CONFIGURATIONS_SCREEN_ICONS_SETTINGS.CREATE_PERIODS_ICON_LINE_DASH_DASH, 10],
    }),
    new Path(branchA, {
      stroke: PlanetaryConfigurationsColors.synodicCurveColorProperty,
      lineWidth: PLANETARY_CONFIGURATIONS_SCREEN_ICONS_SETTINGS.CREATE_PERIODS_ICON_LINE_WIDTH_VARIANT_3,
    }),
    new Path(branchB, {
      stroke: PlanetaryConfigurationsColors.synodicCurveColorProperty,
      lineWidth: PLANETARY_CONFIGURATIONS_SCREEN_ICONS_SETTINGS.CREATE_PERIODS_ICON_LINE_WIDTH_VARIANT_3,
    }),
    new Circle(PLANETARY_CONFIGURATIONS_SCREEN_ICONS_SETTINGS.CREATE_PERIODS_ICON_RADIUS, {
      x: PLANETARY_CONFIGURATIONS_SCREEN_ICONS_SETTINGS.CREATE_PERIODS_ICON_X,
      y: oneYear - PLANETARY_CONFIGURATIONS_SCREEN_ICONS_SETTINGS.CREATE_PERIODS_ICON_Y_OFFSET,
      fill: PLANET_COLORS.jupiter,
    }),
    new Circle(PLANETARY_CONFIGURATIONS_SCREEN_ICONS_SETTINGS.CREATE_PERIODS_ICON_RADIUS, {
      x: PLANETARY_CONFIGURATIONS_SCREEN_ICONS_SETTINGS.CREATE_PERIODS_ICON_X_VARIANT_2,
      y: PLANETARY_CONFIGURATIONS_SCREEN_ICONS_SETTINGS.CREATE_PERIODS_ICON_Y_VARIANT_2,
      fill: PLANET_COLORS.mars,
    }),
  );
}

/** Ptolemaic: Earth at the centre, the deferent, an epicycle, and a looping path. */
export function createPtolemaicIcon(): ScreenIcon {
  const cx = W / 2;
  const cy = H / 2;
  const loop = new Shape();
  for (let i = 0; i <= 200; i++) {
    const t = (i / 200) * 2.2 * Math.PI;
    const x = cx + 120 * Math.cos(t * 0.45) + 50 * Math.cos(t);
    const y = cy - 120 * Math.sin(t * 0.45) - 50 * Math.sin(t);
    if (i === 0) {
      loop.moveTo(x, y);
    } else {
      loop.lineTo(x, y);
    }
  }
  const epicycleX = cx + 120 * Math.cos(0.9);
  const epicycleY = cy - 120 * Math.sin(0.9);
  return iconFrom(
    new Path(loop, {
      stroke: PlanetaryConfigurationsColors.pathColorProperty,
      lineWidth: PLANETARY_CONFIGURATIONS_SCREEN_ICONS_SETTINGS.CREATE_PTOLEMAIC_ICON_LINE_WIDTH,
    }),
    new Circle(PLANETARY_CONFIGURATIONS_SCREEN_ICONS_SETTINGS.CREATE_PTOLEMAIC_ICON_RADIUS, {
      x: cx,
      y: cy,
      stroke: PlanetaryConfigurationsColors.deferentColorProperty,
      lineWidth: PLANETARY_CONFIGURATIONS_SCREEN_ICONS_SETTINGS.CREATE_PTOLEMAIC_ICON_LINE_WIDTH_VARIANT_2,
    }),
    new Circle(PLANETARY_CONFIGURATIONS_SCREEN_ICONS_SETTINGS.CREATE_PTOLEMAIC_ICON_RADIUS_SEGMENT_2, {
      x: epicycleX,
      y: epicycleY,
      stroke: PlanetaryConfigurationsColors.epicycleColorProperty,
      lineWidth: PLANETARY_CONFIGURATIONS_SCREEN_ICONS_SETTINGS.CREATE_PTOLEMAIC_ICON_LINE_WIDTH_VARIANT_2,
    }),
    new Circle(PLANETARY_CONFIGURATIONS_SCREEN_ICONS_SETTINGS.CREATE_PTOLEMAIC_ICON_RADIUS_SEGMENT_3, {
      x: cx,
      y: cy,
      fill: PLANET_COLORS.earth,
      stroke: PlanetaryConfigurationsColors.observerRingColorProperty,
      lineWidth: PLANETARY_CONFIGURATIONS_SCREEN_ICONS_SETTINGS.CREATE_PTOLEMAIC_ICON_LINE_WIDTH_VARIANT_3,
    }),
    new Circle(PLANETARY_CONFIGURATIONS_SCREEN_ICONS_SETTINGS.CREATE_PTOLEMAIC_ICON_RADIUS_SEGMENT_4, {
      x:
        epicycleX +
        PLANETARY_CONFIGURATIONS_SCREEN_ICONS_SETTINGS.CREATE_PTOLEMAIC_ICON_X_FACTOR *
          Math.cos(PLANETARY_CONFIGURATIONS_SCREEN_ICONS_SETTINGS.CREATE_PTOLEMAIC_ICON_X),
      y:
        epicycleY -
        PLANETARY_CONFIGURATIONS_SCREEN_ICONS_SETTINGS.CREATE_PTOLEMAIC_ICON_Y_FACTOR *
          Math.sin(PLANETARY_CONFIGURATIONS_SCREEN_ICONS_SETTINGS.CREATE_PTOLEMAIC_ICON_Y),
      fill: PLANET_COLORS.mars,
    }),
  );
}
