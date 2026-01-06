import type { Brick } from "./brick/brickstate";
import { type Deck, makeDeck } from "./brick/deck";
import { type Handle, makeHandle } from "./draw/handle";
import type { Game } from "./game";
import type { Maybe } from "./help/type";

export type GameState = {
  handle: Handle;
  deck: Deck;
  boardlist: Brick[];
  chosen: Maybe<Brick>;
  ids: number;
  isLeeching: boolean;
};

export const makeGameState = (): GameState => {
  return {
    handle: makeHandle(),
    deck: makeDeck(),
    boardlist: [],
    chosen: undefined,
    ids: 0,
    isLeeching: false,
  };
};

export const nextId = (gameState: GameState) => {
  return gameState.ids++;
};

export const isChosen = (game: Game, thing: Brick) => {
  return thing.boardId === game.state.chosen?.boardId;
};
