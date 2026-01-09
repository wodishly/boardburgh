import { isBrickname } from "../../../../brick/brickname";
import { dealBrick, runTally, type Tally } from "../../../../brick/deck";
import type { GameState } from "../../../../state";
import { type Knobful, makeKnob } from "../../knob";
import { makeSVGToken } from "../../../svg";
import {
  type Elementful,
  type ElementWithId,
  type HTMLMake,
  makeWithId,
  unchildAll,
} from "../../type";
import { makeSlab, type Slab } from "./slab";

export type Deckslab = Slab<"deckslab"> & {
  laveSpan: LaveSpan;
  tallyDiv: TallyDiv;
  dealDiv: DealDiv;
} & Knobful<"deal">;

export type LaveSpan = ElementWithId<"span", "lave">;

export type TallyDiv = ElementWithId<"div", "tally"> & {
  tallyUls: TallyUl[];
};

export type TallyUl = Elementful<"ul">;

export type DealDiv = ElementWithId<"div", "deal">;

export const makeDeckslab: HTMLMake<Deckslab> = (gameState) => {
  const deckslab = makeSlab<"deckslab">(gameState, "deckslab", "");

  const laveSpan = makeWithId("span", "lave" as const);
  const tallyDiv = makeTallyDiv(gameState);
  const dealDiv = makeWithId("div", "deal" as const);

  const dealKnob = makeKnob(gameState, "deal", () => {
    dealBrick(gameState, 0);
    updateDeckslabWith(gameState, laveSpan, tallyDiv, runTally(gameState));
  });
  deckslab.element.append(
    laveSpan.element,
    tallyDiv.element,
    dealDiv.element,
    dealKnob.element
  );

  return { ...deckslab, laveSpan, tallyDiv, dealDiv, dealKnob };
};

export const makeTallyDiv: HTMLMake<TallyDiv> = (_) => {
  const tallyDiv = makeWithId("div", "tally" as const);
  return { ...tallyDiv, tallyUls: [] };
};

export const updateDeckslabWith = (
  _: GameState,
  laveSpan: LaveSpan,
  tallyDiv: TallyDiv,
  tally: Tally
) => {
  const tallyEntries = Object.entries(tally);

  laveSpan.element.innerHTML = Object.values(tally)
    .reduce((x, y) => x + y)
    .toString();

  tallyDiv.tallyUls = [];
  unchildAll(tallyDiv.element);
  const warpLength = 8;

  for (
    let i = 0;
    i <= Math.floor(Object.keys(tally).length / warpLength);
    i++
  ) {
    const tallyUl = { element: document.createElement("ul") };

    for (const [k, v] of tallyEntries.slice(
      warpLength * i,
      warpLength * (i + 1)
    )) {
      if (!isBrickname(k)) throw new Error("bad brickname");
      const tallyLi = document.createElement("li");

      const tokenSvg = makeSVGToken(k);
      const label = document.createElement("label");
      label.innerHTML = v.toString();
      label.setAttribute("for", `token-${k}`);

      tallyLi.append(tokenSvg);
      tallyLi.append(label);
      tallyUl.element.append(tallyLi);
    }
    tallyDiv.tallyUls.push(tallyUl);
    tallyDiv.element.append(tallyUl.element);
  }

  return true;
};
