/**
 * PeriodCalculatorPanel.ts
 *
 * The "Synodic Period Calculator" of Q13. The student picks an inferior or superior
 * planet and which period to compute, types the other one in years or days, and sees
 * the formula, the numbers substituted into it, and the result.
 */

import { DerivedProperty, Multilink, type TReadOnlyProperty } from "scenerystack/axon";
import { StringUtils } from "scenerystack/phetcommon";
import type { Node } from "scenerystack/scenery";
import { RichText, Text, VBox } from "scenerystack/scenery";
import type { KeypadDialog } from "scenerystack/sim";
import { RectangularPushButton } from "scenerystack/sun";
import { PlanetType } from "../../common/model/PlanetType.js";
import {
  FLAT_PANEL_PUSH_BUTTON_OPTIONS,
  LIGHT_SURFACE_TEXT_FILL,
} from "../../common/PlanetaryConfigurationsButtonOptions.js";
import { PlanetaryConfigurationsPanel } from "../../common/PlanetaryConfigurationsPanel.js";
import {
  BIG_READOUT_FONT,
  fixed,
  heading,
  label,
  READOUT_FONT,
  radioGroup,
  SMALL_FONT,
} from "../../common/view/viewUtils.js";
import { StringManager } from "../../i18n/StringManager.js";
import PlanetaryConfigurationsColors from "../../PlanetaryConfigurationsColors.js";
import { DAYS_PER_YEAR, PANEL_ROW_SPACING } from "../../PlanetaryConfigurationsConstants.js";
import { type PeriodsModel, SolveFor, TimeUnit } from "../model/PeriodsModel.js";

/** Decimal places shown for a period in each unit. */
function decimalsFor(unit: TimeUnit): number {
  return unit === TimeUnit.YEARS ? 3 : 1;
}

export class PeriodCalculatorPanel extends PlanetaryConfigurationsPanel {
  public readonly interactiveNodes: readonly Node[];

