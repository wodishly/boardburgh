import {
  hasChurch,
  hasCurvedRoad,
  hasRoad,
  hasShield,
  hasTown,
  type Brickname,
} from "../brick/brickname";
import { edgetellsOf } from "../brick/edge";
import { Waybook, toNookZ, toEdgeZ, wayNext } from "../help/way";
import {
  withCommas,
  withSpaces,
  zLerp,
  zTimes,
  type ZKind,
} from "../help/reckon";
import { swap } from "../help/type";
import { Brushwit, Settings } from "../settings";
import { type Brush } from "./brush";
import {
  reckonStraightRoad,
  reckonShield,
  type Roadnooks,
  reckonTown,
  reckonChurch,
} from "./brickreckon";
import {
  toRectangle,
  type Fournook,
  type Nookful,
  type Rectangle,
  type Ring,
} from "./shape";

export type SvgBrush = {
  [K in keyof CSSStyleDeclaration]: K extends SvgBrushRimeKey ? number : string;
};

type SvgBrushRimeKey =
  | `${string}x`
  | `${string}y`
  | `r`
  | `width`
  | `height`
  | `${string}Width`
  | `${string}Height`;

// todo
export const toSvgBrush = (brush: Partial<Brush>): Partial<SvgBrush> => {
  return Object.assign(
    {},
    "fillColor" in brush ? { fill: brush.fillColor } : {},
    "strokeColor" in brush ? { stroke: brush.strokeColor } : {},
    "strokeWidth" in brush ? { strokeWidth: brush.strokeWidth } : {},
    "textAlign" in brush ? { textAlign: brush.textAlign } : {},
    "textBaseline" in brush ? { textBaseline: brush.textBaseline } : {}
  );
};

export const makeSVGToken = (brickname: Brickname) => {
  const svg = makeSVGElement("svg");
  svg.setAttribute("id", `token-${brickname}`);
  svg.setAttribute("viewBox", "-1 -1 2 2");
  drawSVGBrickshape(
    svg,
    {
      navel: { x: 0, y: 0, kind: "world" },
      greatness: { x: 2, y: 2, kind: "world" },
    },
    brickname
  );
  return svg;
};

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

export const svgFrame = (): Rectangle<"svg"> => {
  return {
    x: -1,
    y: -1,
    width: 2,
    height: 2,
    kind: "svg",
  };
};

