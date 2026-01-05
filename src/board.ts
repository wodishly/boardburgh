import { handleBrick, isBrick, wayTo, type Brick } from "./brick/brickstate";
import {
  type ElementWithId,
  type HTMLMake,
  makeWithId,
} from "./draw/html/type";
import { Brushwit, Settings } from "./settings";
import { makeEye, resize, type Eye } from "./draw/eye";
import {
  toEdgeZ,
  toFarthing,
  toNookZ,
  Waybook,
  waynameOf,
  wayNext,
  wayPlus,
  type Waytell,
} from "./brick/way";
import { getCanvas, type Game } from "./game";
import {
  wipe,
  withBorrowedContext,
  withBorrowedContextForText,
} from "./draw/canvas";
import { drawDebug } from "./draw/html/game-div";
import { withCommas, withSpaces, z } from "./help/reckon";
import { canvasToWorld, worldToCanvas, edgebrushOf } from "./draw/brush";
import { toRectangle } from "./draw/shape";
import { ly, sameshift, type Maybe, type Override } from "./help/type";
import { isChosen } from "./state";
import {
  hasChurch,
  hasCurvedRoad,
  hasRoad,
  hasShield,
  hasTown,
} from "./brick/brickname";
import {
  reckonChurch,
  reckonShield,
  reckonStraightRoad,
  reckonTown,
} from "./draw/reckon-brickshape";
import { edgetellsOf } from "./brick/edge";
import { makeSVGElement, toSvgBrush } from "./draw/svg";
import { flight } from "./help/rime";

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
  const nooks = {
    navel: brick.z,
    greatness: z(Settings.brickLength, Settings.brickLength, "world"),
  };

  const brickframe = toRectangle({
    navel: worldToCanvas(nooks.navel, canvas.eye),
    greatness: worldToCanvas(nooks.greatness, canvas.eye, false),
  });

  const wend = {
    navel: z(
      brickframe.x + brickframe.width / 2,
      brickframe.y + brickframe.height / 2,
      "canvas"
    ),
    winkle: toFarthing(brick.head, "canvas") + (brick.choose?.spin ?? 0),
  };

  withBorrowedContext(
    canvas.context,
    { brush: Brushwit.field, wend },
    (context) => {
      context.rect(
        -brickframe.width / 2,
        -brickframe.height / 2,
        brickframe.width,
        brickframe.height
      );
    }
  );

  if (hasRoad(brick.brickname)) {
    if (hasCurvedRoad(brick.brickname)) {
    } else {
      const nooks = reckonStraightRoad(brick.brickname, {
        ...brickframe,
        x: -brickframe.width / 2,
        y: -brickframe.height / 2,
      });
      withBorrowedContext(
        canvas.context,
        { brush: Brushwit.road, wend },
        (context) => {
          context.moveTo(nooks[0].x, nooks[0].y);
          for (let i = 1; i < nooks.length; i++) {
            context.lineTo(nooks[i].x, nooks[i].y);
          }
        }
      );
    }
    if (hasTown(brick.brickname)) {
      const town = reckonTown(brick.brickname, {
        ...brickframe,
        x: -brickframe.width / 2,
        y: -brickframe.height / 2,
      });
      withBorrowedContext(
        canvas.context,
        { brush: Brushwit.town, wend },
        (context) => {
          context.arc(
            town.navel.x,
            town.navel.y,
            town.halfwidth,
            0,
            2 * Math.PI
          );
        }
      );
    }
  }
  const edgetells = edgetellsOf(brick.brickname, "c");
  switch (edgetells.length) {
    case 4:
      withBorrowedContext(
        canvas.context,
        { brush: Brushwit.city, wend },
        (context) => {
          context.rect(
            -brickframe.width / 2,
            -brickframe.height / 2,
            brickframe.width,
            brickframe.height
          );
        }
      );
      break;
    case 3:
      withBorrowedContext(
        canvas.context,
        { brush: Brushwit.city, wend },
        (context) => {
          const startNook = toNookZ(waynameOf(0));
          context.moveTo(
            (startNook.x * brickframe.width) / 2,
            (startNook.y * brickframe.height) / 2
          );
          for (let i = 0; i < 4; i++) {
            if (
              edgetells[0] === i ||
              edgetells[1] === i ||
              edgetells[2] === i
            ) {
              const thisNook = toNookZ(waynameOf(i));
              context.lineTo(
                (thisNook.x * brickframe.width) / 2,
                (thisNook.y * brickframe.height) / 2
              );
              const nextNook = toNookZ(wayNext(waynameOf(i)));
              context.lineTo(
                (nextNook.x * brickframe.width) / 2,
                (nextNook.y * brickframe.height) / 2
              );
            } else {
              const edgeZ = toEdgeZ(waynameOf(i as Override<Waytell>));
              const navel = {
                x: edgeZ.x * brickframe.width,
                y: edgeZ.y * brickframe.height,
                kind: "canvas",
              };
              context.arc(
                navel.x,
                navel.y,
                (brickframe.width + brickframe.height) / 2 / Math.sqrt(2),
                -Math.PI / 4 +
                  toFarthing(wayNext(waynameOf(edgetells[i])), "canvas"),
                -Math.PI / 4 + toFarthing(waynameOf(edgetells[i]), "canvas")
              );
            }
          }
        }
      );
      break;
    case 2:
      if ((edgetells[1] - edgetells[0]) % 2 === 0) {
        withBorrowedContext(
          canvas.context,
          { brush: Brushwit.city, wend },
          (context) => {
            const startNook = toNookZ(waynameOf(0));
            context.moveTo(
              (startNook.x * brickframe.width) / 2,
              (startNook.y * brickframe.height) / 2
            );
            // todo: north–south case
            if (edgetells[0] === 0) {
              const nooks = [
                toNookZ(waynameOf(0)),
                toNookZ(waynameOf(1)),
                toNookZ(waynameOf(2)),
              ] as const;
              const edges = [
                toEdgeZ(waynameOf(1)),
                toEdgeZ(waynameOf(3)),
              ] as const;
              context.moveTo(
                (nooks[0].x * brickframe.width) / 2,
                (nooks[0].y * brickframe.height) / 2
              );
              context.lineTo(
                (nooks[1].x * brickframe.width) / 2,
                (nooks[1].y * brickframe.height) / 2
              );
              context.arc(
                edges[0].x * brickframe.width,
                edges[0].y * brickframe.height,
                (brickframe.width + brickframe.height) / 2 / Math.sqrt(2),
                Math.PI / 4,
                (Math.PI * 3) / 4
              );
              context.lineTo(
                (nooks[2].x * brickframe.width) / 2,
                (nooks[2].y * brickframe.height) / 2
              );
              context.arc(
                edges[1].x * brickframe.width,
                edges[1].y * brickframe.height,
                (brickframe.width + brickframe.height) / 2 / Math.sqrt(2),
                (Math.PI * 5) / 4,
                (Math.PI * 7) / 4
              );
            }
          }
        );
      } else {
        withBorrowedContext(
          canvas.context,
          { brush: Brushwit.city, wend },
          (context) => {
            const nooks = [
              toNookZ(waynameOf(edgetells[0])),
              toNookZ(waynameOf(edgetells[1])),
              toNookZ(wayNext(waynameOf(edgetells[1]))),
            ];
            context.moveTo(
              (nooks[0].x * brickframe.width) / 2,
              (nooks[0].y * brickframe.height) / 2
            );
            context.lineTo(
              (nooks[1].x * brickframe.width) / 2,
              (nooks[1].y * brickframe.height) / 2
            );
            context.lineTo(
              (nooks[2].x * brickframe.width) / 2,
              (nooks[2].y * brickframe.height) / 2
            );
          }
        );
      }
      break;
    case 1:
      const edgeZ = toEdgeZ(Waybook[edgetells[0]]);
      const navel = {
        x: edgeZ.x * brickframe.width,
        y: edgeZ.y * brickframe.height,
        kind: "canvas",
      };
      withBorrowedContext(
        canvas.context,
        { brush: Brushwit.city, wend },
        (context) => {
          context.arc(
            navel.x,
            navel.y,
            (brickframe.width + brickframe.height) / 2 / Math.sqrt(2),
            -Math.PI / 4 +
              toFarthing(wayNext(waynameOf(edgetells[0])), "canvas"),
            -Math.PI / 4 + toFarthing(waynameOf(edgetells[0]), "canvas")
          );
        }
      );
      break;
    case 0:
      if (hasChurch(brick.brickname)) {
        const church = reckonChurch(brick.brickname, {
          ...brickframe,
          x: -brickframe.width / 2,
          y: -brickframe.height / 2,
        });
        withBorrowedContext(
          canvas.context,
          { brush: Brushwit.church, wend },
          (context) => {
            context.arc(
              church.navel.x,
              church.navel.y,
              church.halfwidth,
              0,
              2 * Math.PI
            );
          }
        );
      }
      break;
  }

  if (hasShield(brick.brickname)) {
    const shield = reckonShield(brick.brickname, {
      ...brickframe,
      x: -brickframe.width / 2,
      y: -brickframe.height / 2,
    });
    withBorrowedContext(
      canvas.context,
      { brush: Brushwit.shield, wend },
      (context) => {
        context.rect(shield.x, shield.y, shield.width, shield.height);
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
  withBorrowedContextForText(
    canvas.context,
    {
      brush: {
        fontSize: 15,
        fillColor: isChosen(game, brick) ? "white" : "black",
      },
      wend,
    },
    "head",
    worldToCanvas(
      {
        x: brick.z.x + (Settings.brickLength / 3) * toEdgeZ(brick.head).x,
        y: brick.z.y + (Settings.brickLength / 3) * toEdgeZ(brick.head).y,
        kind: "world",
      },
      canvas.eye
    )
  );
};
