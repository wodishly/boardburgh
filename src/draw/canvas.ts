import { type GameDiv } from "./html/game-div";
import { Brushwit, Settings, Stavewit } from "../settings";
import type { Brick } from "../brick/brickstate";
import { wayPlus, type Wayname, Waybook } from "../brick/way";
import { zMinus, zPlus, zTimes, toList, type Z } from "../help/reckon";
import type { BoardCanvas } from "../board";
import type { Eye } from "./eye";
import { worldToCanvas, type Brush } from "./brush";
import type { Ring } from "./shape";
import type { Override } from "../help/type";

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
  if (!wit?.dontFill)
    context.fillText(
      staves,
      x - (wend?.navel.x ?? 0),
      y - (wend?.navel.y ?? 0)
    );
  if (!wit?.dontStroke)
    context.strokeText(
      staves,
      x - (wend?.navel.x ?? 0),
      y - (wend?.navel.y ?? 0)
    );

  if (wend) {
    context.restore();
  }

  Object.assign(context, oldContext);
};

/**
 * @param way before spinning
 */
export const drawFarthing = (
  div: GameDiv,
  brick: Brick,
  way: Wayname,
  scale = 1
) => {
  const { start, end } = reckonEnds(brick, wayPlus(brick.head, way), scale);

  switch (brick.edges[way]) {
    case "city":
      ringdeal(
        div.boardframeDiv.boardCanvas,
        {
          navel: {
            x: start.x + end.x - brick.z.x,
            y: start.y + end.y - brick.z.y,
            kind: "world",
          },
          halfwidth: Settings.brickLength / Math.sqrt(2),
        },
        (Math.PI / 4) * (3 - 2 * Waybook.indexOf(wayPlus(brick.head, way))),
        (Math.PI / 4) * (5 - 2 * Waybook.indexOf(wayPlus(brick.head, way))),
        {
          fillColor: "brown",
        }
      );
      return;
  }
};

export const reckonEnds = (brick: Brick, way: Wayname, scale = 1) => {
  const start = {
    x:
      brick.z.x +
      ((way === "north" || way === "east" ? 1 : -1) *
        scale *
        Settings.brickLength) /
        2,
    y:
      brick.z.y +
      ((way === "south" || way === "east" ? 1 : -1) *
        scale *
        Settings.brickLength) /
        2,
    kind: "world" as const,
  };
  const end = {
    x:
      start.x +
      (way === "east" || way === "west" ? 0 : way === "south" ? 1 : -1) *
        scale *
        Settings.brickLength,
    y:
      start.y +
      (way === "north" || way === "south" ? 0 : way === "west" ? 1 : -1) *
        scale *
        Settings.brickLength,
    kind: "world" as const,
  };
  return { start, end };
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
