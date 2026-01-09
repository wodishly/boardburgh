import { drawBoard, updateBoard } from "./board";
import { freeze } from "./brick/brickstate";
import { dealBrick, runTally } from "./brick/deck";
import { updateDeckslabWith } from "./draw/html/div/slab/deckslab";
import { type GameDiv, makeGameDiv } from "./draw/html/div/div";
import { handleKeys } from "./key";
import { type GameState, makeGameState } from "./state";

// type Cursor = "default" | "grab" | "grabbing";

export type Game = {
  state: GameState;
  div: GameDiv;
};

export type GameUpdate = (game: Game, now: number) => void;

export const makeGame = (): Game => {
  const state = makeGameState();
  const div = makeGameDiv(state);
  return { state, div };
};

export const startGame = (game: Game) => {
  const first = dealBrick(game.state, 0);
  first.z = { x: 768, y: 512, kind: "world" };
  freeze(first);

  updateDeckslabWith(
    game.state,
    game.div.boardframeDiv.slabs.deckslab.laveSpan,
    game.div.boardframeDiv.slabs.deckslab.tallyDiv,
    runTally(game.state)
  );
};

export const updateGame: GameUpdate = (game: Game, now: number) => {
  handleKeys(game, now);
  updateBoard(game, now);
};

export const drawGame = (game: Game) => {
  drawBoard(game);
};

export const getCanvas = (game: Game) => {
  return game.div.boardframeDiv.boardCanvas;
};

export const getContext = (game: Game) => {
  return game.div.boardframeDiv.boardCanvas.context;
};

export const getEye = (game: Game) => {
  return game.div.boardframeDiv.boardCanvas.eye;
};

export const getMouse = (game: Game) => {
  return game.state.handle.mouse;
};
