import { type Brickshape, isBrickshape } from "./brickshape";
import { mod, zMinus, zTimes, type Z, type Zful } from "../help/reckon";
import {
  isObject,
  only,
  type Override,
  type Maybe,
  type Wayward,
} from "../help/type";
import { type Wayname } from "../help/way";
import { isMouseInBrick, doesWeave } from "../board";
import { getEye, getMouse, type Game } from "../game";
import { worldToCanvas, canvasToWorld } from "../draw/brush";
import { Settings } from "../settings";
import type { Brickname } from "./brickname";
import { isChosen } from "../state";

export type BoardId = number;

export type Brickstate = Hot | Cold;
export type Hot = OnDeck | OnBoard;
export type OnDeck = "fresh" | "hover1";
export type OnBoard = "live" | "hover2" | Chosen | "drop";
export type Chosen = "choose" | "drag" | "spin";
export type Cold = "nearby" | "frozen";

export type Brick<
  N extends Brickname = Brickname,
  S extends Brickstate = Brickstate
> = Brickshape<N> &
  Zful<"world"> & {
    boardId: BoardId;
    farthings: S extends "spin" ? number : 0 | 1 | 2 | 3;
    neighbors: S extends Cold
      ? Wayward<Maybe<Brick<Brickname, Brickstate>>>
      : S extends OnBoard
      ? Maybe<Wayward<Maybe<Brick<Brickname, Brickstate>>>>
      : undefined;
    isSnapped: S extends Cold ? true : S extends "fresh" ? false : boolean;
    state: S;
    choose: S extends Chosen ? BrickChoose : undefined;
  };

export type Winkle = number;

type BrickChoose = {
  brickZ: Z<"canvas">;
  brickW: Winkle;
  clickZ: Z<"canvas">;
};

export const isInState = <S extends Brickstate>(
  brick: Brick,
  state: S
): brick is Brick<Brickname, S> => {
  return brick.state === state;
};

export const isHot = (brick: Brick): brick is Brick<Brickname, Hot> => {
  return (
    brick.state === "live" ||
    brick.state === "hover2" ||
    brick.state === "choose" ||
    brick.state === "drag" ||
    brick.state === "spin" ||
    brick.state === "drop"
  );
};

export const isCold = <N extends Brickname>(
  brick: Brick<N, Brickstate>
): brick is Brick<N, Cold> => {
  return brick.state === "nearby" || brick.state === "frozen";
};

export const isBrick = (x: unknown): x is Brick => {
  return isObject(x) && isBrickshape(x) && isBrickState(x);
};

export const isBrickState = (x: unknown): x is Brickstate => {
  return isObject(x) && "boardId" in x;
};

export const makeWayward = <T>(f: (n: number) => T): Wayward<T> => {
  return {
    east: f(0),
    north: f(1),
    west: f(2),
    south: f(3),
  };
};

export const freeze = (brick: Brick) => {
  brick.state = "frozen";
  brick.choose = undefined;
  brick.isSnapped = true;
};

// todo: scale with screen
export const handleBrick = (game: Game, brick: Brick) => {
  const mouse = game.state.handle.mouse;
  if (isChosen(game, brick)) {
    console.log(brick.state, mouse.state);
  }

  if (brick.state === "drop" && mouse.state === "mouseup") {
    brick.choose = undefined;
    // todo: this check shouldnt be needed, we should already know from state
    if (game.state.chosen) {
      game.state.boardlist.push(game.state.chosen);
      game.state.chosen = undefined;
    }
    brick.state = brick.isSnapped ? "frozen" : "hover2";
  } else if (brick.state === "drag" && mouse.state === "mousedown") {
    brick.state = "drop";
  } else if (brick.state === "spin" && mouse.state === "mouseup") {
    brick.state = "drop";
    brick.farthings = mod(Math.round(brick.farthings / (Math.PI / 2)), 4);
  } else if (brick.state === "choose" && mouse.state === "mousemove") {
    brick.state = "spin";
  } else if (brick.state === "choose" && mouse.state === "mouseup") {
    brick.state = "drag";
  } else if (
    (brick.state === "spin" && mouse.state === "mousedown") ||
    (brick.state === "spin" && mouse.state === "mousemove")
  ) {
    handleSpin(game, brick as Override<Brick<Brickname, "spin">>);
  } else if (
    (brick.state === "drag" && mouse.state === "mouseup") ||
    (brick.state === "drag" && mouse.state === "mousemove")
  ) {
    handleDrag(game, brick as Override<Brick<Brickname, "drag">>);
  } else if (isMouseInBrick(game, brick)) {
    if (brick.state === "hover2" && mouse.state === "mousedown") {
      if (!game.state.chosen) {
        brick.state = "choose";
        brick.choose = {
          brickZ: worldToCanvas(brick.z, getEye(game)),
          brickW: (brick.farthings * Math.PI) / 2,
          clickZ: mouse.z,
        };
        game.state.chosen = popById(game, brick.boardId);
      }
    } else if (
      (brick.state === "live" && mouse.state === "mousemove") ||
      (brick.state === "hover2" && mouse.state === "mousemove")
    ) {
      brick.state = "hover2";
    }
  } else if (brick.state === "choose") {
  } else {
    brick.state = isHot(brick) ? "live" : "frozen";
  }
};

