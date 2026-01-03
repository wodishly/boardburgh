import type { BoardCanvas } from "../board";
import type { Zful } from "../help/reckon";
import type { Override } from "../help/type";
import { resize } from "./eye";

export type Keycode = KeyboardEvent["code"];
export type MouseState = "mousedown" | "mouseup" | "mousemove" | undefined;
export type WheelState = "wheel" | undefined;

type Witstate = MouseState | WheelState;

type Wit<S extends Witstate> = Zful<"canvas"> & {
  state: S;
};

export type Wheelwit = Wit<WheelState>;

export type Mousewit = Wit<MouseState>;

export type Handle = {
  mouse: Mousewit;
  wheel: Wheelwit;
  keys: Keycode[];
};

export const isShiftDown = ({ keys }: Handle) => {
  return keys.includes("ShiftLeft") || keys.includes("ShiftRight");
};

export const makeHandle = (): Handle => {
  return {
    mouse: { z: { x: 0, y: 0, kind: "canvas" }, state: undefined },
    wheel: { z: { x: 0, y: 0, kind: "canvas" }, state: undefined },
    keys: [],
  };
};

export const wakeHandle = (
  handle: Handle,
  boardCanvas: BoardCanvas
): Handle => {
  window.addEventListener("resize", () => {
    resize(boardCanvas);
  });
  window.addEventListener("mousedown", (e) => {
    handle.mouse = {
      z: { x: e.clientX, y: e.clientY, kind: "canvas" },
      state: e.type as Override<"mousedown">,
    };
  });
  window.addEventListener("mouseup", (e) => {
    handle.mouse = {
      z: { x: e.clientX, y: e.clientY, kind: "canvas" },
      state: e.type as Override<"mouseup">,
    };
  });
  window.addEventListener("mousemove", (e) => {
    handle.mouse = {
      z: { x: e.clientX, y: e.clientY, kind: "canvas" },
      state: e.type as Override<"mousemove">,
    };
  });
  window.addEventListener("wheel", (e) => {
    handle.wheel = {
      z: { x: e.deltaX, y: e.deltaY, kind: "canvas" },
      state: e.type as Override<"wheel">,
    };
  });
  window.addEventListener("keydown", (e) => {
    if (!handle.keys.includes(e.code)) {
      handle.keys.push(e.code);
    }
  });
  window.addEventListener("keyup", (e) => {
    if (handle.keys.includes(e.code)) {
      handle.keys = handle.keys.filter((key) => key !== e.code);
    }
  });
  return handle;
};
