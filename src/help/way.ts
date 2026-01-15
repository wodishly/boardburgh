import { mod } from "./reckon";
import { type Modulo, type Next, type Plus } from "./rime";
import { type Thaw, type Override, type Wayward } from "./type";

export const Waybook = ["east", "south", "west", "north"] as const;

export type Wayname = (typeof Waybook)[number];
export type WaynameOf<T extends Waytell> = (typeof Waybook)[T];

export type Waytell = WaytellOf<Wayname>;
export type WaytellOf<N extends Wayname> = _WaytellOf<
  N,
  0,
  Thaw<typeof Waybook>
>;

// W needs to be wrapped in `Thaw`
type _WaytellOf<
  N extends Wayname,
  T extends number,
  W extends any[]
> = W extends []
  ? never
  : N extends W[0]
  ? T
  : W extends [infer _, ...infer R]
  ? _WaytellOf<N, Next<T>, R>
  : never;

export const waytellOf = <N extends Wayname>(name: N) => {
  return Waybook.indexOf(name) as Override<WaytellOf<N>>;
};

export const isWaytell = (x: unknown): x is Waytell => {
  return x === 0 || x === 1 || x === 2 || x === 3;
};

export const waynameOf = <T extends Waytell>(tell: T): (typeof Waybook)[T] => {
  return Waybook[tell];
};

export const wayNext = <N extends Wayname>(way: N) => {
  return wayPlus(way, Waybook[1]);
};

export const wayBefore = <N extends Wayname>(way: N) => {
  return wayMinus(way, Waybook[1]);
};

export const wayMinus = <N extends Wayname, M extends Wayname>(
  first: N,
  other: M
) => {
  return wayPlus(wayPlus(wayPlus(first, other), other), other);
};

export const wayPlus = <N extends Wayname, M extends Wayname>(
  first: N,
  other: M
) => {
  return Waybook[
    mod(Waybook.indexOf(first) + Waybook.indexOf(other), Waybook.length)
  ] as Override<
    WaynameOf<
      Modulo<
        Plus<WaytellOf<N>, WaytellOf<M>>,
        (typeof Waybook)["length"]
      > extends Waytell
        ? Modulo<Plus<WaytellOf<N>, WaytellOf<M>>, (typeof Waybook)["length"]>
        : never
    >
  >;
};

export type NookZ<N extends Wayname> = (typeof NookZBook)[N];

export type EdgeZ<N extends Wayname> = (typeof EdgeZBook)[N];

const EdgeZBook = {
  east: { x: 1, y: 0, kind: "svg" },
  south: { x: 0, y: 1, kind: "svg" },
  west: { x: -1, y: 0, kind: "svg" },
  north: { x: 0, y: -1, kind: "svg" },
} as const;

const NookZBook = {
  east: { x: 1, y: -1, kind: "svg" },
  south: { x: 1, y: 1, kind: "svg" },
  west: { x: -1, y: 1, kind: "svg" },
  north: { x: -1, y: -1, kind: "svg" },
} as const;

/**
 * @returns the starting corner of the way, meted sunwise (ESWN).
 * north is negative
 */

export const toNookZ = <N extends Wayname>(way: N): NookZ<N> => {
  return NookZBook[way];
};

/**
 * @returns the edge of the way.
 * north is negative
 */
export const toEdgeZ = <N extends Wayname>(way: N): EdgeZ<N> => {
  return EdgeZBook[way];
};

// todo: fold this with other canvas sunwiseness sheanigans
export const toCanvasFarthing = (way: Wayname) => {
  return (waytellOf(way) * Math.PI) / 2;
};

// unused
// const fromFarthing = (winkle: number): Waytell => {
//   const tell = winkle / (Math.PI / 2);
//   if (tell === 0 || tell === 1 || tell === 2 || tell === 3) {
//     return tell;
//   } else throw new Error(`bad tell ${tell}`);
// };

export const makeWayward = <T>(f: (n: number) => T): Wayward<T> => {
  return {
    east: f(0),
    south: f(1),
    west: f(2),
    north: f(3),
  };
};
