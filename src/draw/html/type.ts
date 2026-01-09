import type { Game } from "../../game";
import type { KnobId } from "./knob";
import type { GameState } from "../../state";
import type { SlabId } from "./div/slab/slab";

export type HTMLKey = keyof HTMLElementTagNameMap;
type HTMLValue<K extends HTMLKey = HTMLKey> = HTMLElementTagNameMap[K];
export type HTMLId =
  | "game"
  | "boardframe"
  | "board"
  | "deckslab"
  | "tally"
  | "lave"
  | "deal"
  | "friendslab"
  | "house"
  | KnobId
  | SlabId
  | undefined;
export type HTMLClass = "brick";

type Idful<I extends HTMLId = HTMLId> = { id: I };
export const hasId = (x: object): x is Idful => {
  return "id" in x;
};

type Classful<C extends HTMLClass = HTMLClass> = { classes: C[] };
export const hasClass = (x: object): x is Classful => {
  return "class" in x;
};

export type Elementful<K extends HTMLKey = HTMLKey> = { element: HTMLValue<K> };
export const hasElement = (x: object): x is Elementful => {
  return "element" in x;
};

export type ElementWithId<
  K extends HTMLKey = HTMLKey,
  I extends HTMLId = HTMLId
> = Elementful<K> & Idful<I>;

export type ElementWithClasses<
  K extends HTMLKey = HTMLKey,
  C extends HTMLClass = HTMLClass
> = Elementful<K> & Classful<C>;

// `GameState` and not `Game`, since all the makes before any of the draws
export type HTMLMake<I extends ElementWithId> = (gameState: GameState) => I;
export type HTMLMakeWith<I extends ElementWithId> = (
  gameState: GameState,
  ...args: any[]
) => I;

export type HTMLUpdateWith<I extends ElementWithId> = (
  gameState: GameState,
  elementful: I,
  ...args: any[]
) => true;

export type HTMLDraw = (game: Game, now: number) => void;

export const makeWithId = <
  K extends HTMLKey = HTMLKey,
  I extends HTMLId = HTMLId
>(
  tagName: K,
  id: I
): ElementWithId<K, I> => {
  const thing = {
    element: document.createElement(tagName),
    id,
  };
  if (id) thing.element.setAttribute("id", id);
  return thing;
};

export const unchildAll = (element: HTMLElement) => {
  while (element.firstChild) {
    element.removeChild(element.lastChild!);
  }
  return element;
};
