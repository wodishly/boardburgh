import { getCanvas, type Game, type GameUpdate } from "../../../../game";
import type { Z } from "../../../../help/reckon";
import { type Maybe } from "../../../../help/type";
import type { GameState } from "../../../../state";
import type { Mouse } from "../../../handle";
import { hasElement, hasId, makeWithId, type ElementWithId } from "../../type";
import { matchSightly } from "./slablist";

export const SlabnameList = ["deck", "house", "worth", "help"] as const;
export type Slabname = (typeof SlabnameList)[number];
export type SlabId<N extends Slabname = Slabname> = `${N}slab`;

export const isSlabId = (x: string): x is SlabId => {
  return (
    x === "deckslab" ||
    x === "houseslab" ||
    x === "worthslab" ||
    x === "helpslab"
  );
};

type IsSightly = boolean;

export type Slab<
  I extends SlabId = SlabId,
  S extends IsSightly = IsSightly
> = ElementWithId<"div", I> & {
  startZ: Maybe<Z<"canvas">>;
  clickZ: Maybe<Z<"canvas">>;
  isSightly: S;
};

export const makeSlab = <I extends SlabId>(
  gameState: GameState,
  name: I,
  html = ""
): Slab<I> => {
  const div = makeWithId("div", name);
  div.element.classList.add("slab");
  div.element.innerHTML = html;

  const slab = {
    ...div,
    startZ: undefined,
    clickZ: undefined,
    isSightly: true,
  };
  matchSightly(slab);
  return slab;
};

export const isSlab = (x: Maybe<object>): x is Slab => {
  return (
    x !== undefined &&
    hasElement(x) &&
    x.element instanceof HTMLDivElement &&
    hasId(x) &&
    x.id !== undefined &&
    isSlabId(x.id)
  );
};

export const isSightly = <I extends SlabId>(
  slab: Slab<I>
): slab is Slab<I, true> => {
  return slab.isSightly;
};

export const updateSlabs: GameUpdate = (game: Game, now: number) => {
  const mouse = game.state.handle.mouse;

  // we need `.reverse()` here to correct for z-index
  for (const slab of Object.values(game.div.boardframeDiv.slabs).reverse()) {
    if (isSightly(slab)) {
      const mouseIsInSlab = isMouseInSlab(mouse, slab);
      if (mouse.pointer.knob === "pointerdown") {
        if (
          mouseIsInSlab &&
          slab.startZ === undefined &&
          slab.clickZ === undefined
        ) {
          if (!game.state.chosen) {
            slab.startZ = {
              x: unpx("left", slab.element),
              y: unpx("top", slab.element),
              kind: "canvas",
            };
            slab.clickZ = mouse.pointer.z;
            chooseSlab(game.state, slab);
          }
        }
        if (slab.startZ && slab.clickZ) {
          if (slab.element.style.top !== "auto") {
            slab.element.style.top = `${
              mouse.pointer.z.y + (slab.startZ.y - slab.clickZ.y)
            }px`;
            if (slab.element.style.bottom !== "auto") {
              slab.element.style.bottom = "auto";
            }
          }
          if (slab.element.style.left !== "auto") {
            slab.element.style.left = `${
              mouse.pointer.z.x + (slab.startZ.x - slab.clickZ.x)
            }px`;
            if (slab.element.style.right !== "auto") {
              slab.element.style.right = "auto";
            }
          }
        }
      } else if (mouse.pointer.knob === "pointerup") {
        slab.startZ = undefined;
        slab.clickZ = undefined;
        if (game.state.chosen) {
          unchooseSlab(game.state);
        }
      }
      const right = unpx("left", slab.element) + unpx("width", slab.element);
      const bottom = unpx("top", slab.element) + unpx("height", slab.element);

      if (right > getCanvas(game).element.width) {
        slab.element.style.left = `${
          getCanvas(game).element.width - unpx("width", slab.element)
        }px`;
      }
      if (unpx("top", slab.element) < 0) {
        slab.element.style.top = "0px";
      }
      if (unpx("left", slab.element) < 0) {
        slab.element.style.left = "0px";
      }
      if (bottom > getCanvas(game).element.height) {
        slab.element.style.top = `${
          getCanvas(game).element.height - unpx("height", slab.element)
        }px`;
      }
    }
  }
};

const unpx = <K extends keyof HTMLElementTagNameMap>(
  key: keyof CSSStyleDeclaration,
  element: HTMLElementTagNameMap[K]
) => {
  const computation = getComputedStyle(element)[key];
  if (typeof computation === "string" && computation.slice(-2) === "px") {
    return parseInt(computation.slice(0, -2));
  } else {
    console.log(key, element);
    throw new Error("bad unpx");
  }
};

export const isMouseInSlab = (mouse: Mouse, slab: Slab<SlabId, true>) => {
  const outcome =
    unpx("left", slab.element) < mouse.pointer.z.x &&
    mouse.pointer.z.x < unpx("left", slab.element) + slab.element.offsetWidth &&
    unpx("top", slab.element) < mouse.pointer.z.y &&
    mouse.pointer.z.y < unpx("top", slab.element) + slab.element.offsetHeight;

  if (outcome) {
    mouse.layer.push("slab");
  }
  return outcome;
};

const chooseSlab = (gameState: GameState, slab: Slab<SlabId, true>) => {
  if (gameState.chosen) {
    throw new Error("bad choose");
  }
  Object.assign(gameState, { chosen: slab });
};

const unchooseSlab = (gameState: GameState) => {
  if (!gameState.chosen) {
    console.log(gameState.chosen);
    throw new Error("bad unchoose");
  }
  if (isSlab(gameState.chosen)) {
    Object.assign(gameState, { chosen: undefined });
  }
};
