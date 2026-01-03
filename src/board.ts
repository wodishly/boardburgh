import { handleBrick, isBrick, type Brick } from "./brick/brickstate";
import {
  type ElementWithId,
  type HTMLMake,
  makeWithId,
} from "./draw/html/html";
import { Settings } from "./settings";
import type { GameState } from "./state";
import { makeEye, resize, type Eye } from "./draw/eye";
import { toEdgeZ, wayPlus, type Way } from "./brick/way";
import { getCanvas, setCursor, type Game } from "./game";
import { stave, wipe, borrowContext } from "./draw/canvas/canvas";
import { drawDebug } from "./draw/html/game-div";
import { z } from "./help/reckon";
import { screenToWorld, worldToScreen, edgebrushOf } from "./draw/draw";
import { drawBrickshape, spunAbout } from "./draw/draw-brickshape";
import { toRectangle } from "./draw/shape";
import type { Maybe } from "./help/type";

export type BoardCanvas = ElementWithId<"canvas", "board"> & {
  context: CanvasRenderingContext2D;
  eye: Eye;
};

export type BoardframeDiv = ElementWithId<"div", "boardframe"> & {
  boardCanvas: BoardCanvas;
};

export const makeBoardframeDiv: HTMLMake<BoardframeDiv> = (gameState) => {
  const almostBoardDiv = makeWithId("div", "boardframe" as const);

  const almostBoardCanvas = makeWithId("canvas", "board" as const);
  almostBoardDiv.element.append(almostBoardCanvas.element);

  const context = almostBoardCanvas.element.getContext("2d");
  if (!context) throw new Error("bad context");

  const eye = makeEye(gameState.handle, almostBoardCanvas);

  const boardCanvas = { ...almostBoardCanvas, context, eye };

  resize(boardCanvas);

  return {
    ...almostBoardDiv,
    boardCanvas,
  };
};

export const nextId = (gameState: GameState) => {
  return gameState.ids++;
};

export const isMouseInBrick = (game: Game, brick: Brick) => {
  const mouse = game.state.handle.mouse;
  const worldZ = screenToWorld(mouse.z, game.div.boardframeDiv.boardCanvas.eye);
  return (
    Math.abs(brick.z.x - worldZ.x) < Settings.brickLength / 2 &&
    Math.abs(brick.z.y - worldZ.y) < Settings.brickLength / 2
  );
};

export const doesWeave = (brick: Brick, other: Brick) => {
  const way = wayTo(brick, other);
  switch (way) {
    case "east":
      return (
        brick.edges[wayPlus(brick.head, "west")] ===
        other.edges[wayPlus(other.head, "east")]
      );
    case "north":
      return (
        brick.edges[wayPlus(brick.head, "south")] ===
        other.edges[wayPlus(other.head, "north")]
      );
    case "west":
      return (
        brick.edges[wayPlus(brick.head, "east")] ===
        other.edges[wayPlus(other.head, "west")]
      );
    case "south":
      return (
        brick.edges[wayPlus(brick.head, "north")] ===
        other.edges[wayPlus(other.head, "south")]
      );
  }
  way satisfies never;
};

/**
 * `wayTo(x, y) = z` iff `x` is `z` of `y`.
 */
export const wayTo = (brick: Brick, other: Brick): Way => {
  const a = Math.atan2(brick.z.y - other.z.y, brick.z.x - other.z.x);
  return a < (-3 * Math.PI) / 4
    ? "west"
    : a < -Math.PI / 4
    ? "north"
    : a < Math.PI / 4
    ? "east"
    : a < (3 * Math.PI) / 4
    ? "south"
    : "west";
};

export const updateBoard = (game: Game, now: number) => {
  setCursor(game, "default");
  for (const thing of [...game.state.boardlist, game.state.chosen].reverse()) {
    if (isBrick(thing)) {
      handleBrick(game, thing);
    }
  }
};

