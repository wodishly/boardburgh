import type { Z } from "../help/reckon";
import { sameshift, flight } from "../help/type";

export const Waybook = ["east", "north", "west", "south"] as const;
export type Way = (typeof Waybook)[number];

export const wayNext = (way: Way) => {
  return wayPlus(way, "north");
};

export const wayPlus = (first: Way, other: Way) => {
  return Waybook[
    (Waybook.indexOf(first) + Waybook.indexOf(other)) % Waybook.length
  ];
};

/**
 * @returns the starting corner of the way, meted moonwise.
 * north is negative
 */

export const toCornerZ = (way: Way): Z<"svg"> => {
  switch (way) {
    case "east":
      return { x: 1, y: 1, kind: "svg" };
    case "north":
      return { x: 1, y: -1, kind: "svg" };
    case "west":
      return { x: -1, y: -1, kind: "svg" };
    case "south":
      return { x: -1, y: 1, kind: "svg" };
  }
  way satisfies never;
};

/**
 * @returns the edge of the way.
 * north is negative
 */

export const toEdgeZ = (way: Way): Z<"svg"> => {
  switch (way) {
    case "east":
      return { x: 1, y: 0, kind: "svg" };
    case "north":
      return { x: 0, y: -1, kind: "svg" };
    case "west":
      return { x: -1, y: 0, kind: "svg" };
    case "south":
      return { x: 0, y: 1, kind: "svg" };
  }
  way satisfies never;
};

export const toZsFrom = (way: Way) => {
  return sameshift(flight(4), (n) => toCornerZ(wayPlus(way, Waybook[n])));
};