  public constructor(model: PeriodsModel, keypadDialog: KeypadDialog, width: number) {
    const strings = StringManager.getInstance();
    const p = strings.getPeriodsStrings();
    const common = strings.getCommonStrings();
    const a11y = strings.getPeriodsA11yStrings().controls;
    const innerWidth = width - 24;
    const secondary = PlanetaryConfigurationsColors.secondaryTextColorProperty;

    const typeRadio = radioGroup(
      model.planetTypeProperty,
      [
        { value: PlanetType.INFERIOR, stringProperty: common.inferiorStringProperty },
        { value: PlanetType.SUPERIOR, stringProperty: common.superiorStringProperty },
      ],
      a11y.planetTypeStringProperty,
    );
    const solveRadio = radioGroup(
      model.solveForProperty,
      [
        { value: SolveFor.SIDEREAL, stringProperty: p.siderealFromSynodicStringProperty },
        { value: SolveFor.SYNODIC, stringProperty: p.synodicFromSiderealStringProperty },
      ],
      a11y.solveForStringProperty,
      "vertical",
      innerWidth - 30,
    );
    const unitRadio = radioGroup(
      model.unitProperty,
      [
        { value: TimeUnit.YEARS, stringProperty: common.yearsStringProperty },
        { value: TimeUnit.DAYS, stringProperty: common.daysStringProperty },
      ],
      a11y.unitsStringProperty,
    );

    // ── Input ────────────────────────────────────────────────────────────────
    const inputName = new DerivedProperty(
      [model.solveForProperty, p.synodicInputStringProperty, p.siderealInputStringProperty],
      (solveFor, synodic, sidereal) => (solveFor === SolveFor.SIDEREAL ? synodic : sidereal),
    );
    const unitPattern = (unit: TimeUnit): TReadOnlyProperty<string> =>
      unit === TimeUnit.YEARS ? common.yearsPatternStringProperty : common.daysPatternStringProperty;
    const inputText = new Text("", { font: READOUT_FONT, fill: LIGHT_SURFACE_TEXT_FILL, maxWidth: innerWidth - 40 });
    Multilink.multilink(
      [model.inputProperty, model.unitProperty, common.yearsPatternStringProperty, common.daysPatternStringProperty],
      (value, unit) => {
        inputText.string = StringUtils.fillIn(unitPattern(unit).value, { value: fixed(value, decimalsFor(unit)) });
      },
    );
    const inputButton = new RectangularPushButton({
      ...FLAT_PANEL_PUSH_BUTTON_OPTIONS,
      content: inputText,
      minWidth: 140,
      xMargin: 10,
      yMargin: 5,
      accessibleName: a11y.inputStringProperty,
      listener: () => {
        keypadDialog.beginEdit(
          (value: number) => {
            model.inputProperty.value = value;
          },
          model.inputRange(),
          p.keypadRangePatternStringProperty,
          () => undefined,
        );
      },
    });

    // ── Formula ──────────────────────────────────────────────────────────────
    const formula = new DerivedProperty([model.planetTypeProperty], (type) =>
      type === PlanetType.INFERIOR ? "1/<i>S</i> = 1/<i>P</i> − 1/<i>E</i>" : "1/<i>S</i> = 1/<i>E</i> − 1/<i>P</i>",
    );
    const substituted = new DerivedProperty(
      [model.planetTypeProperty, model.solveForProperty, model.inputYearsProperty, model.resultYearsProperty],
      (type, solveFor, input, result) => {
        const s = solveFor === SolveFor.SIDEREAL ? fixed(input, 3) : result === null ? "?" : fixed(result, 3);
        const pValue = solveFor === SolveFor.SYNODIC ? fixed(input, 3) : result === null ? "?" : fixed(result, 3);
        return type === PlanetType.INFERIOR ? `1/${s} = 1/${pValue} − 1/1` : `1/${s} = 1/1 − 1/${pValue}`;
      },
    );

    // ── Result ───────────────────────────────────────────────────────────────
    const resultName = new DerivedProperty(
      [model.solveForProperty, p.siderealResultStringProperty, p.synodicResultStringProperty],
      (solveFor, sidereal, synodic) => (solveFor === SolveFor.SIDEREAL ? sidereal : synodic),
    );
    const resultString = new DerivedProperty(
      [model.resultYearsProperty, common.yearsAndDaysPatternStringProperty],
      (result, pattern) =>
        result === null
          ? ""
          : StringUtils.fillIn(pattern, { years: fixed(result, 3), days: fixed(result * DAYS_PER_YEAR, 1) }),
    );
    const resultText = new Text(resultString, {
      font: BIG_READOUT_FONT,
      fill: PlanetaryConfigurationsColors.textColorProperty,
      maxWidth: innerWidth,
    });
    const noSolution = new RichText(p.noSolutionStringProperty, {
      font: SMALL_FONT,
      fill: PlanetaryConfigurationsColors.retrogradeColorProperty,
      lineWrap: innerWidth,
    });
    model.resultYearsProperty.link((result) => {
      resultText.visible = result !== null;
      noSolution.visible = result === null;
    });

    const sectionLabel = (stringProperty: TReadOnlyProperty<string>): Text =>
      label(stringProperty, { maxWidth: innerWidth, fill: secondary });

    super(
      new VBox({
        align: "left",
        spacing: PANEL_ROW_SPACING + 2,
        children: [
          heading(p.calculatorStringProperty, innerWidth),
          sectionLabel(common.planetTypeStringProperty),
          typeRadio,
          sectionLabel(p.solveForStringProperty),
          solveRadio,
          sectionLabel(p.unitsStringProperty),
          unitRadio,
          sectionLabel(inputName),
          inputButton,
          new RichText(formula, { font: READOUT_FONT, fill: PlanetaryConfigurationsColors.textColorProperty }),
          new Text(substituted, { font: SMALL_FONT, fill: secondary, maxWidth: innerWidth }),
          label(p.earthPeriodNoteStringProperty, { font: SMALL_FONT, fill: secondary, maxWidth: innerWidth }),
          sectionLabel(resultName),
          resultText,
          noSolution,
        ],
      }),
      { minWidth: width, maxWidth: width, align: "left" },
    );
    this.interactiveNodes = [typeRadio, solveRadio, unitRadio, inputButton];
  }
}
