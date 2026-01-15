import type { BoardCanvas } from "../board";
import { roundTo, zMinus, zPlus, zTimes, type Z } from "../help/reckon";
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
    zoom: {
      scale: 1,
      navel: {
        x: almostBoardCanvas.element.width / 2,
        y: almostBoardCanvas.element.height / 2,
        kind: "canvas" as const,
      },
    },
    pan: { x: 0, y: 0, kind: "canvas" as const },
    greatness: {
      x: almostBoardCanvas.element.width,
      y: almostBoardCanvas.element.height,
      kind: "canvas" as const,
    },
  };
  return eye;
};

export const setEye = (eye: Eye, handle: Handle): Eye => {
  const wheelZ = handle.mouse.wheel.z;
  if (handle.mouse.wheel.ctrlKey) {
    eye.zoom.navel = handle.mouse.pointer.z;
    const oldScale = eye.zoom.scale;
    eye.zoom.scale = Math.max(1 / 512, eye.zoom.scale - wheelZ.y / 512);
    eye.pan = zPlus(
      eye.zoom.navel,
      zTimes(zMinus(eye.pan, eye.zoom.navel), eye.zoom.scale / oldScale)
    );
  } else {
    eye.pan.x -= wheelZ.x;
    eye.pan.y -= wheelZ.y;
  }
  console.log(
    `pan: (${roundTo(eye.pan.x, 2)}, ${roundTo(eye.pan.y, 2)})` +
      `\n` +
      `zoom: ${roundTo(eye.zoom.scale, 2)}`
  );
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
