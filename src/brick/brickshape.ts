import { isObject } from "../help/type";
import {
  type Brickname,
  type Eaststaff,
  type Northstaff,
  type Weststaff,
  type Southstaff,
  type Shieldstaff,
  isBrickname,
  east,
  north,
  south,
  west,
} from "./brickname";
import { edgestaffToName, type Edgename } from "./edge";

export type Brickshape<N extends Brickname = Brickname> = N extends any
  ? {
      brickname: N;
      edges: {
        east: Edgename<Eaststaff<N>>;
        north: Edgename<Northstaff<N>>;
        west: Edgename<Weststaff<N>>;
        south: Edgename<Southstaff<N>>;
      };
      hasShield: Shieldstaff<N> extends "s" ? true : false;
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

export const edges = <N extends Brickname>(brickname: N) => {
  return {
    east: edgestaffToName(east(brickname)),
    north: edgestaffToName(north(brickname)),
    west: edgestaffToName(west(brickname)),
    south: edgestaffToName(south(brickname)),
  };
};
