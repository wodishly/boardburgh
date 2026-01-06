import { Brushwit, Settings, Stavewit } from "../settings";
import { zMinus, zPlus, zTimes, toList, type Z } from "../help/reckon";
import type { BoardCanvas } from "../board";
import type { Eye } from "./eye";
import { worldToCanvas, type Brush } from "./brush";
import type { Rectangle, Ring } from "./shape";
import { swap, type Override } from "../help/type";
import {
  hasChurch,
  hasCurvedRoad,
  hasRoad,
  hasShield,
  hasTown,
  type Brickname,
} from "../brick/brickname";
import { edgetellsOf } from "../brick/edge";
import {
  toNookZ,
  waynameOf,
  wayNext,
  toEdgeZ,
  type Waytell,
  toFarthing,
  Waybook,
  waytellOf,
} from "../help/way";
import {
  reckonChurch,
  reckonShield,
  reckonStraightRoad,
  reckonTown,
} from "./brickreckon";

export type CanvasBrush = Pick<Brush, "textAlign" | "textBaseline"> & {
  [K in keyof Brush as K extends `${infer T}Color`
    ? `${T}Style`
    : never]: Brush[K];
} & Record<"font", `${Brush["fontSize"]}px ${Brush["fontFace"]}`> &
  Record<"lineWidth", Brush["strokeWidth"]>;

export const toCanvasBrush = (brush: Partial<Brush>): Partial<CanvasBrush> => {
  return Object.assign(
    {},
    {
      ...("fillColor" in brush ? { fillStyle: brush.fillColor } : {}),
      ...("strokeColor" in brush ? { strokeStyle: brush.strokeColor } : {}),
      ...("strokeWidth" in brush ? { lineWidth: brush.strokeWidth } : {}),
      ...("fontSize" in brush || "fontFace" in brush
        ? {
            font: (`${brush.fontSize ?? Stavewit.fontSize}px` +
              ` ` +
              `${brush.fontFace ?? Stavewit.fontFace}`) as Override<
              CanvasBrush["font"]
            >,
          }
        : {}),
      ...("textAlign" in brush ? { textAlign: brush.textAlign } : {}),
      ...("textBaseline" in brush ? { textBaseline: brush.textBaseline } : {}),
    }
  );
};

type CanvasDraw = (context: CanvasRenderingContext2D) => void;

type CanvasDrawWit = {
  brush: Partial<Brush>;
  dontFill?: boolean;
  dontStroke?: boolean;
  wend?: CanvasWend;
};

type CanvasWend = {
  navel: Z<"canvas">;
  winkle: number;
};

export const withBorrowedContext = (
  context: CanvasRenderingContext2D,
  wit: CanvasDrawWit,
  callback: CanvasDraw
) => {
  const { wend, brush } = wit;

  const oldContext = context;
  Object.assign(context, toCanvasBrush(Brushwit.mean), toCanvasBrush(brush));

  if (wend) {
    context.save();
    context.translate(wend.navel.x, wend.navel.y);
    context.rotate(wend.winkle);
  }

  context.beginPath();
  callback(context);
  context.closePath();

  if (!wit?.dontFill) context.fill();
  if (!wit?.dontStroke) context.stroke();

  if (wend) {
    context.restore();
  }

  Object.assign(context, oldContext);
};

export const withBorrowedContextForText = (
  context: CanvasRenderingContext2D,
  wit: CanvasDrawWit,
  staves: string,
  { x, y }: Z<"canvas">
) => {
  const { wend, brush } = wit;

  const oldContext = context;
  Object.assign(context, toCanvasBrush(Stavewit), toCanvasBrush(brush));

  if (wend) {
    context.save();
    context.translate(wend.navel.x, wend.navel.y);
    context.rotate(wend.winkle);
  }
  context.fillText(staves, x - (wend?.navel.x ?? 0), y - (wend?.navel.y ?? 0));

  if (wend) {
    context.restore();
  }

  Object.assign(context, oldContext);
};

export const zoom = (z: Z<"canvas">, eye: Eye): Z<"canvas"> => {
  return {
    ...zPlus(eye.pan, zTimes(zMinus(z, eye.pan), eye.zoom.scale)),
    kind: "canvas",
  };
};

export const wipe = ({ context }: BoardCanvas) => {
  context.clearRect(0, 0, context.canvas.width, context.canvas.height);
};

export const ringdeal = (
  { eye, context }: BoardCanvas,
  { navel, halfwidth }: Ring<"world">,
  start: number,
  end: number,
  brush: Partial<Brush> = {}
) => {
  const { fillStyle, strokeStyle, lineWidth } = context;

  if (brush.fillColor) context.fillStyle = brush.fillColor;
  if (brush.strokeColor) context.strokeStyle = brush.strokeColor;
  if (brush.strokeWidth) context.lineWidth = brush.strokeWidth * eye.zoom.scale;

  context.beginPath();
  context.arc(
    ...toList(worldToCanvas(navel, eye)),
    eye.zoom.scale * halfwidth,
    start,
    end
  );
  context.closePath();

  if (brush.fillColor) context.fill();
  if (brush.strokeColor) context.stroke();

  context.fillStyle = fillStyle;
  context.strokeStyle = strokeStyle;
  context.lineWidth = lineWidth;

  return true as const;
};

