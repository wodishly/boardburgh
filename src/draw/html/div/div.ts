import { makeDeckslab, type Deckslab } from "./slab/deckslab";
import type { GameState } from "../../../state";
import {
  type BoardCanvas,
  type BoardframeDiv,
  makeBoardframeDiv,
} from "../../../board";
import { wakeHandle } from "../../handle";
import { withCommas, type Z } from "../../../help/reckon";
import { type ElementWithId, makeWithId } from "../type";
import { canvasToWorld, worldToCanvas } from "../../brush";
import { ringdeal } from "../../canvas";
import { getCanvas, type Game } from "../../../game";

export type GameDiv = ElementWithId<"div", "game"> & {
  boardframeDiv: BoardframeDiv;
  url: typeof window.URL | typeof window.webkitURL; // | typeof window;
  isDark: boolean;
};

export const makeUrl = () => {
  if (window.URL) {
    // console.log("window.URL");
    return window.URL;
  } else if (window.webkitURL) {
    // console.log("window.webkitURL");
    return window.webkitURL;
  } else {
    throw new Error("bad url");
    // return window;
  }
};

export const makeGameDiv = (gameState: GameState): GameDiv => {
  const almostGameDiv = makeWithId("div", "game" as const);

  const boardframeDiv = makeBoardframeDiv(gameState);
  wakeHandle(gameState.handle, boardframeDiv.boardCanvas);
  almostGameDiv.element.append(boardframeDiv.element);

  document.body.insertBefore(almostGameDiv.element, document.body.firstChild);

  return {
    ...almostGameDiv,
    boardframeDiv,
    url: makeUrl(),
    isDark: bg() === "black",
  };
};

export const drawDebug = (game: Game) => {
  const handle = game.state.handle;
  const boardCanvas = getCanvas(game);
  boardCanvas.context.font = `15px sans-serif`;
  boardCanvas.context.fillStyle = fg();

  if (game.state.isLeeching) {
    drawDebugOrd(
      boardCanvas,
      canvasToWorld(handle.mouse.z, boardCanvas.eye),
      "mouse"
    );
    drawDebugOrd(
      boardCanvas,
      canvasToWorld(boardCanvas.eye.pan, boardCanvas.eye),
      "0"
    );
    drawDebugOrd(
      boardCanvas,
      canvasToWorld({ x: 15, y: 15, kind: "canvas" as const }, boardCanvas.eye),
      "0"
    );
    drawDebugOrd(
      boardCanvas,
      { x: 400, y: 200, kind: "world" as const },
      "ord"
    );
  }
};

export const drawDebugOrd = (
  boardCanvas: BoardCanvas,
  z: Z<"world">,
  name = ""
) => {
  const { eye, context: feather } = boardCanvas;
  const worldZ = z;
  const screenZ = worldToCanvas(z, eye);

  feather.fillText(
    `${name}_s: ${withCommas(screenZ, true)}`,
    screenZ.x,
    screenZ.y - 10
  );
  ringdeal(
    boardCanvas,
    {
      navel: z.kind === "world" ? worldZ : canvasToWorld(screenZ, eye),
      halfwidth: 2,
    },
    0,
    2 * Math.PI,
    {
      fillColor: fg(),
    }
  );
  feather.fillText(
    `${name}_w: ${withCommas(worldZ, true)}`,
    screenZ.x,
    screenZ.y + 10
  );
};

export const fg = () => {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "white"
    : "black";
};

export const bg = () => {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "black"
    : "white";
};
