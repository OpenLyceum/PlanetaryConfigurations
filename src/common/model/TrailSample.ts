/**
 * TrailSample.ts
 *
 * One point of a planet's recent apparent path against the stars, as drawn in the
 * zodiac strip's motion-history lane.
 */

export type TrailSample = {
  /** Apparent ecliptic longitude (rad). */
  readonly longitude: number;
  /** 0 = now … 1 = the oldest sample. */
  readonly age: number;
  /** True while the planet moves westward against the stars. */
  readonly retrograde: boolean;
};
