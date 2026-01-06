import { drawBoard, updateBoard } from "./board";
import { freeze } from "./brick/brickstate";
import { dealBrick, runTally } from "./brick/deck";
import { updateDeckframeWith } from "./draw/html/deckframe-div";
import { type GameDiv, makeGameDiv } from "./draw/html/game-div";
import { handleKeys } from "./key";
import { type GameState, makeGameState } from "./state";

// type Cursor = "default" | "grab" | "grabbing";

export type Game = {
  state: GameState;
  div: GameDiv;
};

export const makeGame = (): Game => {
  const state = makeGameState();
  const div = makeGameDiv(state);
  return { state, div };
};

export const startGame = (game: Game) => {
  const first = dealBrick(game.state, 0);
  first.z = { x: 768, y: 512, kind: "world" };
  freeze(first);

  updateDeckframeWith(
    game.state,
    game.div.deckframeDiv.laveSpan,
    game.div.deckframeDiv.tallyDiv,
    runTally(game.state)
  );
};

export const updateGame = (game: Game, now: number) => {
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
