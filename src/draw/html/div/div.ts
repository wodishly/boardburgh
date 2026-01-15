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
import { getCanvas, getEye, type Game } from "../../../game";
import { bg, fg } from "../../../settings";
import { makeSlablistSpan, type SlablistSpan } from "./slab/slablist";

export type GameDiv = ElementWithId<"div", "game"> & {
  boardframeDiv: BoardframeDiv;
  slablistSpan: SlablistSpan;
  isDark: boolean;
};

export const makeGameDiv = (gameState: GameState): GameDiv => {
  const almostGameDiv = makeWithId("div", "game" as const);

  const boardframeDiv = makeBoardframeDiv(gameState);
  wakeHandle(gameState.handle, boardframeDiv.boardCanvas);

  const slablistSpan = makeSlablistSpan(gameState, boardframeDiv.slabs);
  almostGameDiv.element.append(boardframeDiv.element, slablistSpan.element);

  document.body.insertBefore(almostGameDiv.element, document.body.firstChild);

  return {
    ...almostGameDiv,
    boardframeDiv,
    slablistSpan,
    isDark: bg() === "black",
  };
};

export const drawDebug = (game: Game) => {
  const eye = getEye(game);
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
      {
        brush: {
          fontSize: 15 * eye.zoom.scale,
          fillColor: fg(),
          textAlign: "left",
        },
      },
      `p_knob: ${handle.mouse.pointer.knob?.slice(7) ?? ""}`,
      {
        x: handle.mouse.pointer.z.x - 50 * eye.zoom.scale,
        y: handle.mouse.pointer.z.y + 30 * eye.zoom.scale,
        kind: "canvas",
      }
    );
    withBorrowedContextForText(
      boardCanvas.context,
      {
        brush: {
          fontSize: 15 * eye.zoom.scale,
          fillColor: fg(),
          textAlign: "left",
        },
      },
      `p_move: ${handle.mouse.pointer.move?.slice(7) ?? ""}`,
      {
        x: handle.mouse.pointer.z.x - 50 * eye.zoom.scale,
        y: handle.mouse.pointer.z.y + 50 * eye.zoom.scale,
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
      {
        brush: {
          fontSize: 15 * eye.zoom.scale,
          fillColor: fg(),
          textAlign: "left",
        },
      },
      `zoom: ${roundTo(eye.zoom.scale, 3)}`,
      {
        x: handle.mouse.pointer.z.x - 50 * eye.zoom.scale,
        y: handle.mouse.pointer.z.y + 70 * eye.zoom.scale,
        kind: "canvas",
      }
    );
    drawDebugOrd(
      boardCanvas,
      canvasToWorld(boardCanvas.eye.zoom.navel, boardCanvas.eye),
      "z0"
    );

    drawDebugOrd(
      boardCanvas,
      canvasToWorld({ x: 15, y: 15, kind: "canvas" as const }, boardCanvas.eye),
      "0s"
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
        fontSize: 15 * eye.zoom.scale,
        fillColor: fg(),
        ...brush,
      },
    },
    `${name}_s: ${withCommas(screenZ, true)}`,
    { x: screenZ.x, y: screenZ.y - 10 * eye.zoom.scale, kind: "canvas" }
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
        fontSize: 15 * eye.zoom.scale,
        fillColor: fg(),
        ...brush,
      },
    },
    `${name}_w: ${withCommas(worldZ, true)}`,
    { x: screenZ.x, y: screenZ.y + 10 * eye.zoom.scale, kind: "canvas" }
  );
};
