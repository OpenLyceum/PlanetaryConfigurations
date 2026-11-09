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
  return new Circle(r, { x, y, stroke: PlanetaryConfigurationsColors.orbitColorProperty, lineWidth: 4 });
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
        headWidth: 22,
        headHeight: 18,
        tailWidth: 7,
      }),
    );
    children.push(new Circle(13, { x, y, fill: PLANET_COLORS[p.key] }));
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
      lineWidth: 6,
      lineDash: [14, 10],
    }),
    new Line(ex, ey, px, py, { stroke: PlanetaryConfigurationsColors.targetLineColorProperty, lineWidth: 6 }),
    new Path(new Shape().arc(ex, ey, 70, angleSun, anglePlanet, false), {
      stroke: PlanetaryConfigurationsColors.elongationArcColorProperty,
      lineWidth: 7,
    }),
    sun(sx, sy),
    new Circle(17, {
      x: ex,
      y: ey,
      fill: PLANET_COLORS.earth,
      stroke: PlanetaryConfigurationsColors.observerRingColorProperty,
      lineWidth: 4,
    }),
    new Circle(15, { x: px, y: py, fill: PLANET_COLORS.hypothetical }),
  );
}

/** Synodic Motion: two orbits and, below, a zodiac band with a retrograde zig-zag. */
export function createSynodicMotionIcon(): ScreenIcon {
  const cx = W / 2;
  const cy = 130;
  const zigzag = new Shape().moveTo(40, 345);
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
      lineWidth: 5,
    }),
    new Circle(14, {
      x: cx + 60,
      y: cy,
      fill: PLANET_COLORS.earth,
      stroke: PlanetaryConfigurationsColors.observerRingColorProperty,
      lineWidth: 4,
    }),
    new Circle(13, { x: cx + 105 * Math.cos(0.5), y: cy - 105 * Math.sin(0.5), fill: PLANET_COLORS.mars }),
    new Rectangle(20, 200, W - 40, 160, 10, 10, {
      fill: PlanetaryConfigurationsColors.zodiacBandColorProperty,
      stroke: PlanetaryConfigurationsColors.zodiacBorderColorProperty,
      lineWidth: 3,
    }),
    new Path(zigzag, { stroke: PlanetaryConfigurationsColors.trailColorProperty, lineWidth: 8 }),
    new Path(new Shape().moveTo(300, 285).lineTo(270, 270).lineTo(240, 258), {
      stroke: PlanetaryConfigurationsColors.retrogradeColorProperty,
      lineWidth: 10,
    }),
  );
}

/** Periods: the synodic-period curve diverging at Earth's orbit and levelling off at one year. */
export function createPeriodsIcon(): ScreenIcon {
  const left = 60;
  const bottom = 330;
  const oneYear = 230;
  const asymptoteX = 230;
  const branchA = new Shape().moveTo(left, bottom - 5);
  const branchB = new Shape().moveTo(asymptoteX + 18, 30);
  for (let i = 1; i <= 40; i++) {
    const f = i / 40;
    branchA.lineTo(left + f * (asymptoteX - 12 - left), bottom - 5 - 300 * f ** 4);
    branchB.lineTo(asymptoteX + 18 + f * (W - 40 - asymptoteX - 18), oneYear - 200 * (1 - f) ** 4);
  }
  return iconFrom(
    new Path(
      new Shape()
        .moveTo(left, 20)
        .lineTo(left, bottom)
        .lineTo(W - 30, bottom),
      {
        stroke: PlanetaryConfigurationsColors.chartAxisColorProperty,
        lineWidth: 5,
      },
    ),
    new Line(asymptoteX, 20, asymptoteX, bottom, {
      stroke: PlanetaryConfigurationsColors.asymptoteColorProperty,
      lineWidth: 4,
      lineDash: [12, 10],
    }),
    new Line(left, oneYear, W - 30, oneYear, {
      stroke: PlanetaryConfigurationsColors.asymptoteColorProperty,
      lineWidth: 4,
      lineDash: [12, 10],
    }),
    new Path(branchA, { stroke: PlanetaryConfigurationsColors.synodicCurveColorProperty, lineWidth: 9 }),
    new Path(branchB, { stroke: PlanetaryConfigurationsColors.synodicCurveColorProperty, lineWidth: 9 }),
    new Circle(16, { x: 380, y: oneYear - 8, fill: PLANET_COLORS.jupiter }),
    new Circle(16, { x: 300, y: 150, fill: PLANET_COLORS.mars }),
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
    new Path(loop, { stroke: PlanetaryConfigurationsColors.pathColorProperty, lineWidth: 6 }),
    new Circle(120, { x: cx, y: cy, stroke: PlanetaryConfigurationsColors.deferentColorProperty, lineWidth: 5 }),
    new Circle(50, {
      x: epicycleX,
      y: epicycleY,
      stroke: PlanetaryConfigurationsColors.epicycleColorProperty,
      lineWidth: 5,
    }),
    new Circle(16, {
      x: cx,
      y: cy,
      fill: PLANET_COLORS.earth,
      stroke: PlanetaryConfigurationsColors.observerRingColorProperty,
      lineWidth: 4,
    }),
    new Circle(13, { x: epicycleX + 50 * Math.cos(2.6), y: epicycleY - 50 * Math.sin(2.6), fill: PLANET_COLORS.mars }),
  );
}
