import type { Override } from "../help/type";
import {
  type Brickname,
  type Eaststaff,
  type Northstaff,
  type Weststaff,
  type Southstaff,
  east,
  north,
  south,
  west,
} from "./brickname";
import type { Waytell } from "../help/way";

export const Edgebook = ["burgh", "field", "road"] as const;

export type Edgestaff = "b" | "f" | "r";

export const isEdgestaff = (x: unknown): x is Edgestaff =>
  x === "b" || x === "f" || x === "r";

export type Edgename<S extends Edgestaff> = S extends "b"
  ? "burgh"
  : S extends "f"
  ? "field"
  : S extends "r"
  ? "road"
  : never;

export const isEdgename = <S extends Edgestaff>(x: unknown): x is Edgename<S> =>
  x === "burgh" || x === "field" || x === "road";

export const edgestaffToName = <S extends Edgestaff>(staff: S): Edgename<S> => {
  switch (staff) {
    case "b":
      return "burgh" as Override<Edgename<S>>;
    case "f":
      return "field" as Override<Edgename<S>>;
    case "r":
      return "road" as Override<Edgename<S>>;
  }
  staff satisfies never;
};

type Edgetells<N extends Brickname, S extends Edgestaff> = [
  ...(Eaststaff<N> extends S ? [0] : []),
  ...(Northstaff<N> extends S ? [1] : []),
  ...(Weststaff<N> extends S ? [2] : []),
  ...(Southstaff<N> extends S ? [3] : [])
];

export const edgetellsOf = <N extends Brickname, S extends Edgestaff>(
  brickname: N,
  staff: S
) => {
  const tells: Waytell[] = [];
  if (east(brickname) === staff) {
    tells.push(0);
  }
  if (north(brickname) === staff) {
    tells.push(1);
  }
  if (west(brickname) === staff) {
    tells.push(2);
  }
  if (south(brickname) === staff) {
    tells.push(3);
  }
  return tells as N extends any ? Override<Edgetells<N, S>> : never;
};
