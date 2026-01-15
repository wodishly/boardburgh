import { type Brickshape, isBrickshape } from "./brickshape";
import { mod, zFarth, zMinus, zTimes, type Z, type Zful } from "../help/reckon";
import {
  isObject,
  only,
  type Override,
  type Maybe,
  type Wayward,
} from "../help/type";
import {
  makeWayward,
  wayMinus,
  waynameOf,
  wayPlus,
  type Wayname,
} from "../help/way";
import { isMouseInBrick, doesWeave } from "../board";
import { getEye, type Game } from "../game";
import { worldToCanvas, canvasToWorld } from "../draw/brush";
import { Settings } from "../settings";
import type { Brickname } from "./brickname";
import type { GameState } from "../state";
import { isShiftDown } from "../key";
import {
  isPointerDown,
  isPointerMove,
  isPointerUp,
  type Mouse,
} from "../draw/handle";
import { updateAllweb } from "../web";

export type BoardId = number;

export type Brickstate = Hot | Cold;
export type Hot = OnDeck | OnBoard;
export type OnDeck = "fresh" | "hover1";
export type OnBoard = "live" | Chosen | "drop";
export type Chosen = "choose" | "drag" | "spin" | "hover2";
export type Cold = "nearby" | "frozen";

export type Waykind = "brick" | "world";
export type Brickway<
  K extends Waykind = Waykind,
  N extends Wayname = Wayname
> = {
  kind: K;
  name: N;
};
export type Shoalway<N extends Wayname = Wayname> = Brickway<"world", N>;
export type Deepway<N extends Wayname = Wayname> = Brickway<"brick", N>;

export type Brick<
  S extends Brickstate = Brickstate,
  N extends Brickname = Brickname
> = Brickshape<N> &
  Zful<"world"> & {
    boardId: BoardId;
    farthings: S extends "spin" ? number : 0 | 1 | 2 | 3;
    neighbors: Wayward<Maybe<Brick<Cold, Brickname>>>;
    isSnapped: S extends Cold ? true : S extends "fresh" ? false : boolean;
    state: S;
    choose: S extends Chosen ? BrickChoose : undefined;
  };

type NeighborBrick = Brick<Cold>;

type Winkle = number;

type BrickChoose = {
  brickZ: Z<"canvas">; // starting z
  brickW: Winkle; // starting winkle
  clickZ: Z<"canvas">; // z of mouse click
};

/**
 * @param deepedge the wayname of the edge to the world
 * @returns the wayname of the edge to the brick
 *
 * This has now been implemented, but it was an ordeal.
 * We leave this note here out of remembrance.
 *
 * Note that the winding way has to be flipped (using
 * `wayMinus` instead of `wayPlus`, since canvas goes
 * E->S->W->N but bricks go E->N->W->S. This should
 * one day be fixed by having bricks go E->S->W->N.
 */
export const reckonEdgeAfterSpin = (
  brick: Brick<Exclude<Brickstate, "spin">>,
  { name }: Deepway
): Shoalway => {
  return { name: wayPlus(name, waynameOf(brick.farthings)), kind: "world" };
};

export const reckonEdgeBeforeSpin = (
  brick: Brick<Exclude<Brickstate, "spin">>,
  { name }: Shoalway
): Deepway => {
  return { name: wayMinus(name, waynameOf(brick.farthings)), kind: "brick" };
};

export const isBrickState = (x: unknown): x is Brickstate => {
  return isObject(x) && "boardId" in x;
};

export const isBrick = (x: unknown): x is Brick => {
  return isObject(x) && isBrickshape(x) && isBrickState(x);
};

export const isInState = <S extends Brickstate>(
  brick: Brick,
  state: S
): brick is Brick<S> => {
  return brick.state === state;
};

export const isHot = (brick: Brick): brick is Brick<Hot> => {
  return (
    brick.state === "live" ||
    brick.state === "hover2" ||
    brick.state === "choose" ||
    brick.state === "drag" ||
    brick.state === "spin" ||
    brick.state === "drop"
  );
};