export const drawFieldToCanvas = (
  context: CanvasRenderingContext2D,
  wend: CanvasWend,
  brickframe: Rectangle<"canvas">
) => {
  withBorrowedContext(context, { brush: Brushwit.field, wend }, (context) => {
    context.rect(
      -brickframe.width / 2,
      -brickframe.height / 2,
      brickframe.width,
      brickframe.height
    );
  });
};

export const drawRoadToCanvas = (
  context: CanvasRenderingContext2D,
  wend: CanvasWend,
  brickframe: Rectangle<"canvas">,
  brickname: Brickname
) => {
  if (hasRoad(brickname)) {
    if (hasCurvedRoad(brickname)) {
      const almostEdgetells = edgetellsOf(brickname, "r");
      const edgetells =
        almostEdgetells[0] === 0 && almostEdgetells[1] === 3
          ? swap(almostEdgetells)
          : almostEdgetells;
      const nookZ = toNookZ(waynameOf(edgetells[1]));
      const halfwidths = [
        ((1 - Settings.draw.roadHalfwidth) *
          (brickframe.width + brickframe.height)) /
          2 /
          2,
        ((1 + Settings.draw.roadHalfwidth) *
          (brickframe.width + brickframe.height)) /
          2 /
          2,
      ];
      withBorrowedContext(
        context,
        { brush: Brushwit.road, wend },
        (context) => {
          context.arc(
            (nookZ.x * brickframe.width) / 2,
            (nookZ.y * brickframe.height) / 2,
            halfwidths[0],
            (Math.PI / 2) *
              (2 * +(edgetells[0] === 1) +
                waytellOf(wayNext(waynameOf(edgetells[0])))),
            (Math.PI / 2) *
              (2 * +(edgetells[0] === 1) +
                waytellOf(wayNext(waynameOf(edgetells[1]))))
          );
          context.arc(
            (nookZ.x * brickframe.width) / 2,
            (nookZ.y * brickframe.height) / 2,
            halfwidths[1],
            (Math.PI / 2) *
              (2 * +(edgetells[0] === 1) +
                waytellOf(wayNext(waynameOf(edgetells[1])))),
            (Math.PI / 2) *
              (2 * +(edgetells[0] === 1) +
                waytellOf(wayNext(waynameOf(edgetells[0])))),
            true
          );
        }
      );
    } else {
      const nooks = reckonStraightRoad(brickname, {
        ...brickframe,
        x: -brickframe.width / 2,
        y: -brickframe.height / 2,
      });
      withBorrowedContext(
        context,
        { brush: Brushwit.road, wend },
        (context) => {
          context.moveTo(nooks[0].x, nooks[0].y);
          for (let i = 1; i < nooks.length; i++) {
            context.lineTo(nooks[i].x, nooks[i].y);
          }
        }
      );
    }
    if (hasTown(brickname)) {
      const town = reckonTown(brickname, {
        ...brickframe,
        x: -brickframe.width / 2,
        y: -brickframe.height / 2,
      });
      withBorrowedContext(
        context,
        { brush: Brushwit.town, wend },
        (context) => {
          context.arc(
            town.navel.x,
            town.navel.y,
            town.halfwidth,
            0,
            2 * Math.PI
          );
        }
      );
    }
  }
};

