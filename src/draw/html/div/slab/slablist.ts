import type { GameState } from "../../../../state";
import { makeWithId, type ElementWithId } from "../../type";
import { type Slab } from "./slab";

export type SlablistSpan = ElementWithId<"span", "slablist">;

export const makeSlablistSpan = (
  gameState: GameState,
  slabs: Slab[]
): SlablistSpan => {
  const almostSlablistSpan = makeWithId("span", "slablist" as const);
  for (const slab of slabs) {
    const a = { element: document.createElement("a") };
    a.element.innerHTML = `[${slab.id.slice(0, -4)}]`;
    a.element.onclick = () => toggleSlab(slab);
    almostSlablistSpan.element.append(a.element);
  }
  return almostSlablistSpan;
};

const toggleSlab = (slab: Slab) => {
  slab.isSightly = !slab.isSightly;
  setDisplayToSightly(slab);
};

export const setDisplayToSightly = (slab: Slab) => {
  slab.element.style.display = slab.isSightly ? "" : "none";
};
