/**
 * Memory-leak regression suite (fleet standard).
 *
 * List every model/view object that links Properties, adds listeners, or owns child
 * nodes, with a factory that builds a fresh instance. The shared harness in
 * tests/helpers/memoryLeak.ts (template-owned) checks that each one is garbage
 * collected after dispose() and leaves no survivors across repeated cycles
 * (idempotentDispose: true also checks a second dispose()). Add sim-specific leak
 * tests below using forceGC().
 *
 * Screen models and views live for the whole sim. The objects created and disposed at
 * runtime are the Configurations screen's configuration markers (rebuilt when the orbit
 * changes); the remaining cases cover the shared factories that link to locale strings.
 */

import { EnumerationProperty, Property } from "scenerystack/axon";
import { Vector2 } from "scenerystack/dot";
import { describe, expect, it } from "vitest";
import { ConfigurationEvent } from "../src/common/model/ConfigurationEvent.js";
import { PlanetChoice } from "../src/common/model/PlanetChoice.js";
import { PlanetType } from "../src/common/model/PlanetType.js";
import { BodyNode } from "../src/common/view/BodyNode.js";
import { checkbox, eventNameProperty, planetNameProperty, radioGroup } from "../src/common/view/viewUtils.js";
import { ConfigurationMarkerNode } from "../src/configurations/view/ConfigurationMarkerNode.js";
import { StringManager } from "../src/i18n/StringManager.js";
import { describeDisposalLeaks } from "./helpers/memoryLeak.js";

const strings = StringManager.getInstance();
const choiceProperty = new EnumerationProperty(PlanetChoice.MARS);
const eventProperty = new Property<ConfigurationEvent | null>(ConfigurationEvent.OPPOSITION);
const typeProperty = new EnumerationProperty(PlanetType.SUPERIOR);
const flagProperty = new Property(true);

describeDisposalLeaks([
  {
    name: "ConfigurationMarkerNode",
    create: () => new ConfigurationMarkerNode(ConfigurationEvent.OPPOSITION, new Vector2(10, 20), new Vector2(0, 0)),
  },
  {
    name: "BodyNode with label",
    create: () => new BodyNode(6, "red", { labelStringProperty: strings.getPlanetName("mars") }),
  },
  { name: "planetNameProperty", create: () => planetNameProperty(choiceProperty) as unknown as { dispose(): void } },
  { name: "eventNameProperty", create: () => eventNameProperty(eventProperty) as unknown as { dispose(): void } },
  {
    name: "planet-type radio group",
    create: () =>
      radioGroup(
        typeProperty,
        [
          { value: PlanetType.SUPERIOR, stringProperty: strings.getCommonStrings().superiorStringProperty },
          { value: PlanetType.INFERIOR, stringProperty: strings.getCommonStrings().inferiorStringProperty },
        ],
        strings.getCommonStrings().planetTypeStringProperty,
      ),
  },
  { name: "checkbox", create: () => checkbox(flagProperty, strings.getCommonStrings().labelsStringProperty) },
]);

describe("name properties", () => {
  it("leave no listener on the model Property after dispose", () => {
    const property = new EnumerationProperty(PlanetChoice.VENUS);
    expect(property.hasListeners()).toBe(false);
    const name = planetNameProperty(property) as unknown as { dispose(): void };
    expect(property.hasListeners()).toBe(true);
    name.dispose();
    expect(property.hasListeners()).toBe(false);
  });
});