export const drawBoard = (game: Game) => {
  const canvas = getCanvas(game);
  wipe(canvas);
  for (const thing of game.state.boardlist) {
    if (isBrick(thing)) {
      drawBrick(game, thing);
    } else {
      throw new Error("bad thing");
    }
  }
  drawThing(game, game.state.chosen);
  drawDebug(game.state.handle, canvas);
};

const drawThing = (game: Game, thing: Brick | undefined) => {
  if (thing === undefined) {
    return;
  } else if (isBrick(thing)) {
    drawBrick(game, thing);
  } else {
    throw new Error("bad thing");
  }
};

const drawBrick = (game: Game, brick: Brick) => {
  const canvas = getCanvas(game);
  const nooks = {
    navel: brick.z,
    greatness: z(Settings.brickLength, Settings.brickLength, "world"),
  };

  drawBrickshape(
    canvas,
    nooks,
    brick.brickname,
    brick.head,
    brick.choose?.spin
  );

  const rectangle = toRectangle({
    navel: worldToScreen(nooks.navel, canvas.eye),
    greatness: worldToScreen(nooks.greatness, canvas.eye, false),
  });

  borrowContext(canvas.context, edgebrushOf(brick), (context) => {
    spunAbout(
      context,
      {
        x: rectangle.x + rectangle.width / 2,
        y: rectangle.y + rectangle.height / 2,
        kind: "canvas",
      },
      brick.choose?.spin ?? 0,
      (ctx) =>
        ctx.rect(
          -rectangle.width / 2,
          -rectangle.height / 2,
          rectangle.width,
          rectangle.height
        )
    );
  });

  stave(
    game.div.boardframeDiv.boardCanvas,
    `(${brick.z.x}, ${brick.z.y})`,
    { x: brick.z.x, y: brick.z.y - 20, kind: "world" },
    {
      fontSize: 20,
      fontFace: "sans-serif",
      fillColor:
        brick.boardId === game.state.chosen?.boardId ? "white" : "black",
      textAlign: "center",
      textBaseline: "middle",
    }
  );
  stave(
    game.div.boardframeDiv.boardCanvas,
    brick.state,
    { x: brick.z.x, y: brick.z.y + 20, kind: "world" },
    {
      fontSize: 20,
      fontFace: "sans-serif",
      fillColor:
        brick.boardId === game.state.chosen?.boardId ? "white" : "black",
      textAlign: "center",
      textBaseline: "middle",
    }
  );
  stave(
    game.div.boardframeDiv.boardCanvas,
    `${game.state.boardlist.indexOf(brick)}`,
    { x: brick.z.x - 41, y: brick.z.y + 49, kind: "world" },
    {
      fontSize: 15,
      fontFace: "sans-serif",
      fillColor:
        brick.boardId === game.state.chosen?.boardId ? "white" : "black",
      textAlign: "center",
      textBaseline: "middle",
    }
  );
  stave(
    game.div.boardframeDiv.boardCanvas,
    `${brick.brickname}`,
    { x: brick.z.x + 41, y: brick.z.y - 49, kind: "world" },
    {
      fontSize: 15,
      fontFace: "sans-serif",
      fillColor:
        brick.boardId === game.state.chosen?.boardId ? "white" : "black",
      textAlign: "center",
      textBaseline: "middle",
    }
  );
  stave(
    game.div.boardframeDiv.boardCanvas,
    "head",
    {
      x: brick.z.x + (Settings.brickLength / 3) * toEdgeZ(brick.head).x,
      y: brick.z.y + (Settings.brickLength / 3) * toEdgeZ(brick.head).y,
      kind: "world",
    },
    {
      fontSize: 15,
      fontFace: "sans-serif",
      fillColor:
        brick.boardId === game.state.chosen?.boardId ? "white" : "black",
      textAlign: "center",
      textBaseline: "middle",
    }
  );
};
