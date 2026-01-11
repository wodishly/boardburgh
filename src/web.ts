/** Web is built upon `Edgename` rather than `Edgestaff`.
 * Is this a good idea? */

import {
  reckonEdgeBeforeSpin,
  type BoardId,
  type Brick,
  type Cold,
  type Shoalway,
} from "./brick/brickstate";
import { type Edgename } from "./brick/edge";
import type { Game } from "./game";
import type { Override } from "./help/type";
import { wayNext, type Wayname } from "./help/way";

/**
 * An edge is an edge.
 * A yoke is a set of linked edges of the given kind..
 * A web is a set of yokes, all of the same kind of edge.
 */

export type Allweb = { [N in Edgename as `${N}web`]: Web<N> };

type Web<E extends Edgename = Edgename> = {
  yokes: Yoke<E>[];
  kind: E;
};

type Yoke<E extends Edgename = Edgename, B extends boolean = boolean> = {
  isOpen: B;
  edges: Edge<E>[];
};

type Edge<E extends Edgename = Edgename> = {
  brickId: BoardId;
  shoalway: Shoalway;
  kind: E;
};

export const makeAllweb = (): Allweb => {
  return {
    burghweb: { yokes: [], kind: "burgh" },
    fieldweb: { yokes: [], kind: "field" },
    roadweb: { yokes: [], kind: "road" },
  };
};

const getWebByKind = <N extends Edgename>(game: Game, kind: N) => {
  switch (kind) {
    case "burgh":
      return game.state.allweb.burghweb as Override<Web<N>>;
    case "field":
      return game.state.allweb.fieldweb as Override<Web<N>>;
    case "road":
      return game.state.allweb.roadweb as Override<Web<N>>;
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

  handleInnerYoke(game, brick, "east", "north");
  handleInnerYoke(game, brick, "east", "west");
  handleInnerYoke(game, brick, "east", "south");
  handleInnerYoke(game, brick, "north", "west");
  handleInnerYoke(game, brick, "north", "south");
  handleInnerYoke(game, brick, "west", "south");

  console.log(
    game.state.allweb.burghweb.yokes.map((yoke) => yoke.edges),
    game.state.allweb.fieldweb.yokes.map((yoke) => yoke.edges),
    game.state.allweb.roadweb.yokes.map((yoke) => yoke.edges)
  );
};

const yokeYokes = <E extends Edgename>(
  web: Web<E>,
  first: Yoke<E>,
  other: Yoke<E>
) => {
  console.log("yoking yokes", first, other);
  const firstIndex = web.yokes.indexOf(first);
  const otherIndex = web.yokes.indexOf(other);
  if (firstIndex > otherIndex) {
    first.edges.push(...other.edges);
    web.yokes.splice(otherIndex, 1);
  } else if (firstIndex < otherIndex) {
    other.edges.push(...first.edges);
    web.yokes.splice(firstIndex, 1);
  } else {
    console.log("these are already the same yoke!");
  }
};

export const makeShoalway = <N extends Wayname>(name: N): Shoalway<N> => {
  return { name, kind: "world" };
};

const handleInnerYoke = <W extends Wayname, V extends Wayname>(
  game: Game,
  brick: Brick<Cold>,
  firstWayname: W,
  otherWayname: V
) => {
  const firstShoalway = makeShoalway(firstWayname);
  const otherShoalway = makeShoalway(otherWayname);
  const firstDeepway = reckonEdgeBeforeSpin(brick, firstShoalway);
  const otherDeepway = reckonEdgeBeforeSpin(brick, otherShoalway);
  console.log(
    `handling inner yoke for ${brick.boardId}.\n` +
      `  first shoalway ${firstShoalway.name} (deep ${firstDeepway.name}),\n` +
      `  other shoalway ${otherShoalway.name} (deep ${otherDeepway.name})`
  );
  const firstKind = brick.edges[firstDeepway.name];
  const otherKind = brick.edges[otherDeepway.name];
  if (firstKind === otherKind) {
    const firstYoke = findYokeByEdge(game, {
      brickId: brick.boardId,
      shoalway: firstShoalway,
      kind: firstKind,
    })!;
    const otherYoke = findYokeByEdge(game, {
      brickId: brick.boardId,
      shoalway: otherShoalway,
      kind: otherKind,
    })!;
    yokeYokes(getWebByKind(game, firstKind), firstYoke, otherYoke);
  } else {
    console.log("edgekinds", firstKind, otherKind, "don't match, skipping.");
  }
};

const handleOuterYoke = <W extends Wayname>(
  game: Game,
  brick: Brick<Cold>,
  wayname: W
) => {
  const shoalway = { name: wayname, kind: "world" as const };
  const deepway = reckonEdgeBeforeSpin(brick, shoalway);
  const kind = brick.edges[deepway.name];
  const neighbor = brick.neighbors[shoalway.name];
  console.log(
    `handling outer yoke for ${brick.boardId}.\n` +
      `  shoalway ${shoalway.name} (deep ${deepway.name})`
  );
  if (neighbor === undefined) {
    console.log(
      `making new yoke on canvas-${shoalway.name} (brick-${deepway.name}) edge of,`,
      brick.boardId
    );
    const web: Web<typeof kind> = fromEdgename(game, kind);
    const yoke: Yoke<typeof kind> = makeYoke(makeEdge(brick, shoalway));
    web.yokes.push(yoke);
  } else {
    const yoke = findYokeByEdge(game, {
      brickId: neighbor.boardId,
      shoalway: makeShoalway(wayNext(wayNext(shoalway.name))),
      kind,
    });
    if (!yoke) {
      console.error(yoke);
    } else {
      const edge = {
        brickId: brick.boardId,
        shoalway,
        kind,
      };
      yoke.edges.push(edge);
    }
  }
};

const findYokeByEdge = <N extends Edgename>(game: Game, edge: Edge<N>) => {
  console.log("looking for edge", edge);
  const { kind } = edge;
  const yoke = getWebByKind(game, kind).yokes.find(
    (yoke) => yoke.isOpen && isEdgeInYoke(yoke, edge)
  );
  if (yoke && yoke.isOpen) {
    console.log("found open yoke", yoke);
    return yoke;
  } else {
    console.log("no yoke found!");
    return undefined;
  }
};

const isEdgeInYoke = <N extends Edgename>(yoke: Yoke<N>, edge: Edge<N>) => {
  for (let i = 0; i < yoke.edges.length; i++) {
    console.log(yoke.edges[i], edge);
    if (
      yoke.edges[i].brickId === edge.brickId &&
      yoke.edges[i].shoalway.name === edge.shoalway.name &&
      yoke.edges[i].kind === edge.kind
    ) {
      return true;
    }
  }
  return false;
};

export const isShoalsideOpen = (brick: Brick, shoalway: Shoalway) => {
  return !brick.neighbors || brick.neighbors[shoalway.name] === undefined;
};

const makeYoke = <N extends Edgename>(edge: Edge<N>): Yoke<N> => {
  return {
    isOpen: true,
    edges: [edge],
  };
};

const makeEdge = (brick: Brick<Cold>, shoalway: Shoalway): Edge => {
  return {
    brickId: brick.boardId,
    shoalway,
    kind: brick.edges[reckonEdgeBeforeSpin(brick, shoalway).name],
  };
};