export const isCold = (brick: Brick): brick is Brick<Cold> => {
  return brick.state === "nearby" || brick.state === "frozen";
};

export const freeze = (
  game: Game,
  brick: Brick<Exclude<Brickstate, "spin">>
) => {
  brick.state = "frozen";
  brick.choose = undefined;
  brick.isSnapped = true;
  updateAllweb(game, brick as Override<Brick<Cold>>);
};

export const handleBrick = (game: Game, brick: Brick, now: number) => {
  const mouse = game.state.handle.mouse;

  if (brick.state === "drop" && isPointerUp(mouse)) {
    if (brick.isSnapped) {
      freeze(game, brick as Override<any>);
    } else {
      brick.state = "live";
    }
    unchooseBrick(game.state);
  } else if (brick.state === "drag" && isPointerDown(mouse)) {
    brick.state = "drop";
  } else if (brick.state === "spin" && isPointerUp(mouse)) {
    brick.state = "drop";
    brick.farthings = mod(Math.round(brick.farthings), 4);
  } else if (
    brick.state === "choose" &&
    zFarth(mouse.pointer.z, brick.choose!.clickZ) >= Settings.dragBecomesSpin
  ) {
    brick.state = "spin";
  } else if (brick.state === "choose" && isPointerUp(mouse)) {
    brick.state = "drag";
  } else if (
    (brick.state === "spin" && isPointerDown(mouse)) ||
    (brick.state === "spin" && isPointerMove(mouse))
  ) {
    handleSpin(game, mouse, brick as Override<Brick<"spin">>);
  } else if (brick.state === "drag") {
    handleDrag(game, mouse, brick as Override<Brick<"drag">>);
  } else if (
    isHot(brick) &&
    isMouseInBrick(game, brick) &&
    !game.state.handle.mouse.layer.includes("slab") &&
    (!game.state.chosen || game.state.chosen === brick)
  ) {
    if (brick.state === "hover2" && isPointerDown(mouse)) {
      brick.state = "choose";
      chooseBrick(game.state, brick);
      brick.choose = {
        brickZ: worldToCanvas(brick.z, getEye(game)),
        brickW: (brick.farthings * Math.PI) / 2,
        clickZ: mouse.pointer.z,
      };
    } else if (brick.state === "live") {
      brick.state = "hover2";
      chooseBrick(game.state, brick);
    } else if (brick.state === "hover2") {
      chooseBrick(game.state, brick);
    } else {
      console.log(
        "fallthrough for",
        brick.state,
        mouse.pointer.move,
        mouse.pointer.knob
      );
    }
  } else {
    if (brick.state === "hover2") {
      brick.state = "live";
      unchooseBrick(game.state);
    }
    brick.state = isHot(brick) ? "live" : "frozen";
    brick.neighbors = makeWayward(() => undefined);
  }
};

const chooseBrick = (gameState: GameState, brick: Brick) => {
  if (gameState.chosen) {
    return;
  } else {
    Object.assign(gameState, { chosen: popById(gameState, brick.boardId) });
  }
};

const unchooseBrick = (gameState: GameState) => {
  if (!gameState.chosen || !isBrick(gameState.chosen)) {
    console.log(gameState.chosen);
    throw new Error("bad unchoose");
  }
  gameState.boardlist.push(gameState.chosen);
  Object.assign(gameState, { chosen: undefined });
};

const popById = (gameState: GameState, id: BoardId) => {
  return only(
    gameState.boardlist.splice(
      gameState.boardlist.findIndex((thing) => thing.boardId === id),
      1
    )
  );
};

