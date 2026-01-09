import { isBrick, type Brick } from "./brick/brickstate";
import { type Deck, makeDeck } from "./brick/deck";
import { type Handle, makeHandle } from "./draw/handle";
import { isSlab, isSlabId, type Slab } from "./draw/html/div/slab/slab";
import type { Game } from "./game";
import type { Maybe } from "./help/type";

export type GameState<Ch extends Chosen = Chosen> = {
  handle: Handle;
  deck: Deck;
  boardlist: Brick[];
  chosen: Ch;
  ids: number;
  isLeeching: boolean;
};

export type Chosen = Maybe<Slab | Brick>;

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

export const isChosen = (game: Game, thing: NonNullable<Chosen>) => {
  return isSlab(thing) && isSlab(game.state.chosen)
    ? thing.id === game.state.chosen.id
    : isBrick(thing) && isBrick(game.state.chosen)
    ? thing.boardId === game.state.chosen.boardId
    : false;
};
