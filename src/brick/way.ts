import { mod, type ZKind } from "../help/reckon";
import { type Modulo, type Next, type Plus } from "../help/rime";
import { type Thaw, type Override } from "../help/type";

export const Waybook = ["east", "north", "west", "south"] as const;

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

export const waynameOf = <T extends Waytell>(tell: T): (typeof Waybook)[T] => {
  return Waybook[tell];
};

export const wayNext = <N extends Wayname>(way: N) => {
  return wayPlus(way, "north");
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

export type NookZ<N extends Wayname> = N extends "east"
  ? { x: 1; y: 1; kind: "svg" }
  : N extends "north"
  ? { x: 1; y: -1; kind: "svg" }
  : N extends "west"
  ? { x: -1; y: -1; kind: "svg" }
  : N extends "south"
  ? { x: -1; y: 1; kind: "svg" }
  : never;

export type EdgeZ<N extends Wayname> = N extends "east"
  ? { x: 1; y: 0; kind: "svg" }
  : N extends "north"
  ? { x: 0; y: -1; kind: "svg" }
  : N extends "west"
  ? { x: -1; y: 0; kind: "svg" }
  : N extends "south"
  ? { x: 0; y: 1; kind: "svg" }
  : never;

/**
 * @returns the starting corner of the way, meted moonwise.
 * north is negative
 */

export const toNookZ = <N extends Wayname>(way: N) => {
  switch (way) {
    case "east":
      return { x: 1, y: 1, kind: "svg" } as Override<NookZ<N>>;
    case "north":
      return { x: 1, y: -1, kind: "svg" } as Override<NookZ<N>>;
    case "west":
      return { x: -1, y: -1, kind: "svg" } as Override<NookZ<N>>;
    case "south":
      return { x: -1, y: 1, kind: "svg" } as Override<NookZ<N>>;
  }
  way satisfies never;
};

/**
 * @returns the edge of the way.
 * north is negative
 */
export const toEdgeZ = <N extends Wayname>(way: N) => {
  switch (way) {
    case "east":
      return { x: 1, y: 0, kind: "svg" } as Override<EdgeZ<N>>;
    case "north":
      return { x: 0, y: -1, kind: "svg" } as Override<EdgeZ<N>>;
    case "west":
      return { x: -1, y: 0, kind: "svg" } as Override<EdgeZ<N>>;
    case "south":
      return { x: 0, y: 1, kind: "svg" } as Override<EdgeZ<N>>;
  }
  way satisfies never;
};

export const toFarthing = (way: Wayname, kind: ZKind) => {
  return (
    ((kind === "canvas" ? 3 - waytellOf(way) : waytellOf(way)) * Math.PI) / 2
  );
};
