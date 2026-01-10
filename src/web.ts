/** Web is built upon `Edgename` rather than `Edgestaff`.
 * Is this a good idea? */

import {
  reckonEdgeBeforeSpin,
  type BoardId,
  type Brick,
  type Cold,
} from "./brick/brickstate";
import { type Edgename } from "./brick/edge";
import type { Game } from "./game";
import type { Maybe, Override } from "./help/type";
import { wayNext, type Wayname } from "./help/way";

export type Allweb = { [N in Edgename as `${N}web`]: Web<N> };

type Web<E extends Edgename = Edgename> = {
  yokes: Yoke<E>[];
  kind: E;
};

type Yoke<
  E extends Edgename = Edgename,
  Head extends Maybe<Edge<E>> = Maybe<Edge<E>>
> = [Head, ...Edge<E>[]];
type OpenYoke<E extends Edgename = Edgename> = Yoke<E, undefined>;
type ClosedYoke<E extends Edgename = Edgename> = Yoke<E, Edge<E>>;

const isOpenYoke = <E extends Edgename>(x: Yoke<E>): x is OpenYoke<E> => {
  return x[0] === undefined;
};

type Edge<E extends Edgename = Edgename> = {
  brickId: BoardId;
  deepway: Wayname;
  kind: E;
};

export const makeAllweb = (): Allweb => {
  return {
    burghweb: { yokes: [], kind: "burgh" },
    fieldweb: { yokes: [], kind: "field" },
    roadweb: { yokes: [], kind: "road" },
  };
};

const getWebByKind = (game: Game, kind: Edgename) => {
  switch (kind) {
    case "burgh":
      return game.state.allweb.burghweb;
    case "field":
      return game.state.allweb.fieldweb;
    case "road":
      return game.state.allweb.roadweb;
  }
  kind satisfies never;
};

export const fromEdgename = <E extends Edgename>(game: Game, edgename: E) => {
  return game.state.allweb[`${edgename}web`];
};

export const updateAllweb = (game: Game, brick: Brick<Cold>) => {
  console.log("updating allweb…");

  handleOuterYoke(game, brick, "east");
  handleOuterYoke(game, brick, "north");
  handleOuterYoke(game, brick, "west");
  handleOuterYoke(game, brick, "south");

  // handleInnerYoke(game, brick, "east", "north");
  // handleInnerYoke(game, brick, "east", "west");
  // handleInnerYoke(game, brick, "east", "south");
  // handleInnerYoke(game, brick, "north", "west");
  // handleInnerYoke(game, brick, "north", "south");
  // handleInnerYoke(game, brick, "west", "south");

  console.log(game.state.allweb);
};

const handleInnerYoke = <W extends Wayname, V extends Wayname>(
  game: Game,
  brick: Brick<Cold>,
  firstWayname: W,
  otherWayname: V
) => {
  if (brick.edges[firstWayname] === brick.edges[otherWayname]) {
    console.log(firstWayname, otherWayname);
    const firstYoke = findYokeByEdge(game, makeEdge(brick, firstWayname))!;
    const otherYoke = findYokeByEdge(game, makeEdge(brick, otherWayname))!;
    console.log("yoking", firstYoke, "with", otherYoke);
    firstYoke.push(...otherYoke.slice(1));
    console.log(firstYoke, otherYoke);
    const web = fromEdgename(game, brick.edges[otherWayname]);
    web.yokes.splice(
      web.yokes.findIndex((yoke) => yoke === otherYoke),
      1
    );
  }
};

const handleOuterYoke = <W extends Wayname>(
  game: Game,
  brick: Brick<Cold>,
  wayname: W
) => {
  const brickway = reckonEdgeBeforeSpin(brick, wayname);
  if (brick.neighbors[wayname] === undefined) {
    console.log(`making new yoke on canvas-${wayname} edge of,`, brick.boardId);
    const edgename = brick.edges[brickway];
    const web: Web<typeof edgename> = fromEdgename(game, edgename);
    const yoke: OpenYoke<typeof edgename> = makeYoke(makeEdge(brick, brickway));
    web.yokes.push(yoke);
  } else {
    const neighbor = brick.neighbors[wayname];
    const kind = neighbor.edges[brickway];
    console.log(`canvas-${wayname} neighbor is`, neighbor.boardId, kind);

    const yoke = findYokeByEdge(
      game,
      makeEdge(
        neighbor,
        reckonEdgeBeforeSpin(neighbor, wayNext(wayNext(wayname)))
      )
    );
    if (!yoke) {
      console.error(yoke);
    } else {
      const edge: Edge = {
        brickId: brick.boardId,
        deepway: brickway,
        kind,
      };
      yoke.push(edge);
    }
  }
};

const findYokeByEdge = <E extends Edgename>(game: Game, edge: Edge<E>) => {
  const { kind } = edge;
  const yoke = getWebByKind(game, kind).yokes.find(
    (yoke) => isOpenYoke(yoke) && yoke.includes(edge)
  );
  if (yoke && isOpenYoke(yoke)) {
    return yoke;
  } else {
    return undefined;
  }
};

const makeYoke = <N extends Edgename>(edge: Edge<N>): OpenYoke<N> => {
  return [undefined, edge];
};

const makeEdge = (brick: Brick, wayname: Wayname): Edge => {
  return {
    brickId: brick.boardId,
    deepway: wayname,
    kind: brick.edges[wayname],
  };
};
