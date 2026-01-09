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
  drawBurghToCanvas,
  drawFieldToCanvas,
  drawRoadToCanvas,
  drawShieldToCanvas,
  wipe,
  withBorrowedContext,
  withBorrowedContextForText,
} from "./draw/canvas";
import { drawDebug, drawDebugOrd, fg } from "./draw/html/div/div";
import { withCommas, z } from "./help/reckon";
import { canvasToWorld, worldToCanvas, edgebrushOf } from "./draw/brush";
import { toRectangle } from "./draw/shape";
import { type Maybe } from "./help/type";
import { isChosen, type GameState } from "./state";
import { updateHandle } from "./draw/handle";
import { makeSlab, updateSlabs, type Slab } from "./draw/html/div/slab/slab";
import { makeDeckslab, type Deckslab } from "./draw/html/div/slab/deckslab";
import { makeFriendslab } from "./draw/html/div/slab/friendslab";
import { makeWorthslab } from "./draw/html/div/slab/worthslab";

export type BoardCanvas = ElementWithId<"canvas", "board"> & {
  context: CanvasRenderingContext2D;
  eye: Eye;
};

export type BoardframeDiv = ElementWithId<"div", "boardframe"> & {
  boardCanvas: BoardCanvas;
  slabs: {
    keyslab: Slab<"keyslab">;
    deckslab: Deckslab;
    friendslab: Slab<"friendslab">;
    worthslab: Slab<"worthslab">;
  };
};

export const makeBoardframeDiv: HTMLMake<BoardframeDiv> = (gameState) => {
  const almostBoardframeDiv = makeWithId("div", "boardframe" as const);

  const almostBoardCanvas = makeWithId("canvas", "board" as const);
  almostBoardframeDiv.element.append(almostBoardCanvas.element);

  const context = almostBoardCanvas.element.getContext("2d");
  if (!context) throw new Error("bad context");

  const eye = makeEye(gameState.handle, almostBoardCanvas);

  const slabs = {
    keyslab: makeKeyslab(gameState),
    deckslab: makeDeckslab(gameState),
    friendslab: makeFriendslab(gameState),
    worthslab: makeWorthslab(gameState),
  };
  for (const slab of Object.values(slabs)) {
    almostBoardframeDiv.element.append(slab.element);
  }

  const boardCanvas = {
    ...almostBoardCanvas,
    context,
    eye,
  };

  resize(boardCanvas);

  return {
    ...almostBoardframeDiv,
    boardCanvas,
    slabs: slabs,
  };
};

const makeKeyslab = (gameState: GameState) => {
  return makeSlab(
    gameState,
    "keyslab",
    "<h4>world</h4>" +
      "<ul>" +
      "<li><kbd>l</kbd> for leechsight</li>" +
      "</ul>" +
      "<h4>brick</h4>" +
      "<ul>" +
      "<li><strong>click</strong> to pick up or drop the brick</li>" +
      "<li><strong>click and drag</strong> to spin the brick</li>" +
      "<li><kbd>Shift</kbd></strong> to turn off snapping</li>" +
      "</ul>" +
      "<h4>slab</h4>" +
      "<ul>" +
      "<li><strong>click and drag</strong> to slide the slab</li>" +
      "</ul>"
  );
};

export const isMouseInBrick = (game: Game, brick: Brick) => {
  const mouse = game.state.handle.mouse;
  const worldZ = canvasToWorld(mouse.z, game.div.boardframeDiv.boardCanvas.eye);
  const outcome =
    Math.abs(brick.z.x - worldZ.x) < Settings.brickLength / 2 &&
    Math.abs(brick.z.y - worldZ.y) < Settings.brickLength / 2;
  if (outcome) {
    mouse.layer.push("brick");
  }
  return outcome;
};

export const doesWeave = (brick: Brick, other: Brick) => {
  return (
    isWaytell(brick.farthings) &&
    isWaytell(other.farthings) &&
    brick.edges[wayPlus(wayTo(other, brick), waynameOf(brick.farthings))] ===
      other.edges[wayPlus(wayTo(brick, other), waynameOf(other.farthings))]
  );
};

export const updateBoard = (game: Game, now: number) => {
  updateSlabs(game, now);

  for (const thing of [...game.state.boardlist, game.state.chosen].reverse()) {
    if (isBrick(thing)) {
      handleBrick(game, thing);
    }
  }

  updateHandle(game, now);
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
  if (isBrick(game.state.chosen)) {
    drawChosen(game, game.state.chosen);
  }
  // for (let i = 0; i < canvas.slabDivs.length; i++) {
  //   drawSlab(game, canvas.slabDivs[i]);
  // }
  drawDebug(game);
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
    winkle: (Math.PI / 2) * brick.farthings,
  };

  drawFieldToCanvas(canvas.context, wend, brickframe);
  drawRoadToCanvas(canvas.context, wend, brickframe, brick.brickname);
  drawBurghToCanvas(canvas.context, wend, brickframe, brick.brickname);
  drawShieldToCanvas(canvas.context, wend, brickframe, brick.brickname);

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

  if (game.state.isLeeching) {
    if (isInState(brick, "spin")) {
      drawDebugOrd(canvas, canvasToWorld(brick.choose.clickZ, canvas.eye), "wend");
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
  }
};
