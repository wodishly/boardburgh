import type { BoardCanvas } from "../board";
import {
  hasShield,
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
} from "../brick/way";
import { toList, zTimes, zPlus, type Z, z, type ZKind } from "../help/reckon";
import { flight, type Plus } from "../help/rime";
import { only, type Override, type Maybe, sameshift } from "../help/type";
import { Brushwit, Settings } from "../settings";
import { borrowContext } from "./canvas/canvas";
import { worldToScreen, type Feather } from "./draw";
import {
  drawChurch,
  drawNotTwoRoads,
  drawTown,
  drawTwoRoadsFar,
  drawTwoRoadsNear,
  far,
  near,
} from "./draw-brickshape-road";
import {
  toRectangle,
  type Fournook,
  type Nookful,
  type Rectangle,
  type Ring,
  type RoundedRectangle,
} from "./shape";

export type Featherkind<F extends Feather> = F extends SVGSVGElement
  ? "svg"
  : F extends BoardCanvas
  ? "canvas"
  : never;

export type BrickshapeDraw = (
  feather: Feather,
  fournook: Fournook<"world">,
  brickname: Brickname,
  head?: Maybe<Wayname>,
  winkle?: number
) => void;

export type Roadnooks = Plus<1 | 3, Plus<1 | 3, Plus<1 | 3, 1 | 3>>>;

export const featherkind = <F extends Feather>(feather: F): Featherkind<F> => {
  if (feather instanceof SVGSVGElement) {
    return "svg" as Override<Featherkind<F>>;
  } else if ("context" in feather) {
    return "canvas" as Override<Featherkind<F>>;
  } else {
    console.log(feather);
    throw new Error("bad feather");
  }
};

export const drawBrickshape: BrickshapeDraw = (
  feather,
  nooks,
  brickname,
  head,
  winkle
) => {
  const k = featherkind(feather);
  switch (k) {
    case "svg":
      throw new Error("uh oh");
    case "canvas":
      drawField(feather, nooks, brickname, head, winkle);
      drawRoads(feather, nooks, brickname, head, winkle);
      drawCity(feather, nooks, brickname, head, winkle);
      drawShield(feather, nooks, brickname, head, winkle);
      return;
  }
  k satisfies never;
};

export const drawField: BrickshapeDraw = (
  feather,
  { navel, greatness },
  _brickname,
  _head,
  winkle
) => {
  if (feather instanceof SVGSVGElement) {
    throw new Error("uh oh");
  } else {
    const rectangle = toRectangle({
      navel: worldToScreen(navel, feather.eye),
      greatness: worldToScreen(greatness, feather.eye, false),
    });
    borrowContext(feather.context, Brushwit.field, (context) => {
      spunAbout(
        context,
        {
          x: rectangle.x + rectangle.width / 2,
          y: rectangle.y + rectangle.height / 2,
          kind: "canvas",
        },
        winkle ?? 0,
        (ctx) =>
          ctx.rect(
            -rectangle.width / 2,
            -rectangle.height / 2,
            rectangle.width,
            rectangle.height
          )
      );
    });
    return true;
  }
};

export const spunAbout = (
  context: CanvasRenderingContext2D,
  navel: Z<"canvas">,
  winkle: number,
  callback: (context: CanvasRenderingContext2D) => void
) => {
  context.save();
  context.translate(navel.x, navel.y);
  context.rotate(winkle);
  callback(context);
  context.restore();
};

export const cityFingers = (
  brickname: Brickname,
  head: Wayname = "east"
): number[] => {
  return flight(4)
    .filter((i) => brickname[i] === "c")
    .map((i) => (i + Waybook.indexOf(head ?? "east")) % 4);
};

export const roadFingers = (
  brickname: Brickname,
  head: Wayname = "east"
): number[] => {
  return flight(4)
    .filter((i) => brickname[i] === "r")
    .map((i) => (i + Waybook.indexOf(head ?? "east")) % 4);
};

export const drawRoads: BrickshapeDraw = (
  feather,
  nooks,
  brickname,
  head,
  winkle
) => {
  const roadEdges = roadFingers(brickname);

  if (roadEdges.length === 2) {
    if (near(roadEdges)) {
      drawTwoRoadsNear(feather, nooks, brickname, head, winkle);
    } else if (far(roadEdges)) {
      drawTwoRoadsFar(feather, nooks, brickname, head, winkle);
    } else {
      throw new Error("bad edges");
    }
  } else {
    drawNotTwoRoads(feather, nooks, brickname, head, winkle);
  }

  if (roadEdges.length >= 3) {
    drawTown(feather, nooks, brickname, head, winkle);
  } else if (roadEdges.length <= 1 && !brickname.includes("c")) {
    drawChurch(feather, nooks, brickname, head, winkle);
  }
  return true;
};