const popById = (game: Game, id: BoardId) => {
  return only(
    game.state.boardlist.splice(
      game.state.boardlist.findIndex((thing) => thing.boardId === id),
      1
    )
  );
};

const handleSpin = (game: Game, brick: Brick<Brickname, Chosen>) => {
  const mouse = getMouse(game);
  const canvasBrick = worldToCanvas(brick.z, getEye(game));
  const winkle = Math.atan2(
    mouse.z.y - canvasBrick.y,
    mouse.z.x - canvasBrick.x
  );
  const winkle2 = Math.atan2(
    brick.choose.clickZ.y - canvasBrick.y,
    brick.choose.clickZ.x - canvasBrick.x
  );
  const d = winkle - winkle2;
  brick.farthings = (brick.choose.brickW + d) / (Math.PI / 2);
};

const handleDrag = (game: Game, brick: Brick<Brickname, Chosen>) => {
  const mouse = game.state.handle.mouse;
  const boardlist = game.state.boardlist;
  if (!brick.choose) return;
  const dragStartWorldZ = canvasToWorld(brick.choose.brickZ, getEye(game));
  brick.z = {
    x: mouse.z.x - brick.choose.clickZ.x + dragStartWorldZ.x,
    // todo: understand why these deleting two lines fixes panning whilst dragging
    // game.div.boardframeDiv.boardCanvas.eye.pan.x +
    // brick.drag.panOffset.x,
    y: mouse.z.y - brick.choose.clickZ.y + dragStartWorldZ.y,
    // game.div.boardframeDiv.boardCanvas.eye.pan.y +
    // brick.drag.panOffset.y,
    kind: "world",
  };
  brick.isSnapped = false;
  const neighbors: Wayward<Maybe<Brick>> = makeWayward(() => undefined);
  for (const other of boardlist) {
    const dz = zTimes(zMinus(brick.z, other.z), 1 / Settings.brickLength);
    if (
      isCold(other) &&
      ((7 / 8 <= Math.abs(dz.x) &&
        Math.abs(dz.x) < 9 / 8 &&
        Math.abs(dz.y) < 1 / 4) ||
        (7 / 8 <= Math.abs(dz.y) &&
          Math.abs(dz.y) < 9 / 8 &&
          Math.abs(dz.x) < 1 / 4))
    ) {
      other.state = "nearby";
      neighbors[wayTo(brick, other)] = other;
      // console.log(brick, `is ${wayTo(brick, other)} of`, other);
      // console.log(
      //   `brick is spun ${brick.farthings} times`,
      //   `other is spun ${other.farthings} times`
      // );
      // if (isWaytell(brick.farthings)) {
      //   console.log(
      //     `brick's ${wayPlus(wayTo(other, brick), waynameOf(brick.farthings))}`,
      //     `is touching`,
      //     `other's ${wayPlus(wayTo(brick, other), waynameOf(other.farthings))}`
      //   );
      //   console.log(
      //     brick.edges[wayPlus(wayTo(other, brick), waynameOf(brick.farthings))],
      //     `is touching`,
      //     other.edges[wayPlus(wayTo(brick, other), waynameOf(other.farthings))]
      //   );
      // }
      if (
        neighbors.east &&
        neighbors.north &&
        neighbors.west &&
        neighbors.south
      )
        break;
    }
  }

  if (
    Object.values(neighbors).some((neighbor) => neighbor) &&
    Object.values(neighbors).every(
      (neighbor) => !neighbor || doesWeave(brick, neighbor)
    )
  ) {
    brick.isSnapped = true;
    if (neighbors.east) {
      brick.z = {
        x: neighbors.east.z.x + Settings.brickLength,
        y: neighbors.east.z.y,
        kind: "world",
      };
    } else if (neighbors.north) {
      brick.z = {
        x: neighbors.north.z.x,
        y: neighbors.north.z.y - Settings.brickLength,
        kind: "world",
      };
    } else if (neighbors.west) {
      brick.z = {
        x: neighbors.west.z.x - Settings.brickLength,
        y: neighbors.west.z.y,
        kind: "world",
      };
    } else if (neighbors.south) {
      brick.z = {
        x: neighbors.south.z.x,
        y: neighbors.south.z.y + Settings.brickLength,
        kind: "world",
      };
    } else {
      throw new Error("bad neighbor");
    }
  }
  brick.neighbors = neighbors;
};
/**
 * `wayTo(x, y) = z` iff `x` is `z` of `y`.
 */
export const wayTo = (brick: Brick, other: Brick): Wayname => {
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
