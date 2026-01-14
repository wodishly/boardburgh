import type { GameState } from "../../../state";
import {
  type BoardCanvas,
  type BoardframeDiv,
  makeBoardframeDiv,
} from "../../../board";
import { wakeHandle } from "../../handle";
import { roundTo, toList, withCommas, type Z } from "../../../help/reckon";
import { type ElementWithId, makeWithId } from "../type";
import { canvasToWorld, worldToCanvas, type Brush } from "../../brush";
import { withBorrowedContext, withBorrowedContextForText } from "../../canvas";
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

  if (game.state.isLeeching) {
    drawDebugOrd(
      boardCanvas,
      canvasToWorld(handle.mouse.pointer.z, boardCanvas.eye),
      "pointer"
    );
    withBorrowedContextForText(
      boardCanvas.context,
      { brush: { fontSize: 15, fillColor: fg(), textAlign: "left" } },
      `p0_knob: ${handle.mouse.pointer.knob?.slice(7) ?? ""}`,
      {
        x: handle.mouse.pointer.z.x - 50,
        y: handle.mouse.pointer.z.y + 30,
        kind: "canvas",
      }
    );
    withBorrowedContextForText(
      boardCanvas.context,
      { brush: { fontSize: 15, fillColor: fg(), textAlign: "left" } },
      `p0_move: ${handle.mouse.pointer.move?.slice(7) ?? ""}`,
      {
        x: handle.mouse.pointer.z.x - 50,
        y: handle.mouse.pointer.z.y + 50,
        kind: "canvas",
      }
    );
    drawDebugOrd(
      boardCanvas,
      canvasToWorld(boardCanvas.eye.pan, boardCanvas.eye),
      "unpan"
    );

    withBorrowedContextForText(
      boardCanvas.context,
      { brush: { fontSize: 15, fillColor: fg(), textAlign: "left" } },
      `zoom: ${roundTo(boardCanvas.eye.zoom.scale, 3)}`,
      {
        x: handle.mouse.pointer.z.x - 50,
        y: handle.mouse.pointer.z.y + 70,
        kind: "canvas",
      }
    );
    drawDebugOrd(
      boardCanvas,
      canvasToWorld(boardCanvas.eye.zoom.newNavel, boardCanvas.eye),
      "z0"
    );

    drawDebugOrd(
      boardCanvas,
      canvasToWorld({ x: 15, y: 15, kind: "canvas" as const }, boardCanvas.eye),
      "0w"
    );
    drawDebugOrd(
      boardCanvas,
      { x: 400, y: 200, kind: "world" as const },
      "someOrd"
    );
  }
};

export const drawDebugOrd = (
  boardCanvas: BoardCanvas,
  z: Z<"world">,
  name = "",
  brush: Partial<Brush> = {}
) => {
  const { eye, context } = boardCanvas;
  const worldZ = z;
  const screenZ = worldToCanvas(z, eye);

  withBorrowedContextForText(
    context,
    {
      brush: {
        fontSize: 15,
        fillColor: fg(),
        ...brush,
      },
    },
    `${name}_s: ${withCommas(screenZ, true)}`,
    { x: screenZ.x, y: screenZ.y - 10, kind: "canvas" }
  );
  withBorrowedContext(
    context,
    { brush: { fillColor: fg(), strokeColor: fg(), ...brush } },
    (context) => {
      context.arc(
        ...toList(z.kind === "world" ? worldToCanvas(worldZ, eye) : screenZ),
        eye.zoom.scale * 2,
        0,
        2 * Math.PI
      );
    }
  );
  withBorrowedContextForText(
    context,
    {
      brush: {
        fontSize: 15,
        fillColor: fg(),
        ...brush,
      },
    },
    `${name}_w: ${withCommas(worldZ, true)}`,
    { x: screenZ.x, y: screenZ.y + 10, kind: "canvas" }
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
