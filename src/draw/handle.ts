import type { BoardCanvas } from "../board";
import type { Game } from "../game";
import type { Zful } from "../help/reckon";
import type { Maybe } from "../help/type";
import {
  makeEater,
  updateEater,
  isKeycode,
  feed,
  wem,
  type KeyEater,
} from "../key";
import { resize } from "./eye";

export type Mouse = Zful<"canvas"> & {
  move: Maybe<"mousemove">;
  knob: Maybe<"mousedown" | "mouseup">;
  wheel: Wheel;
  layer: MouseLayer[];
};

export type MouseLayer = "slab" | "friend" | "brick";

export type Wheel = Zful<"canvas"> & {
  state: Maybe<"wheel">;
};

export type Handle = {
  mouse: Mouse;
  eater: KeyEater;
};

export const makeHandle = (): Handle => {
  return {
    mouse: {
      z: { x: 0, y: 0, kind: "canvas" },
      move: undefined,
      knob: undefined,
      wheel: { z: { x: 0, y: 0, kind: "canvas" }, state: undefined },
      layer: [],
    },
    eater: makeEater(),
  };
};

export const updateHandle = (game: Game, now: number) => {
  updateEater(game, now);
  game.state.handle.mouse.move = undefined;
  game.state.handle.mouse.layer.length = 0;
};

export const addListener = <K extends keyof WindowEventMap>(
  type: K,
  listener: (event: WindowEventMap[K]) => void
) => {
  window.addEventListener(type, listener);
};

export const wakeHandle = (
  handle: Handle,
  boardCanvas: BoardCanvas
): Handle => {
  window.addEventListener("resize", () => {
    resize(boardCanvas);
  });
  window.addEventListener("mousedown", (e) => {
    handle.mouse.z = { x: e.clientX, y: e.clientY, kind: "canvas" };
    handle.mouse.knob = "mousedown";
  });
  window.addEventListener("mouseup", (e) => {
    handle.mouse.z = { x: e.clientX, y: e.clientY, kind: "canvas" };
    handle.mouse.knob = "mouseup";
  });
  window.addEventListener("mousemove", (e) => {
    handle.mouse.z = { x: e.clientX, y: e.clientY, kind: "canvas" };
    handle.mouse.move = "mousemove";
  });
  window.addEventListener("wheel", (e) => {
    handle.mouse.wheel.z = { x: e.deltaX, y: e.deltaY, kind: "canvas" };
    handle.mouse.wheel.state = "wheel";
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
