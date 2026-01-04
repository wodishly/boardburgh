import { isBrickname } from "../../brick/brickname";
import { dealBrick, runTally, type Tally } from "../../brick/deck";
import type { GameState } from "../../state";
import { type Knobful, bakeKnob } from "../knob";
import { makeSVGToken } from "../svg/svg";
import {
  type Elementful,
  type ElementWithId,
  type HTMLMake,
  makeWithId,
  unchildAll,
} from "./html";

export type DeckframeDiv = ElementWithId<"div", "deckframe"> & {
  laveSpan: LaveSpan;
  tallyDiv: TallyDiv;
  dealDiv: DealDiv;
} & Knobful<"make">;

export type LaveSpan = ElementWithId<"span", "lave">;

export type TallyDiv = ElementWithId<"div", "tally"> & {
  tallyUls: TallyUl[];
};

export type TallyUl = Elementful<"ul">;

export type DealDiv = ElementWithId<"div", "deal">;

export const makeDeckframeDiv: HTMLMake<DeckframeDiv> = (gameState) => {
  const deckframeDiv = makeWithId("div", "deckframe" as const);

  const laveSpan = makeWithId("span", "lave" as const);
  const tallyDiv = makeTallyDiv(gameState);
  const dealDiv = makeWithId("div", "deal" as const);

  const makeKnob = bakeKnob(gameState, "make", () => {
    dealBrick(gameState, 0);
    updateDeckframeWith(gameState, laveSpan, tallyDiv, runTally(gameState));
  });
  deckframeDiv.element.append(
    laveSpan.element,
    tallyDiv.element,
    dealDiv.element,
    makeKnob.element
  );

  return { ...deckframeDiv, laveSpan, tallyDiv, dealDiv, makeKnob };
};

export const makeTallyDiv: HTMLMake<TallyDiv> = (_) => {
  const tallyDiv = makeWithId("div", "tally" as const);
  return { ...tallyDiv, tallyUls: [] };
};

export const updateDeckframeWith = (
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
