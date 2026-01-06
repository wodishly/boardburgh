import type { BoardCanvas } from "../board";
import type { Game } from "../game";
import type { Zful } from "../help/reckon";
import type { Override } from "../help/type";
import {
  makeEater,
  updateEater,
  isKeycode,
  feed,
  wem,
  type KeyEater,
} from "../key";
import { resize } from "./eye";

type MouseState = "mousedown" | "mouseup" | "mousemove" | undefined;
type WheelState = "wheel" | undefined;

type Witstate = MouseState | WheelState;

type Wit<S extends Witstate> = Zful<"canvas"> & {
  state: S;
};

export type Wheelwit = Wit<WheelState>;

export type Mousewit = Wit<MouseState>;

export type Handle = {
  mouse: Mousewit;
  wheel: Wheelwit;
  eater: KeyEater;
};

export const makeHandle = (): Handle => {
  return {
    mouse: { z: { x: 0, y: 0, kind: "canvas" }, state: undefined },
    wheel: { z: { x: 0, y: 0, kind: "canvas" }, state: undefined },
    eater: makeEater(),
  };
};

export const updateHandle = (game: Game, now: number) => {
  updateEater(game, now);
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
    if (isKeycode(e.code)) {
      feed(handle.eater, e.code);
    }
  });
  window.addEventListener("keyup", (e) => {
    if (isKeycode(e.code)) {
      wem(handle.eater, e.code);
    }
  });
  return handle;
};
