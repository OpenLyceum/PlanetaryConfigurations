/**
 * viewUtils.ts
 *
 * Small factories shared by every screen: themed labels, checkboxes, flat push
 * buttons, number formatting, and the time-control cluster. Keeping them here keeps
 * the panels visually consistent and the screen views short.
 */

import {
  DerivedProperty,
  DynamicProperty,
  type EnumerationProperty,
  PatternStringProperty,
  type Property,
  type TReadOnlyProperty,
} from "scenerystack/axon";
import type { Range } from "scenerystack/dot";
import { toFixed } from "scenerystack/dot";
import { combineOptions } from "scenerystack/phet-core";
import { RichText, Text, type TPaint } from "scenerystack/scenery";
import {
  NumberControl,
  type NumberControlOptions,
  PhetFont,
  TimeControlNode,
  TimeSpeed,
} from "scenerystack/scenery-phet";
import { AquaRadioButtonGroup, type AquaRadioButtonGroupItem, Checkbox, RectangularPushButton } from "scenerystack/sun";
import { StringManager } from "../../i18n/StringManager.js";
import PlanetaryConfigurationsColors from "../../PlanetaryConfigurationsColors.js";
import { FONT_SIZE } from "../../PlanetaryConfigurationsConstants.js";
import type { ConfigurationEvent } from "../model/ConfigurationEvent.js";
import type { PlanetChoice } from "../model/PlanetChoice.js";
import {
  FLAT_PANEL_PUSH_BUTTON_OPTIONS,
  FLAT_PLAY_PAUSE_STEP_BUTTON_OPTIONS,
  LIGHT_SURFACE_TEXT_FILL,
  TIME_CONTROL_SPEED_RADIO_OPTIONS,
} from "../PlanetaryConfigurationsButtonOptions.js";
import {
  PLANETARY_CONFIGURATIONS_CHECKBOX_OPTIONS,
  PLANETARY_CONFIGURATIONS_NUMBER_CONTROL_OPTIONS,
} from "../PlanetaryConfigurationsControlOptions.js";

export const LABEL_FONT = new PhetFont(FONT_SIZE.label);
export const SMALL_FONT = new PhetFont(FONT_SIZE.small);
export const TITLE_FONT = new PhetFont({ size: FONT_SIZE.title, weight: "bold" });
export const READOUT_FONT = new PhetFont(FONT_SIZE.readout);
export const BIG_READOUT_FONT = new PhetFont({ size: FONT_SIZE.bigReadout, weight: "bold" });

type LabelOptions = { maxWidth?: number; font?: PhetFont; fill?: TPaint };

/** A panel label on the dark panel fill. */
export function label(stringProperty: TReadOnlyProperty<string> | string, options: LabelOptions = {}): Text {
  return new Text(stringProperty, {
    font: options.font ?? LABEL_FONT,
    fill: options.fill ?? PlanetaryConfigurationsColors.textColorProperty,
    maxWidth: options.maxWidth ?? 220,
  });
}

/** A bold panel heading. */
export function heading(stringProperty: TReadOnlyProperty<string>, maxWidth = 220): Text {
  return label(stringProperty, { font: TITLE_FONT, maxWidth });
}

/** A RichText readout (supports <sub>, <sup>, <b>). */
export function richLabel(stringProperty: TReadOnlyProperty<string>, options: LabelOptions = {}): RichText {
  return new RichText(stringProperty, {
    font: options.font ?? READOUT_FONT,
    fill: options.fill ?? PlanetaryConfigurationsColors.textColorProperty,
    maxWidth: options.maxWidth ?? 240,
  });
}

/** A themed checkbox with a text label and an accessible name. */
export function checkbox(
  property: Property<boolean>,
  stringProperty: TReadOnlyProperty<string>,
  accessibleName: TReadOnlyProperty<string> = stringProperty,
  maxWidth = 200,
): Checkbox {
  return new Checkbox(property, label(stringProperty, { maxWidth }), {
    ...PLANETARY_CONFIGURATIONS_CHECKBOX_OPTIONS,
    accessibleName,
  });
}

/** A flat white push button with a dark text label. */
export function textButton(
  stringProperty: TReadOnlyProperty<string>,
  listener: () => void,
  accessibleName: TReadOnlyProperty<string> = stringProperty,
  maxWidth = 120,
): RectangularPushButton {
  return new RectangularPushButton({
    ...FLAT_PANEL_PUSH_BUTTON_OPTIONS,
    content: new Text(stringProperty, { font: LABEL_FONT, fill: LIGHT_SURFACE_TEXT_FILL, maxWidth }),
    listener,
    accessibleName,
    xMargin: 8,
    yMargin: 4,
  });
}

/** Formats a number with a fixed number of decimals (dot's toFixed, never Number#toFixed). */
export function fixed(value: number, decimals: number): string {
  return Number.isFinite(value) ? toFixed(value, decimals) : "∞";
}

/** "{{value}} yr" for a time in years. */
export function yearsString(
  valueProperty: TReadOnlyProperty<number>,
  decimals = 3,
): PatternStringProperty<{ value: TReadOnlyProperty<number> }> {
  return new PatternStringProperty(
    StringManager.getInstance().getCommonStrings().yearsPatternStringProperty,
    { value: valueProperty },
    { decimalPlaces: decimals },
  );
}

/** Mapping from TimeSpeed to animation rate (days of model time per second). */
export function daysPerSecondFor(timeSpeed: TimeSpeed, rates: { slow: number; normal: number; fast: number }): number {
  if (timeSpeed === TimeSpeed.SLOW) {
    return rates.slow;
  }
  return timeSpeed === TimeSpeed.FAST ? rates.fast : rates.normal;
}

