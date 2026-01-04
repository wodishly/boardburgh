import type { Brickname } from "../brick/brickshape";
import { toEdgeZ, Waybook, toNookZ } from "../brick/way";
import {
  toList,
  withSpaces,
  zLerp,
  zMinus,
  zTimes,
  type ZKind,
} from "../help/reckon";
import { flight } from "../help/rime";
import { Brushwit, Settings } from "../settings";
import { borrowContext } from "./canvas/canvas";
import { onesomeToWorld, worldToScreen } from "./draw";
import { type BrickshapeDraw } from "./draw-brickshape";
import type { Rectangle, Ring } from "./shape";
import { toSvgBrush, makeSVGElement } from "./svg/svg";

// todo: narrow to (0 | 1 | 2 | 3)[]
export const near = (roadEdges: number[]) => {
  return (roadEdges[0] - roadEdges[1]) % 4 === -1;
};

export const far = (roadEdges: number[]) => {
  return (roadEdges[0] - roadEdges[1]) % 4 === -2;
};

export const drawTwoRoadsNear: BrickshapeDraw = (
  feather,
  { navel, greatness },
  brickname,
  head
) => {
  const roadEdges = flight(4)
    .filter((i) => brickname[i] === "r")
    .map((i) => (i + Waybook.indexOf(head ?? "east")) % 4);
  const roadHalfwidth = Settings.draw.roadHalfwidth;

  const start = toEdgeZ(Waybook[roadEdges[0]]);
  const end = toEdgeZ(Waybook[roadEdges[1]]);
  const corner = toNookZ(Waybook[roadEdges[1]]);

  if (feather instanceof SVGSVGElement) {
    feather.append(
      makeSVGElement("path", {
        ...toSvgBrush(Brushwit.road),
        d:
          `M${withSpaces(
            onesomeToWorld({
              ...zLerp(corner, start, 1 + roadHalfwidth),
              kind: "svg",
            })
          )}` +
          ` ` +
          `A${withSpaces(
            zTimes(greatness, (1 + roadHalfwidth) / 2)
          )} 90 0 1 ${withSpaces(
            onesomeToWorld({
              ...zLerp(corner, end, 1 + roadHalfwidth),
              kind: "svg",
            })
          )}` +
          ` ` +
          `L${withSpaces(
            onesomeToWorld({
              ...zLerp(corner, end, 1 - roadHalfwidth),
              kind: "svg",
            })
          )}` +
          ` ` +
          `A${withSpaces(
            zTimes(greatness, (1 - roadHalfwidth) / 2)
          )} 90 0 0 ${withSpaces(
            onesomeToWorld({
              ...zLerp(corner, start, 1 - roadHalfwidth),
              kind: "svg",
            })
          )}` +
          ` ` +
          `Z`,
      })
    );
    return true;
  } else {
    borrowContext(feather.context, Brushwit.road, (context) => {
      context.arc(
        ...toList(
          worldToScreen(
            {
              x: navel.x + (corner.x * greatness.x) / 2,
              y: navel.y + (corner.y * greatness.y) / 2,
              kind: "world",
            },
            feather.eye
          )
        ),
        ((1 + (2 / 3) * Settings.draw.roadHalfwidth) *
          (greatness.x + greatness.y)) /
          4,
        (Math.PI / 2) * (roadEdges[0] + 1 + 2 * (roadEdges[0] % 2)),
        (Math.PI / 2) * (roadEdges[0] + 2 + 2 * (roadEdges[0] % 2))
      );
      context.lineTo(
        ...toList(
          worldToScreen(
            {
              x: navel.x + ((corner.x - start.x) * greatness.x) / 2,
              y: navel.y + ((corner.y - start.y) * greatness.y) / 2,
              kind: "world",
            },
            feather.eye
          )
        )
      );
      context.arc(
        ...toList(
          worldToScreen(
            {
              x: navel.x + (corner.x * greatness.x) / 2,
              y: navel.y + (corner.y * greatness.y) / 2,
              kind: "world",
            },
            feather.eye
          )
        ),
        ((1 - (2 / 3) * Settings.draw.roadHalfwidth) *
          (greatness.x + greatness.y)) /
          4,
        (Math.PI / 2) * (roadEdges[0] + 2 + 2 * (roadEdges[0] % 2)),
        (Math.PI / 2) * (roadEdges[0] + 1 + 2 * (roadEdges[0] % 2)),
        true
      );
    });
    return true;
  }
};

