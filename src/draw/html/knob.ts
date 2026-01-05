import { makeWithId, type ElementWithId } from "./type";
import type { Override } from "../../help/type";
import type { GameState } from "../../state";

export type Knobname = "deal" | "lock";

export type KnobId<I extends Knobname = Knobname> = `knob-${I}`;

export type Knobful<N extends Knobname = Knobname> = {
  [K in `${N}Knob`]: Knob<N>;
};

export type Knob<N extends Knobname = Knobname> = N extends any
  ? ElementWithId<"button", KnobId<N>>
  : never;

export const makeKnob = <N extends Knobname>(
  _gameState: GameState,
  knobname: N,
  callback: (e: PointerEvent) => void = () => {}
) => {
  const knob = makeWithId("button", `knob-${knobname}` as const);
  knob.element.innerHTML = knobname;
  knob.element.addEventListener("click", callback);

  return knob as Override<Knob<N>>;
};
