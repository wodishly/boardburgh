import type { Brick } from "../brick/brickstate";
import type { Z } from "../help/reckon";
import type { Eye } from "./eye";
import { fg } from "./html/div/div";

export type Brush = {
  fillColor: string;
  strokeColor: string;
  strokeWidth: number;
  fontSize: number;
  fontFace: string;
  textAlign: CanvasTextAlign;
  textBaseline: CanvasTextBaseline;
};

export const edgebrushOf = (brick: Brick): Partial<Brush> => {
  switch (brick.state) {
    case "fresh":
      return { strokeWidth: 2, strokeColor: "red" };
    case "live":
      return { strokeWidth: 2, strokeColor: "red" };
    case "nearby":
      return { strokeWidth: 2, strokeColor: "orange" };
    case "hover1":
    case "hover2":
      return { strokeWidth: 4, strokeColor: fg() };
    case "drag":
    case "spin":
      return { strokeWidth: 4, strokeColor: "red" };
    case "choose":
      return { strokeWidth: 2, strokeColor: "red" };
    case "drop":
      return { strokeWidth: 2, strokeColor: "black" };
    case "frozen":
      return { strokeWidth: 2, strokeColor: "white" };
  }
  brick.state satisfies never;
};

export const worldToCanvas = (
  z: Z<"world">,
  eye: Eye,
  doPan = true
): Z<"canvas"> => {
  return {
    x: eye.zoom.scale * (z.x + (doPan ? eye.pan.x : 0)),
    y: eye.zoom.scale * (z.y + (doPan ? eye.pan.y : 0)),
    kind: "canvas" as const,
  };
};

export const canvasToWorld = (
  z: Z<"canvas">,
  eye: Eye,
  doPan = true
): Z<"world"> => {
  return {
    x: (z.x - (doPan ? eye.pan.x : 0)) / eye.zoom.scale,
    y: (z.y - (doPan ? eye.pan.y : 0)) / eye.zoom.scale,
    kind: "world" as const,
  };
};
