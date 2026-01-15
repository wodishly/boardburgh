import type { Brick } from "../brick/brickstate";
import { z, type Z } from "../help/reckon";
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
  worldZ: Z<"world">,
  eye: Eye,
  doPan = true
): Z<"canvas"> => {
  const panZ = doPan ? eye.pan : z(0, 0, "canvas");
  return {
    x: eye.zoom.scale * worldZ.x + panZ.x,
    y: eye.zoom.scale * worldZ.y + panZ.y,
    kind: "canvas" as const,
  };
};

export const canvasToWorld = (
  canvasZ: Z<"canvas">,
  eye: Eye,
  doPan = true
): Z<"world"> => {
  const panZ = doPan ? eye.pan : z(0, 0, "canvas");
  return {
    x: (canvasZ.x - panZ.x) / eye.zoom.scale,
    y: (canvasZ.y - panZ.y) / eye.zoom.scale,
    kind: "world" as const,
  };
};
