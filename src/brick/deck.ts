import { nextId } from "../state";
import { Brickbook } from "./brickbook";
import { shuffle } from "../help/reckon";
import { type Override, type Maybe } from "../help/type";
import type { GameState } from "../state";
import { type Brickname, hasShield } from "./brickname";
import { type Brickshape, edges } from "./brickshape";

export type Deck = {
  bricklist: Brickshape[];
  tally: Maybe<Tally>;
};

export type Tally = Partial<{ [K in Brickname]: number }>;

export const makeDeck = (): Deck => {
  return { bricklist: loadFrom(Brickbook), tally: undefined };
};

export const loadFrom = (
  brickbook: Tally,
  start: Brickname = "crfr"
): Brickshape[] => {
  const bricklist: Brickshape[] = [];
  const shuffledNames: Brickname[] = shuffle(
    Object.entries(brickbook)
      .map(([key, value]) => Array(value).fill(key))
      .flat()
  );
  const startFinger = shuffledNames.indexOf(start);
  if (startFinger > -1) {
    shuffledNames.splice(startFinger, 1);
    shuffledNames.unshift(start);
  }
  for (const brickname of shuffledNames) {
    bricklist.push(makeBrickshape(brickname));
  }
  return bricklist;
};

export const runTally = (gameState: GameState): Tally => {
  const tally = Object.fromEntries(
    Object.entries(Brickbook).map(([k, _]) => [k, 0])
  );
  for (const brick of gameState.deck.bricklist) {
    tally[brick.brickname] += 1;
  }
  gameState.deck.tally = tally;
  return tally;
};

export const dealBrick = (gameState: GameState, _now: number) => {
  const brickshape = gameState.deck.bricklist.shift();
  if (!brickshape) {
    throw new Error("bad deal");
  }
  const brick = Object.assign(brickshape, {
    boardId: nextId(gameState),
    z: { x: 600, y: 200, kind: "world" as const },
    isSnapped: false,
    neighbors: undefined,
    farthings: Math.floor(4 * Math.random()),
    state: "live" as const,
    choose: undefined,
  });
  gameState.boardlist.push(brick);
  return brick;
};

export const makeBrickshape = <N extends Brickname>(brickname: N) => {
  return {
    brickname,
    edges: edges<N>(brickname),
    hasShield: hasShield(brickname),
  } as Override<Brickshape<N>>;
};
