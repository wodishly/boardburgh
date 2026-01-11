import type { BoardCanvas } from "../board";
import { getHandle, type Game } from "../game";
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
  W extends WheelState = WheelState
> = {
  pointer: Pointer<P>;
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
  ctrlKey: boolean;
};

export type Handle = {
  mouse: Mouse;
  eater: KeyEater;
  unhandleds: UnhandledEvent[];
};

type UnhandledEvent = PointerEvent | KeyboardEvent | WheelEvent;

export const makeHandle = (): Handle => {
  return {
    mouse: {
      pointer: {
        z: z(0, 0, "canvas"),
        pointerId: -1,
        knob: undefined,
        move: undefined,
      },
      wheel: { z: z(0, 0, "canvas"), state: undefined, ctrlKey: false },
      layer: [],
    },
    eater: makeEater(),
    unhandleds: [],
  };
};

export const updateHandle = (game: Game, now: number) => {
  updateEater(game, now);
  const handle = getHandle(game);

  handle.mouse.wheel.state = undefined;
  handle.mouse.pointer.move = undefined;
  if (handle.mouse.pointer.knob === "pointerup") {
    handle.mouse.pointer.knob = undefined;
  }

  for (let i = 0; i < handle.unhandleds.length; i++) {
    const unhandled = handle.unhandleds[i];
    if (unhandled instanceof PointerEvent) {
      if (unhandled.type === "pointerdown" || unhandled.type === "pointerup") {
        Object.assign(handle.mouse.pointer, {
          z: { x: unhandled.clientX, y: unhandled.clientY, kind: "canvas" },
          pointerId: unhandled.pointerId,
          knob: unhandled.type,
        });
      }
      if (unhandled.type === "pointermove") {
        Object.assign(handle.mouse.pointer, {
          z: { x: unhandled.clientX, y: unhandled.clientY, kind: "canvas" },
          pointerId: unhandled.pointerId,
          move: unhandled.type,
        });
      }
    } else if (unhandled instanceof WheelEvent) {
      if (unhandled.type === "wheel") {
        Object.assign(handle.mouse.wheel, {
          z: { x: unhandled.deltaX, y: unhandled.deltaY, kind: "canvas" },
          state: State.Mouse.Wheel,
          ctrlKey: unhandled.ctrlKey,
        });
      }
    } else if (unhandled instanceof KeyboardEvent) {
      if (isKeycode(unhandled.code)) {
        if (unhandled.type === "keydown") {
          feed(handle.eater, unhandled.code);
        } else if (unhandled.type === "keyup") {
          wem(handle.eater, unhandled.code);
        }
      }
    } else {
      throw new Error("bad unhandled");
    }
  }
  handle.unhandleds.length = 0;
  handle.mouse.layer.length = 0;
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
    e.preventDefault();
    handle.unhandleds.push(e);
  });
  window.addEventListener("pointerup", (e) => {
    e.preventDefault();
    handle.unhandleds.push(e);
  });
  window.addEventListener("pointermove", (e) => {
    e.preventDefault();
    handle.unhandleds.push(e);
  });
  window.addEventListener(
    "wheel",
    (e) => {
      e.preventDefault();
      handle.unhandleds.push(e);
    },
    { passive: false }
  );
  window.addEventListener("keydown", (e) => {
    // e.preventDefault();
    handle.unhandleds.push(e);
  });
  window.addEventListener("keyup", (e) => {
    // e.preventDefault();
    handle.unhandleds.push(e);
  });
  return handle;
};
