import { mod } from "../help/reckon";
import type { Override } from "../help/type";
import { type Edgestaff, edgetellsOf, isEdgestaff } from "./edge";

export type Brickname<
  E extends Edgestaff = Edgestaff,
  N extends Edgestaff = Edgestaff,
  W extends Edgestaff = Edgestaff,
  S extends Edgestaff = Edgestaff,
  B extends boolean = boolean
> = E extends any
  ? N extends any
    ? W extends any
      ? S extends any
        ? `${E}${N}${W}${S}${Maybestaff<E, N, W, S>}${ShieldstaffOf<
            E | N | W | S,
            B
          >}`
        : never
      : never
    : never
  : never;

type Maybestaff<
  E extends Edgestaff = Edgestaff,
  N extends Edgestaff = Edgestaff,
  W extends Edgestaff = Edgestaff,
  S extends Edgestaff = Edgestaff
> =
  | ""
  | (E extends "b"
      ? N extends "f"
        ? W extends "b"
          ? S extends "f"
            ? 2
            : never
          : never
        : never
      : never);

type ShieldstaffOf<
  N extends Edgestaff = Edgestaff,
  B extends boolean = boolean
> = "" | (N extends "b" ? (B extends true ? "s" : never) : never);

export const isBrickname = (x: unknown): x is Brickname => {
  if (typeof x !== "string") return false;

  const edges = x.slice(0, 4);
  const ending = x.slice(4);
  return (
    [...edges].every(isEdgestaff) &&
    (ending === "" || ending === "s" || x === "bfbf2" || x === "bfbf2s")
  );
};

export type Eaststaff<N extends Brickname> = N extends `${infer S}${infer _}`
  ? S extends Edgestaff
    ? S
    : never
  : never;

export type Northstaff<N extends Brickname> =
  N extends `${Edgestaff}${infer S}${infer _}`
    ? S extends Edgestaff
      ? S
      : never
    : never;

export type Weststaff<N extends Brickname> =
  N extends `${Edgestaff}${Edgestaff}${infer S}${infer _}`
    ? S extends Edgestaff
      ? S
      : never
    : never;

export type Southstaff<N extends Brickname> =
  N extends `${Edgestaff}${Edgestaff}${Edgestaff}${infer S}${infer _}`
    ? S extends Edgestaff
      ? S
      : never
    : never;

export type Shieldstaff<N extends Brickname> =
  N extends `${Edgestaff}${Edgestaff}${Edgestaff}${Edgestaff}${"s" | "2s"}`
    ? "s"
    : "";

export type East<E extends Edgestaff> = Brickname<E>;
export type North<E extends Edgestaff> = Brickname<Edgestaff, E>;
export type West<E extends Edgestaff> = Brickname<Edgestaff, Edgestaff, E>;
export type South<E extends Edgestaff> = Brickname<
  Edgestaff,
  Edgestaff,
  Edgestaff,
  E
>;

export const east = <N extends Brickname>(brickname: N) => {
  return brickname[0] as Override<Eaststaff<N>>;
};

export const north = <N extends Brickname>(brickname: N) => {
  return brickname[1] as Override<Northstaff<N>>;
};

export const west = <N extends Brickname>(brickname: N) => {
  return brickname[2] as Override<Weststaff<N>>;
};

export const south = <N extends Brickname>(brickname: N) => {
  return brickname[3] as Override<Southstaff<N>>;
};

export const hasEast = <S extends Edgestaff>(
  brickname: Brickname,
  staff: S
): brickname is East<S> => {
  return east(brickname) === staff;
};

export const hasNorth = <S extends Edgestaff>(
  brickname: Brickname,
  staff: S
): brickname is North<S> => {
  return north(brickname) === staff;
};

export const hasWest = <S extends Edgestaff>(
  brickname: Brickname,
  staff: S
): brickname is West<S> => {
  return west(brickname) === staff;
};

export const hasSouth = <S extends Edgestaff>(
  brickname: Brickname,
  staff: S
): brickname is South<S> => {
  return south(brickname) === staff;
};

export type Shield = Exclude<
  Brickname,
  Brickname<Edgestaff, Edgestaff, Edgestaff, Edgestaff, false>
>;

export const hasShield = (brickname: Brickname): brickname is Shield => {
  return brickname.at(4) === "s" || brickname.at(5) === "s";
};

export type CurvedRoadful =
  | Brickname<"r", "r", "b" | "f", "b" | "f">
  | Brickname<"b" | "f", "r", "r", "b" | "f">
  | Brickname<"b" | "f", "b" | "f", "r", "r">
  | Brickname<"r", "b" | "f", "b" | "f", "r">;

export const hasCurvedRoad = (
  brickname: Brickname
): brickname is CurvedRoadful => {
  const roadFingers = [];
  for (let i = 0; i < brickname.length; i++) {
    if (brickname[i] === "r") roadFingers.push(i);
  }
  return (
    roadFingers.length === 2 && mod(roadFingers[0] - roadFingers[1], 4) === 3
  );
};

export type Church =
  | Brickname<"f", "f", "f", "f">
  | Brickname<"r", "f", "f", "f">
  | Brickname<"f", "r", "f", "f">
  | Brickname<"f", "f", "r", "f">
  | Brickname<"f", "f", "f", "r">;

export const hasChurch = (brickname: Brickname): brickname is Church => {
  return edgetellsOf(brickname, "r").length <= 1 && !hasBurgh(brickname);
};

export type Town =
  | Brickname<"r", "r", "r">
  | Brickname<Edgestaff, "r", "r", "r">
  | Brickname<"r", Edgestaff, "r", "r">
  | Brickname<"r", "r", Edgestaff, "r">;

export const hasTown = (brickname: Brickname): brickname is Town => {
  return edgetellsOf(brickname, "r").length >= 3;
};

export type Ful<S extends Edgestaff> = East<S> | North<S> | West<S> | South<S>;
export type Bful = Ful<"b">;
export type Fful = Ful<"f">;
export type Rful = Ful<"r">;

export const hasBurgh = (brickname: Brickname): brickname is Bful => {
  return (
    brickname[0] === "b" ||
    brickname[1] === "b" ||
    brickname[2] === "b" ||
    brickname[3] === "b"
  );
};

export const hasRoad = (brickname: Brickname): brickname is Rful => {
  return (
    brickname[0] === "r" ||
    brickname[1] === "r" ||
    brickname[2] === "r" ||
    brickname[3] === "r"
  );
};
