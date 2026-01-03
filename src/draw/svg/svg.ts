import type { Brickname } from "../../brick/bricktype";
import { mod, type Z } from "../../help/reckon";
import { Brushwit, Settings } from "../../settings";
import type { Brush } from "../draw";
import { drawBrickshape, reckonShield, roadFingers } from "../draw-brickshape";
import {
  toRectangle,
  type Fournook,
  type Rectangle,
  type RoundedRectangle,
} from "../shape";

type SvgBrushRimeKey =
  | `${string}x`
  | `${string}y`
  | `r`
  | `width`
  | `height`
  | `${string}Width`
  | `${string}Height`;

export type SvgBrush = {
  [K in keyof CSSStyleDeclaration]: K extends SvgBrushRimeKey ? number : string;
};

export const toSvgBrush = (brush: Partial<Brush>): Partial<SvgBrush> => {
  return Object.assign(
    {},
    "fillColor" in brush ? { fill: brush.fillColor } : {},
    "strokeColor" in brush ? { stroke: brush.strokeColor } : {},
    {
      strokeWidth: brush.strokeWidth,
      textAlign: brush.textAlign,
      textBaseline: brush.textBaseline,
    }
  );
};

export const makeSVGToken = (brickname: Brickname) => {
  const svg = makeSVGElement("svg");
  svg.setAttribute("id", `token-${brickname}`);
  svg.setAttribute("viewBox", "-1 -1 2 2");
  drawBrickshape(
    // drawSVGBrickshape(
    svg,
    {
      navel: { x: 0, y: 0, kind: "world" },
      greatness: { x: 2, y: 2, kind: "world" },
    },
    brickname
  );
  return svg;
};

export const svgFrame = (): Rectangle<"svg"> => {
  return {
    x: -1,
    y: -1,
    width: 2,
    height: 2,
    kind: "svg",
  };
};

export const hasCurvedRoad = (brickname: Brickname) => {
  const roadFingers = [];
  for (let i = 0; i < brickname.length; i++) {
    if (brickname[i] === "r") roadFingers.push(i);
  }
  return (
    roadFingers.length === 2 && mod(roadFingers[0] - roadFingers[1], 4) === 3
  );
};

// export const drawSVGBrickshape = (
//   svg: SVGSVGElement,
//   { navel, greatness }: Fournook<"world">,
//   brickname: Brickname
// ) => {
//   svg.append(
//     makeSVGElement("rect", {
//       ...toSvgBrush(Brushwit.field),
//       ...toRectangle({ navel, greatness }),
//     })
//   );
//   if (hasCurvedRoad(brickname)) {
//     // todo
//   } else {
//     svg.append(makeSVGElement("path", { ...toSvgBrush(Brushwit.road), ...reckonRoad(brickname, svgFrame()) }));
//   }
//
//   for (const i of roadEdges) {
//     svg.append(
//       makeSVGElement("rect", {
//         ...toSvgBrush(Brushwit.road),
//         x: navel.x - (i === 2 ? greatness.x / 2 : roadHalfwidth),
//         y: navel.y - (i === 1 ? greatness.y / 2 : roadHalfwidth),
//         width: roadHalfwidth + (i % 2 ? roadHalfwidth : greatness.x / 2),
//         height: roadHalfwidth + (i % 2 ? greatness.y / 2 : roadHalfwidth),
//       })
//     );
//   }
//
//   switch (roadEdges.length) {
//     case 4:
//       svg.append(
//         makeSVGElement("rect", {
//           ...toSvgBrush(Brushwit.road),
//           ...toRectangle({ navel, greatness }),
//         })
//       );
//       break;
//   }
//
//   svg.append(
//     makeSVGElement("rect", {
//       ...toSvgBrush(Brushwit.shield),
//       ...reckonShield(brickname, svgFrame()),
//     })
//   );
// };

export const makeSVGElement = <K extends keyof SVGElementTagNameMap>(
  tagName: K,
  brush: Partial<SvgBrush> = {}
): SVGElementTagNameMap[K] => {
  const element = document.createElementNS(
    "http://www.w3.org/2000/svg",
    tagName
  );
  for (const [key, value] of Object.entries(brush))
    element.setAttribute(key, `${value}`);
  return element;
};
