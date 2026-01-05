import {
  handleBrick,
  isBrick,
  isInState,
  wayTo,
  type Brick,
} from "./brick/brickstate";
import {
  type ElementWithId,
  type HTMLMake,
  makeWithId,
} from "./draw/html/type";
import { Settings } from "./settings";
import { makeEye, resize, type Eye } from "./draw/eye";
import { isWaytell, waynameOf, wayPlus } from "./help/way";
import { getCanvas, type Game } from "./game";
import {
  drawCityToCanvas,
  drawFieldToCanvas,
  drawRoadToCanvas,
  drawShieldToCanvas,
  wipe,
  withBorrowedContext,
  withBorrowedContextForText,
} from "./draw/canvas";
import { drawDebug, drawDebugOrd, fg } from "./draw/html/game-div";
import { withCommas, z } from "./help/reckon";
import { canvasToWorld, worldToCanvas, edgebrushOf } from "./draw/brush";
import { toRectangle } from "./draw/shape";
import { type Maybe } from "./help/type";
import { isChosen } from "./state";

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

export const isMouseInBrick = (game: Game, brick: Brick) => {
  const mouse = game.state.handle.mouse;
  const worldZ = canvasToWorld(mouse.z, game.div.boardframeDiv.boardCanvas.eye);
  return (
    Math.abs(brick.z.x - worldZ.x) < Settings.brickLength / 2 &&
    Math.abs(brick.z.y - worldZ.y) < Settings.brickLength / 2
  );
};

export const doesWeave = (brick: Brick, other: Brick) => {
  const way = wayTo(brick, other);
  if (!isWaytell(brick.spin) || !isWaytell(other.spin)) {
    return false;
  }
  switch (way) {
    case "east":
      return (
        brick.edges[wayPlus(waynameOf(brick.spin), "west")] ===
        other.edges[wayPlus(waynameOf(other.spin), "east")]
      );
    case "north":
      return (
        brick.edges[wayPlus(waynameOf(brick.spin), "south")] ===
        other.edges[wayPlus(waynameOf(other.spin), "north")]
      );
    case "west":
      return (
        brick.edges[wayPlus(waynameOf(brick.spin), "east")] ===
        other.edges[wayPlus(waynameOf(other.spin), "west")]
      );
    case "south":
      return (
        brick.edges[wayPlus(waynameOf(brick.spin), "north")] ===
        other.edges[wayPlus(waynameOf(other.spin), "south")]
      );
  }
  way satisfies never;
};

export const updateBoard = (game: Game, _now: number) => {
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
  drawChosen(game, game.state.chosen);
  drawDebug(game.state.handle, canvas);
};

const drawChosen = (game: Game, chosen: Maybe<Brick>) => {
  if (chosen === undefined) {
    return;
  } else if (isBrick(chosen)) {
    drawBrick(game, chosen);
  } else {
    throw new Error("bad chosen");
  }
};

const drawBrick = (game: Game, brick: Brick) => {
  const canvas = getCanvas(game);

  const brickframe = toRectangle({
    navel: worldToCanvas(brick.z, canvas.eye),
    greatness: worldToCanvas(
      z(Settings.brickLength, Settings.brickLength, "world"),
      canvas.eye,
      false
    ),
  });

  const wend = {
    navel: z(
      brickframe.x + brickframe.width / 2,
      brickframe.y + brickframe.height / 2,
      "canvas"
    ),
    winkle: brick.spin,
  };

  drawFieldToCanvas(canvas.context, wend, brickframe);
  drawRoadToCanvas(canvas.context, wend, brickframe, brick.brickname);
  drawCityToCanvas(canvas.context, wend, brickframe, brick.brickname);
  drawShieldToCanvas(canvas.context, wend, brickframe, brick.brickname);

  if (isInState(brick, "spin")) {
    drawDebugOrd(canvas, canvasToWorld(wend.navel, canvas.eye), "wend");
    withBorrowedContext(
      canvas.context,
      { brush: { fillColor: fg() }, wend: undefined },
      (context) => {
        context.moveTo(brick.choose.clickZ.x, brick.choose.clickZ.y);
        context.lineTo(
          game.state.handle.mouse.z.x,
          game.state.handle.mouse.z.y
        );
      }
    );
  }

  withBorrowedContext(
    canvas.context,
    { brush: edgebrushOf(brick), dontFill: true, wend },
    (context) => {
      context.rect(
        -brickframe.width / 2,
        -brickframe.height / 2,
        brickframe.width,
        brickframe.height
      );
    }
  );

  withBorrowedContextForText(
    canvas.context,
    {
      brush: { fillColor: isChosen(game, brick) ? "white" : "black" },
      wend,
    },
    `(${withCommas(brick.z)})`,
    worldToCanvas(
      { x: brick.z.x, y: brick.z.y - 20, kind: "world" },
      canvas.eye
    )
  );
  withBorrowedContextForText(
    canvas.context,
    {
      brush: {
        fontSize: 15,
        fillColor: isChosen(game, brick) ? "white" : "black",
      },
      wend,
    },
    brick.state,
    worldToCanvas(
      { x: brick.z.x, y: brick.z.y + 20, kind: "world" },
      canvas.eye
    )
  );
  withBorrowedContextForText(
    canvas.context,
    {
      brush: {
        fontSize: 15,
        fillColor: isChosen(game, brick) ? "white" : "black",
      },
      wend,
    },
    `${game.state.boardlist.indexOf(brick)}`,
    worldToCanvas(
      { x: brick.z.x - 41, y: brick.z.y + 49, kind: "world" },
      canvas.eye
    )
  );
  withBorrowedContextForText(
    canvas.context,
    {
      brush: {
        fontSize: 15,
        fillColor: isChosen(game, brick) ? "white" : "black",
      },
      wend,
    },
    `${brick.brickname}`,
    worldToCanvas(
      { x: brick.z.x + 41, y: brick.z.y - 49, kind: "world" },
      canvas.eye
    )
  );
};
