import type { BoardCanvas } from "../board";
import type { Z } from "../help/reckon";
import { isShiftDown } from "../key";
import { type Handle } from "./handle";

export type Eye = {
  zoom: { scale: number; navel: Z<"canvas"> };
  pan: Z<"canvas">;
  greatness: Z<"canvas">;
};

export const makeEye = (
  handle: Handle,
  almostBoardCanvas: Pick<BoardCanvas, "element">
): Eye => {
  const eye = {
    zoom: { scale: 1, navel: { x: 0, y: 0, kind: "canvas" as const } },
    pan: { x: 0, y: 0, kind: "canvas" as const },
    greatness: {
      x: almostBoardCanvas.element.width,
      y: almostBoardCanvas.element.height,
      kind: "canvas" as const,
    },
  };
  window.addEventListener("wheel", () => setEye(eye, handle));
  return eye;
};

export const setEye = (eye: Eye, handle: Handle): Eye => {
  const wheelZ = handle.wheel.z;
  if (false && isShiftDown(handle)) {
    eye.zoom.scale -= wheelZ.y / 1000;
  } else {
    eye.pan.x -= wheelZ.x;
    eye.pan.y -= wheelZ.y;
  }
  return eye;
};

export const resize = ({ context: feather, eye }: BoardCanvas) => {
  feather.canvas.width = window.innerWidth;
  feather.canvas.height = window.innerHeight;
  eye.greatness = {
    x: window.innerWidth,
    y: window.innerHeight,
    kind: "canvas",
  };
};
