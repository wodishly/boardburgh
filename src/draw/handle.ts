import type { BoardCanvas } from "../board";
import { type Game } from "../game";
import { z, type Zful } from "../help/reckon";
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

export const State = {
  Mouse: {
    Pointer: {
      Move: "pointermove",
      Down: "pointerdown",
      Up: "pointerup",
    },
    Wheel: "wheel",
  },
  Key: {
    Down: "keydown",
    Up: "keyup",
  },
} as const;

export type Mouse<
  P extends PointerState = PointerState,
  W extends WheelState = WheelState,
  Q extends PointerState = PointerState
> = {
  pointer: Pointer<P>;
  otherPointer: Pointer<Q>;
  wheel: Wheel<W>;
  layer: MouseLayer[];
};

type Pointer<P extends PointerState = PointerState> = Zful<"canvas"> & {
  pointerId: number;
  knob: Extract<P, "pointerdown" | "pointerup" | undefined>;
  move: Extract<P, "pointermove" | undefined>;
};

export type PointerState =
  | (typeof State.Mouse.Pointer)[keyof typeof State.Mouse.Pointer]
  | undefined;

type WheelState = typeof State.Mouse.Wheel;

export const hasPointerState = <P extends PointerState>(
  mouse: Mouse,
  state: P
): mouse is Mouse<P> => {
  return state === mouse.pointer.move || state === mouse.pointer.knob;
};

export const isPointerMove = (mouse: Mouse): mouse is Mouse<"pointermove"> => {
  return mouse.pointer.move === State.Mouse.Pointer.Move;
};

export const isPointerDown = (mouse: Mouse): mouse is Mouse<"pointerdown"> => {
  return mouse.pointer.knob === State.Mouse.Pointer.Down;
};

export const isPointerUp = (mouse: Mouse): mouse is Mouse<"pointerup"> => {
  return mouse.pointer.knob === State.Mouse.Pointer.Up;
};

export type MouseLayer = "slab" | "friend" | "brick";

export type Wheel<W extends WheelState = WheelState> = Zful<"canvas"> & {
  state: Maybe<W>;
};

export type Handle = {
  mouse: Mouse;
  eater: KeyEater;
};

export const makeHandle = (): Handle => {
  return {
    mouse: {
      pointer: {
        z: z(NaN, NaN, "canvas"),
        pointerId: -1,
        knob: undefined,
        move: undefined,
      },
      otherPointer: {
        z: z(NaN, NaN, "canvas"),
        pointerId: -1,
        knob: undefined,
        move: undefined,
      },
      wheel: { z: z(0, 0, "canvas"), state: undefined },
      layer: [],
    },
    eater: makeEater(),
  };
};

export const updateHandle = (game: Game, now: number) => {
  const mouse = game.state.handle.mouse;
  if (mouse.pointer.knob === "pointerup") {
    mouse.pointer.knob = undefined;
  }
  if (mouse.pointer.move === "pointermove") {
    mouse.pointer.move = undefined;
  }
  if (mouse.otherPointer.knob === "pointerup") {
    mouse.otherPointer.knob = undefined;
  }
  if (mouse.otherPointer.move === "pointermove") {
    mouse.otherPointer.move = undefined;
  }
  mouse.layer.length = 0;
  updateEater(game, now);
};

export const addListener = <K extends keyof WindowEventMap>(
  type: K,
  listener: (event: WindowEventMap[K]) => void
) => {
  window.addEventListener(type, listener);
};

const getFirstFreePointerKey = (
  mouse: Mouse
): "pointer" | "otherPointer" | undefined => {
  if (mouse.pointer === undefined || mouse.pointer.pointerId === -1) {
    return "pointer";
  } else if (
    mouse.otherPointer === undefined ||
    mouse.pointer.pointerId === -1
  ) {
    return "otherPointer";
  } else {
    return undefined;
  }
};

const getPointerKeyById = (
  mouse: Mouse,
  pointerId: number
): "pointer" | "otherPointer" | undefined => {
  if (
    mouse.otherPointer !== undefined &&
    mouse.otherPointer.pointerId === pointerId
  ) {
    return "otherPointer";
  } else if (
    mouse.pointer !== undefined &&
    mouse.pointer.pointerId === pointerId
  ) {
    return "pointer";
  } else {
    return undefined;
  }
};

export const wakeHandle = (
  handle: Handle,
  boardCanvas: BoardCanvas
): Handle => {
  window.addEventListener("resize", () => {
    resize(boardCanvas);
  });
  window.addEventListener("contextmenu", (e) => {
    e.preventDefault();
  });
  window.addEventListener("pointerdown", (e) => {
    const key =
      getPointerKeyById(handle.mouse, e.pointerId) ??
      getFirstFreePointerKey(handle.mouse);
    if (key !== undefined) {
      Object.assign(handle.mouse[key], {
        z: { x: e.clientX, y: e.clientY, kind: "canvas" },
        pointerId: e.pointerId,
        knob: State.Mouse.Pointer.Down,
      });
    }
  });
  window.addEventListener("pointerup", (e) => {
    const key =
      getPointerKeyById(handle.mouse, e.pointerId) ??
      getFirstFreePointerKey(handle.mouse);
    if (key !== undefined) {
      Object.assign(handle.mouse[key], {
        z: { x: e.clientX, y: e.clientY, kind: "canvas" },
        pointerId: e.pointerId,
        knob: State.Mouse.Pointer.Up,
      });
    }
  });
  window.addEventListener("pointermove", (e) => {
    const key =
      getPointerKeyById(handle.mouse, e.pointerId) ??
      getFirstFreePointerKey(handle.mouse);
    if (key !== undefined) {
      Object.assign(handle.mouse[key], {
        z: { x: e.clientX, y: e.clientY, kind: "canvas" },
        pointerId: e.pointerId,
        move: State.Mouse.Pointer.Move,
      });
    }
  });
  window.addEventListener("wheel", (e) => {
    handle.mouse.wheel = {
      z: { x: e.deltaX, y: e.deltaY, kind: "canvas" },
      state: State.Mouse.Wheel,
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
