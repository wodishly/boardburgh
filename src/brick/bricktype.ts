import { isObject, type Override } from "../help/type";

export const Edgebook = ["city", "field", "road"] as const;

export type Edgestaff = "c" | "f" | "r";
export const isEdgestaff = (x: unknown): x is Edgestaff =>
  x === "c" || x === "f" || x === "r";

export type Edgename<S extends Edgestaff> = S extends "c"
  ? "city"
  : S extends "f"
  ? "field"
  : S extends "r"
  ? "road"
  : never;
export const isEdgename = <S extends Edgestaff>(x: unknown): x is Edgename<S> =>
  x === "city" || x === "field" || x === "road";

export const edgestaffToName = <S extends Edgestaff>(staff: S): Edgename<S> => {
  switch (staff) {
    case "c":
      return "city" as Override<Edgename<S>>;
    case "f":
      return "field" as Override<Edgename<S>>;
    case "r":
      return "road" as Override<Edgename<S>>;
  }
  staff satisfies never;
};

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
        ? `${E}${N}${W}${S}${Maybestaff<E, N, W, S>}${Shieldstaff<
            E | N | W | S,
            B
          >}`
        : never
      : never
    : never
  : never;

export const isBrickname = (x: unknown): x is Brickname => {
  if (typeof x !== "string") return false;

  const edges = x.slice(0, 4);
  const ending = x.slice(4);
  return (
    [...edges].every(isEdgestaff) &&
    (ending === "" || ending === "s" || x === "cfcf2" || x === "cfcf2s")
  );
};

type Maybestaff<
  E extends Edgestaff = Edgestaff,
  N extends Edgestaff = Edgestaff,
  W extends Edgestaff = Edgestaff,
  S extends Edgestaff = Edgestaff
> =
  | ""
  | (E extends "c"
      ? N extends "f"
        ? W extends "c"
          ? S extends "f"
            ? 2
            : never
          : never
        : never
      : never);

type Shieldstaff<
  N extends Edgestaff = Edgestaff,
  B extends boolean = boolean
> = "" | (N extends "c" ? (B extends true ? "s" : never) : never);

export type Brickshape<N extends Brickname = Brickname> = N extends any
  ? {
      brickname: N;
      edges: {
        east: Edgename<East<N>>;
        north: Edgename<North<N>>;
        west: Edgename<West<N>>;
        south: Edgename<South<N>>;
      };
      hasShield: HasShield<N>;
    }
  : never;

export const isBrickshape = (x: unknown): x is Brickshape => {
  return (
    isObject(x) &&
    "brickname" in x &&
    isBrickname(x.brickname) &&
    "edges" in x &&
    "hasShield" in x &&
    typeof x.hasShield === "boolean"
  );
};

type East<N extends Brickname> =
  N extends `${infer T extends Edgestaff}${infer _}${infer _}${infer _}${infer _}`
    ? T
    : never;

type North<N extends Brickname> =
  N extends `${infer _}${infer T extends Edgestaff}${infer _}${infer _}${infer _}`
    ? T
    : never;

type West<N extends Brickname> =
  N extends `${infer _}${infer _}${infer T extends Edgestaff}${infer _}${infer _}`
    ? T
    : never;

type South<N extends Brickname> =
  N extends `${infer _}${infer _}${infer _}${infer T extends Edgestaff}${infer _}`
    ? T
    : never;

export type HasShield<N extends Brickname> = N extends any
  ? N extends `${infer _}${infer _}${infer _}${infer _}${infer T}`
    ? T extends "s" | "2s"
      ? true
      : false
    : never
  : never;

export const hasShield = <N extends Brickname>(brickname: N): HasShield<N> => {
  return (brickname.slice(4) === "s" || brickname.slice(4) === "2s") as Override<
    HasShield<N>
  >;
};

export const edges = <N extends Brickname>(brickname: N) => {
  return {
    east: edgestaffToName(brickname[0] as Override<East<N>>),
    north: edgestaffToName(brickname[1] as Override<North<N>>),
    west: edgestaffToName(brickname[2] as Override<West<N>>),
    south: edgestaffToName(brickname[3] as Override<South<N>>),
  };
};
