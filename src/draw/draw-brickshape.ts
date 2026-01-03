import type { BoardCanvas } from "../board";
import { Edgebook, hasShield, type Brickname } from "../brick/bricktype";
import {
  toCornerZ,
  toEdgeZ,
  Waybook,
  wayNext,
  wayPlus,
  type Way,
} from "../brick/way";
import {
  withSpaces,
  withCommas,
  toList,
  zTimes,
  zPlus,
  type Z,
  mod,
} from "../help/reckon";
import { flight, only, type Override, type Maybe } from "../help/type";
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
  type Rectangle,
  type RoundedRectangle,
} from "./shape";
import { makeSVGElement, toSvgBrush } from "./svg/svg";

export type Featherkind<F extends Feather> = F extends SVGSVGElement
  ? "svg"
  : F extends BoardCanvas
  ? "canvas"
  : never;

export type BrickshapeDraw = (
  feather: Feather,
  fournook: Fournook<"world">,
  brickname: Brickname,
  head?: Maybe<Way>,
  winkle?: number
) => void;

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
      drawField(feather, nooks, brickname, head, winkle);
      drawRoads(feather, nooks, brickname, head, winkle);
      drawCity(feather, nooks, brickname, head, winkle);
      drawShield(feather, nooks, brickname, head, winkle);
      return;
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
  brickname,
  head,
  winkle
) => {
  if (feather instanceof SVGSVGElement) {
    feather.append(
      makeSVGElement("rect", {
        ...toSvgBrush(Brushwit.field),
        ...toRectangle({ navel, greatness }),
      })
    );
    return true;
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
  head: Way = "east"
): number[] => {
  return flight(4)
    .filter((i) => brickname[i] === "c")
    .map((i) => (i + Waybook.indexOf(head ?? "east")) % 4);
};

export const roadFingers = (
  brickname: Brickname,
  head: Way = "east"
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
      feather.append(
        makeSVGElement("rect", {
          ...toSvgBrush(Brushwit.city),
          x: navel.x - greatness.x / 2,
          y: navel.y - greatness.y / 2,
          width: greatness.x,
          height: greatness.y,
        })
      );
      return true;
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
      const city = makeSVGElement("path", toSvgBrush(Brushwit.city));
      let d = [];
      d.push(`M${withCommas(toCornerZ("east"))}`);
      for (let i = 0; i < 4; i++) {
        const thisWay = Waybook[i];
        const nextWay = wayNext(thisWay);
        const nextCorner = toCornerZ(nextWay);
        if (!cityEdges.includes(i)) {
          d.push(
            `A${Math.sqrt(2)} ${Math.sqrt(2)} -90 0 1 ${withSpaces(nextCorner)}`
          );
        } else {
          d.push(`L${nextCorner.x} ${nextCorner.y}`);
        }
      }
      d.push("Z");
      city.setAttribute("d", d.join(" "));
      feather.append(city);
      return true;
    } else {
      return true;
    }
  } else if (cityEdges.length === 2) {
    // todo: the special tiles
    if (feather instanceof SVGSVGElement) {
      const [start, end] =
        cityEdges[0] === 0 && cityEdges[1] === 3 ? [3, 0] : cityEdges;

      const city = makeSVGElement("polygon", toSvgBrush(Brushwit.city));
      city.setAttribute(
        "points",
        [start, end, end + 1]
          .map((i) => withCommas(toCornerZ(Waybook[i % 4])))
          .join(" ")
      );
      feather.append(city);
      return true;
    } else {
      return true;
    }
  } else if (cityEdges.length === 1) {
    const way = only(cityEdges);
    if (feather instanceof SVGSVGElement) {
      feather.append(
        makeSVGElement("path", {
          ...toSvgBrush(Brushwit.city),
          d:
            `M${withSpaces(toCornerZ(Waybook[way]))}` +
            ` ` +
            `A${Math.sqrt(2)} ${Math.sqrt(2)} -90 0 1 ${withCommas(
              toCornerZ(wayNext(Waybook[way]))
            )}`,
        })
      );
      return true;
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

// export const reckonRoad = <K extends "canvas" | "svg">(
//   brickname: Brickname,
//   bricknooks: Rectangle<K>,
//   head: Way = "east"
// ) => {
//   const allNooks = Waybook.map((way, i) =>
//     zTimes(toCornerZ(wayPlus(way, head)), Settings.draw.roadHalfwidth)
//   ).flat();
//   const d = ["d"];
//   for (let i = 0; i < brickname.length; i++) {
//     d.push(`L${withSpaces(allNooks[i])}`);
//     if (brickname[i] === "r") {
//       d.push(`L${withSpaces(allNooks[i])}`);
//     }
//     d.push(`L${withSpaces(allNooks[mod(i + 1, 4)])}`);
//   }
//   return d.join(" ").replace("L", "M");
// };

export const reckonShield = <K extends "canvas" | "svg">(
  brickname: Brickname,
  bricknooks: Rectangle<K>
): RoundedRectangle<K> => {
  const { x, y, width, height } = bricknooks;
  const nudge =
    0.5 *
    +(brickname[0] === "c" && brickname[1] !== "c" && brickname[2] === "c");
  return {
    x: x + (width * 5) / 8,
    y: y + (height * 1) / 8 + nudge,
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
  head,
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
    feather.append(
      makeSVGElement("rect", {
        ...toSvgBrush(Brushwit.shield),
        ...roundedRectangle,
      })
    );
    return true;
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
