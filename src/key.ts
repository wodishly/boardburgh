import type { Handle } from "./draw/handle";
import type { Game } from "./game";
import type { Maybe } from "./help/type";

const Keycodes = ["ShiftLeft", "ShiftRight", "KeyL"] as const;

export const isKeycode = (x: string) =>
  x === "ShiftLeft" || x === "ShiftRight" || x === "KeyL";

type Keycode = (typeof Keycodes)[number];
type Keystate = "begin" | "ongoing" | "end";

type Keymap = Map<Keycode, Maybe<Keystate>>;

export type KeyEater = {
  keysIn: Keycode[];
  keysOut: Keycode[];
  keymap: Keymap;
};

export const makeEater = (): KeyEater => {
  return {
    keysIn: [],
    keysOut: [],
    keymap: new Map<Keycode, Maybe<Keystate>>(
      Keycodes.map((code) => [code, undefined])
    ),
  };
};

export const handleKeys = (game: Game, now: number) => {
  if (didBeginKey(game, "KeyL")) {
    game.state.isLeeching = !game.state.isLeeching;
    console.log("leeching is now", game.state.isLeeching);
  }
};

export const didBeginKey = (game: Game, code: Keycode) => {
  return game.state.handle.eater.keymap.get(code) === "begin";
};

export const isKeyDown = (eater: KeyEater, code: Keycode) => {
  const state = eater.keymap.get(code);
  return state === "begin" || state === "ongoing";
};

export const isAnyKeyDown = (eater: KeyEater, codes: Keycode[]) => {
  for (let i = 0; i < codes.length; i++) {
    const state = eater.keymap.get(codes[i]);
    if (state === "begin" || state === "ongoing") {
      return true;
    }
  }
  return false;
};

export const isShiftDown = (eater: KeyEater) => {
  return isAnyKeyDown(eater, ["ShiftLeft", "ShiftRight"]);
};

export const updateEater = (game: Game, now: number) => {
  const eater = game.state.handle.eater;
  for (const [key, value] of eater.keymap.entries()) {
    switch (value) {
      case "begin":
      case "ongoing":
        eater.keymap.set(key, eater.keysOut.includes(key) ? "end" : "ongoing");
        continue;
      case "end":
      case undefined:
        eater.keymap.set(key, eater.keysIn.includes(key) ? "begin" : undefined);
        continue;
    }
    value satisfies never;
  }
  eater.keysIn = [];
  eater.keysOut = [];
};

export const feed = (eater: KeyEater, code: Keycode) => {
  eater.keysIn.push(code);
};

export const wem = (eater: KeyEater, code: Keycode) => {
  eater.keysOut.push(code);
};