export const drawCity: BrickshapeDraw = (
  feather,
  { navel, greatness },
  brickname,
  head
) => {
  const cityEdges = flight(4)
    .filter((i) => brickname[i] === "c")
    .map((i) => i + Waybook.indexOf(head ?? "east"));

  if (cityEdges.length === 0) {
    return true;
  } else if (cityEdges.length === 4) {
    if (feather instanceof SVGSVGElement) {
      throw new Error("uh oh");
    } else {
      const rectangle = toRectangle({
        navel: worldToScreen(navel, feather.eye),
        greatness: worldToScreen(greatness, feather.eye, false),
      });
      borrowContext(feather.context, Brushwit.city, (context) => {
        context.rect(
          rectangle.x,
          rectangle.y,
          rectangle.width,
          rectangle.height
        );
      });
      return true;
    }
  } else if (
    cityEdges.length === 3 ||
    (cityEdges.length === 2 && (cityEdges[0] - cityEdges[1]) % 4 === -2)
  ) {
    if (feather instanceof SVGSVGElement) {
      throw new Error("uh oh");
    } else {
      return true;
    }
  } else if (cityEdges.length === 2) {
    // todo: the special tiles
    if (feather instanceof SVGSVGElement) {
      throw new Error("uh oh");
    } else {
      return true;
    }
  } else if (cityEdges.length === 1) {
    const way = only(cityEdges);
    if (feather instanceof SVGSVGElement) {
      throw new Error("uh oh");
    } else {
      borrowContext(feather.context, Brushwit.city, (context) => {
        context.arc(
          ...toList(
            worldToScreen(
              {
                ...zPlus(
                  navel,
                  zTimes(toEdgeZ(Waybook[way]), Settings.brickLength)
                ),
                kind: "world",
              },
              feather.eye
            )
          ),
          feather.eye.zoom.scale *
            ((greatness.x + greatness.y) / 2 / Math.sqrt(2)),
          (Math.PI * (-1 + 2 * way + 4 * +!(way % 2))) / 4,
          (Math.PI * (1 + 2 * way + 4 * +!(way % 2))) / 4
        );
      });
      return true;
    }
  } else {
    throw new Error("bad city edges");
  }
};

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
      x: bricknooks.x + bricknooks.width / 2 + allNooks[3 * i].x,
      y: bricknooks.y + bricknooks.height / 2 + allNooks[3 * i].y,
      kind: bricknooks.kind,
    });
    if (brickname[i] === "r") {
      trueNooks.push({
        x: bricknooks.x + bricknooks.width / 2 + allNooks[3 * i + 1].x,
        y: bricknooks.y + bricknooks.height / 2 + allNooks[3 * i + 1].y,
        kind: bricknooks.kind,
      });
      trueNooks.push({
        x: bricknooks.x + bricknooks.width / 2 + allNooks[3 * i + 2].x,
        y: bricknooks.y + bricknooks.height / 2 + allNooks[3 * i + 2].y,
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

// todo : rotato shield
export const drawShield: BrickshapeDraw = (
  feather,
  { navel, greatness },
  brickname,
  _head,
  winkle
) => {
  if (!hasShield(brickname)) return true;

  const nudge: Z<"svg"> = {
    x: 0,
    y:
      0.5 *
      +(brickname[0] === "c" && brickname[1] !== "c" && brickname[2] === "c"),
    kind: "svg",
  };

  const roundedRectangle: RoundedRectangle<"world"> = {
    x: navel.x + greatness.x / 8 + nudge.x,
    y: navel.y - greatness.y / 2 + greatness.y / 8 + nudge.y,
    kind: "world",
    width: greatness.x / 4,
    height: greatness.y / 4,
    rx: greatness.x * (3 / 32),
    ry: greatness.y * (3 / 32),
  };

  if (feather instanceof SVGSVGElement) {
    throw new Error("uh oh");
  } else {
    borrowContext(feather.context, Brushwit.shield, (context) => {
      spunAbout(
        context,
        {
          x: roundedRectangle.x + roundedRectangle.width / 2,
          y: roundedRectangle.y + roundedRectangle.height / 2,
          kind: "canvas",
        },
        winkle ?? 0,
        (ctx) => {
          ctx.roundRect(
            ...toList(
              worldToScreen(
                {
                  x: roundedRectangle.x - navel.x,
                  y: roundedRectangle.y - navel.y,
                  kind: roundedRectangle.kind,
                },
                feather.eye
              )
            ),
            ...toList(
              worldToScreen(
                {
                  x: roundedRectangle.width,
                  y: roundedRectangle.height,
                  kind: roundedRectangle.kind,
                },
                feather.eye,
                false
              )
            ),
            ((roundedRectangle.width + roundedRectangle.height) / 2) *
              (3 / 32) *
              feather.eye.zoom.scale
          );
        }
      );
    });
    return true;
  }
};