export const drawCityToCanvas = (
  context: CanvasRenderingContext2D,
  wend: CanvasWend,
  brickframe: Rectangle<"canvas">,
  brickname: Brickname
) => {
  const edgetells = edgetellsOf(brickname, "c");
  switch (edgetells.length) {
    case 4:
      withBorrowedContext(
        context,
        { brush: Brushwit.city, wend },
        (context) => {
          context.rect(
            -brickframe.width / 2,
            -brickframe.height / 2,
            brickframe.width,
            brickframe.height
          );
        }
      );
      break;
    case 3:
      withBorrowedContext(
        context,
        { brush: Brushwit.city, wend },
        (context) => {
          const startNook = toNookZ(waynameOf(0));
          context.moveTo(
            (startNook.x * brickframe.width) / 2,
            (startNook.y * brickframe.height) / 2
          );
          for (let i = 0; i < 4; i++) {
            if (
              edgetells[0] === i ||
              edgetells[1] === i ||
              edgetells[2] === i
            ) {
              const thisNook = toNookZ(waynameOf(i));
              context.lineTo(
                (thisNook.x * brickframe.width) / 2,
                (thisNook.y * brickframe.height) / 2
              );
              const nextNook = toNookZ(wayNext(waynameOf(i)));
              context.lineTo(
                (nextNook.x * brickframe.width) / 2,
                (nextNook.y * brickframe.height) / 2
              );
            } else {
              const edgeZ = toEdgeZ(waynameOf(i as Override<Waytell>));
              const navel = {
                x: edgeZ.x * brickframe.width,
                y: edgeZ.y * brickframe.height,
                kind: "canvas",
              };
              context.arc(
                navel.x,
                navel.y,
                (brickframe.width + brickframe.height) / 2 / Math.sqrt(2),
                -Math.PI / 4 +
                  toFarthing(wayNext(waynameOf(edgetells[i])), "canvas"),
                -Math.PI / 4 + toFarthing(waynameOf(edgetells[i]), "canvas")
              );
            }
          }
        }
      );
      break;
    case 2:
      if ((edgetells[1] - edgetells[0]) % 2 === 0) {
        withBorrowedContext(
          context,
          { brush: Brushwit.city, wend },
          (context) => {
            const startNook = toNookZ(waynameOf(0));
            context.moveTo(
              (startNook.x * brickframe.width) / 2,
              (startNook.y * brickframe.height) / 2
            );
            // todo: north–south case
            if (edgetells[0] === 0) {
              const nooks = [
                toNookZ(waynameOf(0)),
                toNookZ(waynameOf(1)),
                toNookZ(waynameOf(2)),
              ] as const;
              const edges = [
                toEdgeZ(waynameOf(1)),
                toEdgeZ(waynameOf(3)),
              ] as const;
              context.moveTo(
                (nooks[0].x * brickframe.width) / 2,
                (nooks[0].y * brickframe.height) / 2
              );
              context.lineTo(
                (nooks[1].x * brickframe.width) / 2,
                (nooks[1].y * brickframe.height) / 2
              );
              context.arc(
                edges[0].x * brickframe.width,
                edges[0].y * brickframe.height,
                (brickframe.width + brickframe.height) / 2 / Math.sqrt(2),
                Math.PI / 4,
                (Math.PI * 3) / 4
              );
              context.lineTo(
                (nooks[2].x * brickframe.width) / 2,
                (nooks[2].y * brickframe.height) / 2
              );
              context.arc(
                edges[1].x * brickframe.width,
                edges[1].y * brickframe.height,
                (brickframe.width + brickframe.height) / 2 / Math.sqrt(2),
                (Math.PI * 5) / 4,
                (Math.PI * 7) / 4
              );
            }
          }
        );
      } else {
        withBorrowedContext(
          context,
          { brush: Brushwit.city, wend },
          (context) => {
            const nooks =
              edgetells[0] === 0 && edgetells[1] === 3
                ? [
                    toNookZ(waynameOf(edgetells[1])),
                    toNookZ(waynameOf(edgetells[0])),
                    toNookZ(wayNext(waynameOf(edgetells[0]))),
                  ]
                : [
                    toNookZ(waynameOf(edgetells[0])),
                    toNookZ(waynameOf(edgetells[1])),
                    toNookZ(wayNext(waynameOf(edgetells[1]))),
                  ];
            context.moveTo(
              (nooks[0].x * brickframe.width) / 2,
              (nooks[0].y * brickframe.height) / 2
            );
            context.lineTo(
              (nooks[1].x * brickframe.width) / 2,
              (nooks[1].y * brickframe.height) / 2
            );
            context.lineTo(
              (nooks[2].x * brickframe.width) / 2,
              (nooks[2].y * brickframe.height) / 2
            );
          }
        );
      }
      break;
    case 1:
      const edgeZ = toEdgeZ(Waybook[edgetells[0]]);
      const navel = {
        x: edgeZ.x * brickframe.width,
        y: edgeZ.y * brickframe.height,
        kind: "canvas",
      };
      withBorrowedContext(
        context,
        { brush: Brushwit.city, wend },
        (context) => {
          context.arc(
            navel.x,
            navel.y,
            (brickframe.width + brickframe.height) / 2 / Math.sqrt(2),
            -Math.PI / 4 +
              toFarthing(wayNext(waynameOf(edgetells[0])), "canvas"),
            -Math.PI / 4 + toFarthing(waynameOf(edgetells[0]), "canvas")
          );
        }
      );
      break;
    case 0:
      if (hasChurch(brickname)) {
        const church = reckonChurch(brickname, {
          ...brickframe,
          x: -brickframe.width / 2,
          y: -brickframe.height / 2,
        });
        withBorrowedContext(
          context,
          { brush: Brushwit.church, wend },
          (context) => {
            context.moveTo(church[0].x, church[0].y);
            for (let i = 1; i < church.length; i++) {
              context.lineTo(church[i].x, church[i].y);
            }
          }
        );
      }
      break;
  }
};

export const drawShieldToCanvas = (
  context: CanvasRenderingContext2D,
  wend: CanvasWend,
  brickframe: Rectangle<"canvas">,
  brickname: Brickname
) => {
  if (hasShield(brickname)) {
    const shield = reckonShield(brickname, {
      ...brickframe,
      x: -brickframe.width / 2,
      y: -brickframe.height / 2,
    });
    withBorrowedContext(
      context,
      { brush: Brushwit.shield, wend },
      (context) => {
        context.roundRect(
          shield.x,
          shield.y,
          shield.width,
          shield.height,
          (shield.rx + shield.ry) / 2
        );
      }
    );
  }
};