/** Play/pause, step back/forward and slow/normal/fast speed, with the fleet's flat styling. */
export function timeControls(
  isPlayingProperty: Property<boolean>,
  timeSpeedProperty: EnumerationProperty<TimeSpeed>,
  stepForward: () => void,
  stepBackward: (() => void) | null,
): TimeControlNode {
  return new TimeControlNode(isPlayingProperty, {
    timeSpeedProperty,
    timeSpeeds: [TimeSpeed.FAST, TimeSpeed.NORMAL, TimeSpeed.SLOW],
    ...TIME_CONTROL_SPEED_RADIO_OPTIONS,
    playPauseStepButtonOptions: {
      ...FLAT_PLAY_PAUSE_STEP_BUTTON_OPTIONS,
      includeStepBackwardButton: stepBackward !== null,
      stepForwardButtonOptions: {
        ...FLAT_PLAY_PAUSE_STEP_BUTTON_OPTIONS.stepForwardButtonOptions,
        listener: stepForward,
      },
      stepBackwardButtonOptions: {
        ...FLAT_PLAY_PAUSE_STEP_BUTTON_OPTIONS.stepBackwardButtonOptions,
        listener: stepBackward ?? ((): void => undefined),
      },
    },
  });
}

/**
 * A string Property that follows whichever localized StringProperty `source` currently
 * holds. Disposing it also disposes `source`, so nothing stays linked to the model.
 */
type SourceProperty = TReadOnlyProperty<TReadOnlyProperty<string>> & { dispose(): void };

class FollowingStringProperty extends DynamicProperty<string, string, TReadOnlyProperty<string>> {
  private readonly source: SourceProperty;

  public constructor(source: SourceProperty) {
    super(source);
    this.source = source;
  }

  public override dispose(): void {
    super.dispose();
    this.source.dispose();
  }
}

/** The localized name of whichever planet `choiceProperty` holds; follows locale changes. */
export function planetNameProperty(choiceProperty: TReadOnlyProperty<PlanetChoice>): TReadOnlyProperty<string> {
  return new FollowingStringProperty(
    new DerivedProperty([choiceProperty], (choice) => StringManager.getInstance().getPlanetName(choice.key)),
  );
}

/** The localized name of a configuration event, or "—" for none; follows locale changes. */
export function eventNameProperty(
  eventProperty: TReadOnlyProperty<ConfigurationEvent | null>,
): TReadOnlyProperty<string> {
  const strings = StringManager.getInstance();
  return new FollowingStringProperty(
    new DerivedProperty([eventProperty], (event) =>
      event === null ? strings.getCommonStrings().noneStringProperty : strings.getEventName(event.key),
    ),
  );
}

export type NumberControlSpec = {
  readonly decimalPlaces: number;
  readonly delta: number;
  /** Pattern with a {{value}} placeholder, e.g. "{{value}} AU". */
  readonly valuePattern?: TReadOnlyProperty<string>;
  readonly accessibleName?: TReadOnlyProperty<string>;
  readonly enabledProperty?: TReadOnlyProperty<boolean>;
  readonly titleMaxWidth?: number;
};

/** A themed NumberControl: title above, slider with arrow buttons, value in a light field. */
export function numberControl(
  titleProperty: TReadOnlyProperty<string>,
  property: Property<number>,
  range: Range,
  spec: NumberControlSpec,
): NumberControl {
  return new NumberControl(
    titleProperty,
    property,
    range,
    combineOptions<NumberControlOptions>({}, PLANETARY_CONFIGURATIONS_NUMBER_CONTROL_OPTIONS, {
      delta: spec.delta,
      accessibleName: spec.accessibleName ?? titleProperty,
      ...(spec.enabledProperty ? { enabledProperty: spec.enabledProperty } : {}),
      titleNodeOptions: {
        font: LABEL_FONT,
        fill: PlanetaryConfigurationsColors.textColorProperty,
        maxWidth: spec.titleMaxWidth ?? 150,
      },
      numberDisplayOptions: {
        decimalPlaces: spec.decimalPlaces,
        ...(spec.valuePattern ? { valuePattern: spec.valuePattern } : {}),
        textOptions: { font: LABEL_FONT, fill: PlanetaryConfigurationsColors.controlSurfaceTextColorProperty },
        backgroundFill: PlanetaryConfigurationsColors.controlSurfaceColorProperty,
        maxWidth: 90,
      },
      sliderOptions: { keyboardStep: spec.delta * 5, shiftKeyboardStep: spec.delta },
    }),
  );
}

export type RadioItem<T> = { readonly value: T; readonly stringProperty: TReadOnlyProperty<string> };

/** A themed radio-button group with text labels. */
export function radioGroup<T>(
  property: Property<T>,
  items: readonly RadioItem<T>[],
  accessibleName: TReadOnlyProperty<string>,
  orientation: "horizontal" | "vertical" = "horizontal",
  maxLabelWidth = 110,
): AquaRadioButtonGroup<T> {
  const groupItems: AquaRadioButtonGroupItem<T>[] = items.map((item) => ({
    value: item.value,
    createNode: () => label(item.stringProperty, { maxWidth: maxLabelWidth }),
    options: { accessibleName: item.stringProperty },
  }));
  return new AquaRadioButtonGroup(property, groupItems, {
    orientation,
    spacing: orientation === "horizontal" ? 14 : 6,
    radioButtonOptions: {
      radius: 7,
      selectedColor: PlanetaryConfigurationsColors.accentColorProperty,
      deselectedColor: PlanetaryConfigurationsColors.controlSurfaceColorProperty,
    },
    accessibleName,
  });
}