export const drawTwoRoadsFar: BrickshapeDraw = (
  feather,
  { navel, greatness },
  brickname,
  head
) => {
  const roadEdges = flight(4)
    .filter((i) => brickname[i] === "r")
    .map((i) => (i + Waybook.indexOf(head ?? "east")) % 4);
  const roadHalfwidth = Settings.draw.roadHalfwidth;

  if (feather instanceof SVGSVGElement) {
    feather.append(
      makeSVGElement("rect", {
        ...toSvgBrush(Brushwit.road),
        ...(roadEdges.includes(0)
          ? {
              x: navel.x - greatness.x / 2,
              y: navel.y - roadHalfwidth,
              width: greatness.x,
              height: 2 * roadHalfwidth,
            }
          : {
              x: navel.x - roadHalfwidth,
              y: navel.y - greatness.y / 2,
              width: 2 * roadHalfwidth,
              height: greatness.y,
            }),
      })
    );
    return true;
  } else {
    const widthHeight = worldToScreen(
      roadEdges.includes(0)
        ? {
            x: greatness.x,
            y: (2 / 3) * roadHalfwidth * greatness.y,
            kind: "world",
          }
        : {
            x: (2 / 3) * roadHalfwidth * greatness.x,
            y: greatness.y,
            kind: "world",
          },
      feather.eye,
      false
    );
    const topLeft = worldToScreen(
      { ...zMinus(navel, zTimes(widthHeight, 1 / 2)), kind: "world" },
      feather.eye
    );
    borrowContext(feather.context, Brushwit.road, (context) => {
      context.rect(topLeft.x, topLeft.y, widthHeight.x, widthHeight.y);
    });
    return true;
  }
};

export const drawNotTwoRoads: BrickshapeDraw = (
  feather,
  { navel, greatness },
  brickname,
  head
) => {
  const roadEdges = flight(4)
    .filter((i) => brickname[i] === "r")
    .map((i) => (i + Waybook.indexOf(head ?? "east")) % 4);
  const roadHalfwidth = Settings.draw.roadHalfwidth;

  if (feather instanceof SVGSVGElement) {
    for (const i of roadEdges) {
      feather.append(
        makeSVGElement("rect", {
          ...toSvgBrush(Brushwit.road),
          x: navel.x - (i === 2 ? greatness.x / 2 : roadHalfwidth),
          y: navel.y - (i === 1 ? greatness.y / 2 : roadHalfwidth),
          width: roadHalfwidth + (i % 2 ? roadHalfwidth : greatness.x / 2),
          height: roadHalfwidth + (i % 2 ? greatness.y / 2 : roadHalfwidth),
        })
      );
    }
    return true;
  } else {
    for (const i of roadEdges) {
      const widthHeight = worldToScreen(
        {
          x: i % 2 ? (2 / 3) * roadHalfwidth * greatness.x : greatness.x / 2,
          y: i % 2 ? greatness.y / 2 : (2 / 3) * roadHalfwidth * greatness.y,
          kind: "world",
        },
        feather.eye,
        false
      );
      const topLeft = worldToScreen(
        {
          x:
            navel.x +
            (i === 0 ? greatness.x / 4 : i === 2 ? -greatness.x / 4 : 0) -
            widthHeight.x / 2,
          y:
            navel.y +
            (i === 3 ? greatness.y / 4 : i === 1 ? -greatness.y / 4 : 0) -
            widthHeight.y / 2,
          kind: "world",
        },
        feather.eye
      );
      borrowContext(feather.context, Brushwit.road, (context) => {
        context.rect(topLeft.x, topLeft.y, widthHeight.x, widthHeight.y);
      });
    }
    return true;
  }
};

export const drawTown: BrickshapeDraw = (feather, { navel, greatness }) => {
  const townR = (((greatness.x + greatness.y) / 2) * 3) / 16;

  if (feather instanceof SVGSVGElement) {
    feather.append(
      makeSVGElement("circle", {
        ...toSvgBrush(Brushwit.town),
        cx: navel.x,
        cy: navel.y,
        r: townR,
      })
    );
    return true;
  } else {
    borrowContext(feather.context, Brushwit.town, (context) => {
      context.arc(
        ...toList(worldToScreen(navel, feather.eye)),
        feather.eye.zoom.scale * townR,
        0,
        2 * Math.PI
      );
    });
    return true;
  }
};

export const drawChurch: BrickshapeDraw = (feather, { navel, greatness }) => {
  const churchR = (greatness.x + greatness.y) / 2 / 4;

  if (feather instanceof SVGSVGElement) {
    feather.append(
      makeSVGElement("circle", {
        ...toSvgBrush(Brushwit.church),
        cx: navel.x,
        cy: navel.y,
        r: churchR,
      })
    );
    return true;
  } else {
    borrowContext(feather.context, Brushwit.church, (context) => {
      context.arc(
        ...toList(worldToScreen(navel, feather.eye)),
        feather.eye.zoom.scale * churchR,
        0,
        2 * Math.PI
      );
    });
    return true;
  }
};