export const drawSVGBrickshape = (
  svg: SVGSVGElement,
  { navel, greatness }: Fournook<"world">,
  brickname: Brickname
) => {
  svg.append(
    makeSVGElement("rect", {
      ...toSvgBrush(Brushwit.field),
      ...toRectangle({ navel, greatness }),
    })
  );

  if (hasRoad(brickname)) {
    if (hasCurvedRoad(brickname)) {
      const almostEdgetells = edgetellsOf(brickname, "r");
      const edgetells =
        almostEdgetells[0] === 0 && almostEdgetells[1] === 3
          ? swap(almostEdgetells)
          : almostEdgetells;
      const nook = toNookZ(Waybook[edgetells[1]]);
      const start = toEdgeZ(Waybook[edgetells[0]]);
      const end = toEdgeZ(Waybook[edgetells[1]]);

      svg.append(
        makeSVGElement("path", {
          ...toSvgBrush(Brushwit.road),
          d:
            `M${withSpaces({
              ...zLerp(nook, start, 1 + Settings.draw.roadHalfwidth),
              kind: "svg",
            })}` +
            ` ` +
            `A${withSpaces(
              zTimes(greatness, (1 + Settings.draw.roadHalfwidth) / 2)
            )} 90 0 1 ${withSpaces({
              ...zLerp(nook, end, 1 + Settings.draw.roadHalfwidth),
              kind: "svg",
            })}` +
            ` ` +
            `L${withSpaces({
              ...zLerp(nook, end, 1 - Settings.draw.roadHalfwidth),
              kind: "svg",
            })}` +
            ` ` +
            `A${withSpaces(
              zTimes(greatness, (1 - Settings.draw.roadHalfwidth) / 2)
            )} 90 0 0 ${withSpaces({
              ...zLerp(nook, start, 1 - Settings.draw.roadHalfwidth),
              kind: "svg",
            })}` +
            ` ` +
            `Z`,
        })
      );
    } else {
      svg.append(
        makeSVGElement("path", {
          ...toSvgBrush(Brushwit.road),
          ...nookfulToSVGPath(reckonStraightRoad(brickname, svgFrame())),
        })
      );
    }

    if (hasTown(brickname)) {
      svg.append(
        makeSVGElement("circle", {
          ...toSvgBrush(Brushwit.town),
          ...ringToSVGCircle(reckonTown(brickname, svgFrame())),
        })
      );
    }
  }

  const edgetells = edgetellsOf(brickname, "b");
  switch (edgetells.length) {
    case 4:
      svg.append(
        makeSVGElement("rect", {
          ...toSvgBrush(Brushwit.burgh),
          ...toRectangle({ navel, greatness }),
        })
      );
      break;
    case 3:
      const svgPath = [];
      for (let i = 0; i < 4; i++) {
        const nook = toNookZ(wayNext(Waybook[i]));
        if (edgetells[0] === i || edgetells[1] === i || edgetells[2] === i) {
          svgPath.push(`L${withSpaces(nook)}`);
        } else {
          svgPath.push(
            `A${Math.sqrt(2)} ${Math.sqrt(2)} -90 0 1 ${withSpaces(nook)}`
          );
        }
      }
      svgPath.push("Z");
      svg.append(
        makeSVGElement("path", {
          ...toSvgBrush(Brushwit.burgh),
          d: svgPath.join(" ").replace("L", "M"),
        })
      );
      break;
    case 2:
      if ((edgetells[0] - edgetells[1]) % 2) {
        svg.append(
          makeSVGElement("path", {
            ...toSvgBrush(Brushwit.burgh),
            d:
              `M${withSpaces(toNookZ(Waybook[edgetells[0]]))}` +
              ` ` +
              `L${withSpaces(toNookZ(wayNext(Waybook[edgetells[0]])))}` +
              ` ` +
              `L${withSpaces(toNookZ(Waybook[edgetells[1]]))}` +
              ` ` +
              `L${withSpaces(toNookZ(wayNext(Waybook[edgetells[1]])))}` +
              ` ` +
              `Z`,
          })
        );
      } else {
        const svgPath = [];
        for (let i = 0; i < 4; i++) {
          const nook = toNookZ(wayNext(Waybook[i]));
          if (edgetells[0] === i || edgetells[1] === i) {
            svgPath.push(`L${withSpaces(nook)}`);
          } else {
            svgPath.push(
              `A${Math.sqrt(2)} ${Math.sqrt(2)} -90 0 1 ${withSpaces(nook)}`
            );
          }
        }
        svgPath.push("Z");
        svg.append(
          makeSVGElement("path", {
            ...toSvgBrush(Brushwit.burgh),
            d: svgPath.join(" ").replace("L", "M"),
          })
        );
      }
      break;
    case 1:
      svg.append(
        makeSVGElement("path", {
          ...toSvgBrush(Brushwit.burgh),
          d:
            `M${withSpaces(toNookZ(Waybook[edgetells[0]]))}` +
            ` ` +
            `A${Math.sqrt(2)} ${Math.sqrt(2)} -90 0 1 ${withCommas(
              toNookZ(wayNext(Waybook[edgetells[0]]))
            )}` +
            ` ` +
            `Z`,
        })
      );
      break;
    case 0:
      if (hasChurch(brickname)) {
        svg.append(
          makeSVGElement("path", {
            ...toSvgBrush(Brushwit.church),
            ...nookfulToSVGPath(reckonChurch(brickname, svgFrame())),
          })
        );
      }
      break;
  }

  if (hasShield(brickname)) {
    svg.append(
      makeSVGElement("rect", {
        ...toSvgBrush(Brushwit.shield),
        ...reckonShield(brickname, svgFrame()),
      })
    );
  }
};

const ringToSVGCircle = <K extends ZKind>(ring: Ring<K>) => {
  return {
    cx: ring.navel.x,
    cy: ring.navel.y,
    r: ring.halfwidth,
  };
};

const nookfulToSVGPath = <K extends ZKind>(nookful: Nookful<K, Roadnooks>) => {
  const svgPath = [];
  for (const nook of nookful) {
    svgPath.push(`L${withSpaces(nook)}`);
  }
  svgPath.push("Z");
  return { d: svgPath.join(" ").replace("L", "M") };
};
