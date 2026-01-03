import type { Brick } from "./brick/brickstate";
import { type Deck, makeDeck } from "./brick/deck";
import { type Handle, makeHandle } from "./draw/handle";
import type { Maybe } from "./help/type";

export type GameState = {
  handle: Handle;
  deck: Deck;
  boardlist: Brick[];
  chosen: Maybe<Brick>;
  ids: number;
};

export const makeGameState = (): GameState => {
  return {
    handle: makeHandle(),
    deck: makeDeck(),
    boardlist: [],
    chosen: undefined,
    ids: 0,
  };
};