const handleSpin = <P extends "pointerdown" | "pointermove">(
  game: Game,
  mouse: Mouse<P>,
  brick: Brick<Chosen>
) => {
  const canvasBrick = worldToCanvas(brick.z, getEye(game));
  const winkle = Math.atan2(
    mouse.pointer.z.y - canvasBrick.y,
    mouse.pointer.z.x - canvasBrick.x
  );
  const winkle2 = Math.atan2(
    brick.choose.clickZ.y - canvasBrick.y,
    brick.choose.clickZ.x - canvasBrick.x
  );
  const d = winkle - winkle2;
  brick.farthings = (brick.choose.brickW + d) / (Math.PI / 2);
  if (!isShiftDown(game.state.handle.eater)) {
    if (
      Math.abs(brick.farthings - Math.round(brick.farthings)) <
      Settings.neighborThreshold
    ) {
      brick.farthings = Math.round(brick.farthings);
    }
  }
};

const handleDrag = (
  game: Game,
  mouse: Mouse,
  brick: Brick<Exclude<Chosen, "spin">>
) => {
  const eye = getEye(game);
  brick.z = canvasToWorld(
    {
      x: mouse.pointer.z.x - brick.choose.clickZ.x + brick.choose.brickZ.x,
      y: mouse.pointer.z.y - brick.choose.clickZ.y + brick.choose.brickZ.y,
      kind: "canvas",
    },
    eye
  );
  if (!isShiftDown(game.state.handle.eater)) {
    handleDrap(game, brick);
  }
};

const handleDrap = (game: Game, brick: Brick<Exclude<Chosen, "spin">>) => {
  const boardlist = game.state.boardlist;
  const neighbors: Wayward<Maybe<NeighborBrick>> = makeWayward(() => undefined);

  brick.isSnapped = false;

  for (const other of boardlist) {
    const dz = zTimes(zMinus(brick.z, other.z), 1 / Settings.brickLength);
    if (
      isCold(other) &&
      ((1 - Settings.neighborThreshold < Math.abs(dz.x) &&
        Math.abs(dz.x) < 1 + Settings.neighborThreshold &&
        Math.abs(dz.y) < Settings.neighborThreshold) ||
        (1 - Settings.neighborThreshold < Math.abs(dz.y) &&
          Math.abs(dz.y) < 1 + Settings.neighborThreshold &&
          Math.abs(dz.x) < Settings.neighborThreshold))
    ) {
      other.state = "nearby";
      neighbors[wayTo(other, brick)] = other;
      if (
        neighbors.east &&
        neighbors.north &&
        neighbors.west &&
        neighbors.south
      )
        break;
    }
  }
  let someNeighbor = false;
  let allDoWeave = true;
  for (const neighbor of Object.values(neighbors)) {
    someNeighbor ||= !!neighbor;
    allDoWeave &&= !neighbor || doesWeave(brick, neighbor);
  }

  if (someNeighbor && allDoWeave) {
    brick.isSnapped = true;
    if (neighbors.east) {
      brick.z = {
        x: neighbors.east.z.x - Settings.brickLength,
        y: neighbors.east.z.y,
        kind: "world",
      };
    } else if (neighbors.north) {
      brick.z = {
        x: neighbors.north.z.x,
        y: neighbors.north.z.y + Settings.brickLength,
        kind: "world",
      };
    } else if (neighbors.west) {
      brick.z = {
        x: neighbors.west.z.x + Settings.brickLength,
        y: neighbors.west.z.y,
        kind: "world",
      };
    } else if (neighbors.south) {
      brick.z = {
        x: neighbors.south.z.x,
        y: neighbors.south.z.y - Settings.brickLength,
        kind: "world",
      };
    } else {
      throw new Error("bad neighbor");
    }
  }
  brick.neighbors = neighbors;
  if (neighbors.east) {
    neighbors.east.neighbors.west = brick as Override<any>;
  }
  if (neighbors.south) {
    neighbors.south.neighbors.north = brick as Override<any>;
  }
  if (neighbors.west) {
    neighbors.west.neighbors.east = brick as Override<any>;
  }
  if (neighbors.north) {
    neighbors.north.neighbors.south = brick as Override<any>;
  }
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
