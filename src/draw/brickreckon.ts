import {
  type Brickname,
  type Church,
  type Shield,
  type Town,
} from "../brick/brickname";
import {
  toNookZ,
  toEdgeZ,
  Waybook,
  wayNext,
  wayPlus,
  type Wayname,
} from "../help/way";
import { zTimes, z, type ZKind } from "../help/reckon";
import { type Plus } from "../help/rime";
import { type Override, sameshift } from "../help/type";
import { Settings } from "../settings";
import {
  type Nookful,
  type Rectangle,
  type Ring,
  type RoundedRectangle,
} from "./shape";

export type Roadnooks = Plus<1 | 3, Plus<1 | 3, Plus<1 | 3, 1 | 3>>>;

export const reckonStraightRoad = <K extends "canvas" | "svg">(
  brickname: Brickname,
  bricknooks: Rectangle<K>,
  head: Wayname = "east"
): Nookful<K, Roadnooks> => {
  const allNooks = sameshift([...Waybook], (way) => {
    const spunThisWay = wayPlus(way, head);
    const thisInnerNook = zTimes(
      toNookZ(spunThisWay),
      Settings.draw.roadHalfwidth
    );
    const nextInnerNook = zTimes(
      toNookZ(wayNext(spunThisWay)),
      Settings.draw.roadHalfwidth
    );
    return [
      thisInnerNook,
      z(
        spunThisWay === "east" || spunThisWay === "west"
          ? toEdgeZ(spunThisWay).x
          : thisInnerNook.x,
        spunThisWay === "north" || spunThisWay === "south"
          ? toEdgeZ(spunThisWay).y
          : thisInnerNook.y,
        "svg"
      ),
      z(
        spunThisWay === "east" || spunThisWay === "west"
          ? toEdgeZ(spunThisWay).x
          : nextInnerNook.x,
        spunThisWay === "north" || spunThisWay === "south"
          ? toEdgeZ(spunThisWay).y
          : nextInnerNook.y,
        "svg"
      ),
    ];
  }).flat();

  const trueNooks = [];

  for (let i = 0; i < Waybook.length; i++) {
    trueNooks.push({
      x: bricknooks.x + (bricknooks.width / 2) * (1 + allNooks[3 * i].x),
      y: bricknooks.y + (bricknooks.height / 2) * (1 + allNooks[3 * i].y),
      kind: bricknooks.kind,
    });
    if (brickname[i] === "r") {
      trueNooks.push({
        x: bricknooks.x + (bricknooks.width / 2) * (1 + allNooks[3 * i + 1].x),
        y: bricknooks.y + (bricknooks.height / 2) * (1 + allNooks[3 * i + 1].y),
        kind: bricknooks.kind,
      });
      trueNooks.push({
        x: bricknooks.x + (bricknooks.width / 2) * (1 + allNooks[3 * i + 2].x),
        y: bricknooks.y + (bricknooks.height / 2) * (1 + allNooks[3 * i + 2].y),
        kind: bricknooks.kind,
      });
    }
  }
  return trueNooks as Override<Nookful<K, Roadnooks>>;
};

export const reckonTown = <K extends ZKind>(
  brickname: Town,
  bricknooks: Rectangle<K>
): Ring<K> => {
  return {
    navel: {
      x: bricknooks.x + bricknooks.width / 2,
      y: bricknooks.y + bricknooks.height / 2,
      kind: bricknooks.kind,
    },
    halfwidth: (bricknooks.width + bricknooks.height) / 2 / 2 / 4,
  };
};

export const reckonChurch = <K extends ZKind>(
  brickname: Church,
  bricknooks: Rectangle<K>
): Ring<K> => {
  return {
    navel: {
      x: bricknooks.x + bricknooks.width / 2,
      y: bricknooks.y + bricknooks.height / 2,
      kind: bricknooks.kind,
    },
    halfwidth: (bricknooks.width + bricknooks.height) / 2 / 2 / 2,
  };
};

export const reckonShield = <K extends "canvas" | "svg">(
  brickname: Shield,
  bricknooks: Rectangle<K>
): RoundedRectangle<K> => {
  const { x, y, width, height } = bricknooks;
  return {
    x: x + (width * 11) / 16,
    y:
      brickname[0] === "c" && brickname[1] !== "c" && brickname[2] === "c"
        ? y + (height * 3) / 8
        : y + (height * 1) / 16,
    kind: bricknooks.kind,
    width: width / 4,
    height: height / 4,
    rx: width * (3 / 32),
    ry: height * (3 / 32),
  };
};
