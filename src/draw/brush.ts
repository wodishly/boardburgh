import type { Brick } from "../brick/brickstate";
import { z, type Z } from "../help/reckon";
import { ly } from "../help/type";
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

export const sweetch = (worldZ: Z<"world">, eye: Eye, pan: Z<"canvas">) => {
  return ly(
    eye.zoom.oldNavel === eye.zoom.newNavel
      ? 1
      : (() => {
          const oldFarth = Math.sqrt(
            (worldZ.x + pan.x - eye.zoom.oldNavel.x) ** 2 +
              (worldZ.y + pan.y - eye.zoom.oldNavel.y) ** 2
          );
          const newFarth = Math.sqrt(
            (worldZ.x + pan.x - eye.zoom.newNavel.x) ** 2 +
              (worldZ.y + pan.y - eye.zoom.newNavel.y) ** 2
          );
          return newFarth / oldFarth;
        })()
  );
};

export const worldToCanvas = (
  worldZ: Z<"world">,
  eye: Eye,
  doPan = true
): Z<"canvas"> => {
  const pan = doPan ? eye.pan : z(0, 0, "canvas");
  const sw = sweetch(worldZ, eye, pan);
  return {
    x:
      eye.zoom.newNavel.x +
      sw * eye.zoom.scale * (worldZ.x + pan.x - eye.zoom.newNavel.x),
    y:
      eye.zoom.newNavel.y +
      sw * eye.zoom.scale * (worldZ.y + pan.y - eye.zoom.newNavel.y),
    kind: "canvas" as const,
  };
};

export const canvasToWorld = (
  canvasZ: Z<"canvas">,
  eye: Eye,
  doPan = true
): Z<"world"> => {
  const pan = doPan ? eye.pan : z(0, 0, "canvas");
  return {
    x:
      (canvasZ.x - eye.zoom.newNavel.x) / eye.zoom.scale -
      pan.x +
      eye.zoom.newNavel.x,
    y:
      (canvasZ.y - eye.zoom.newNavel.x) / eye.zoom.scale -
      pan.y +
      eye.zoom.newNavel.y,
    kind: "world" as const,
  };
};
