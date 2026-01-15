import type { BoardframeDiv } from "../../../../board";
import type { GameState } from "../../../../state";
import { makeWithId, type Elementful, type ElementWithId } from "../../type";
import { type Slab, type SlabId } from "./slab";

export type SlablistSpan = ElementWithId<"span", "slablist"> & {
  [K in SlabId as K extends `${infer T}slab` ? T : never]: Elementful<"a">;
};

export const makeSlablistSpan = (
  gameState: GameState,
  slabs: BoardframeDiv["slabs"]
): SlablistSpan => {
  const almostSlablistSpan = makeWithId("span", "slablist" as const);

  const deck = { element: document.createElement("a") };
  deck.element.innerHTML = `[deck]`;
  deck.element.onclick = () => toggleSlab(deck, slabs.deckslab);

  const house = { element: document.createElement("a") };
  house.element.innerHTML = `[house]`;
  house.element.onclick = () => toggleSlab(house, slabs.houseslab);

  const worth = { element: document.createElement("a") };
  worth.element.innerHTML = `[worth]`;
  worth.element.onclick = () => toggleSlab(worth, slabs.worthslab);
  toggleSlab(worth, slabs.worthslab);

  const help = { element: document.createElement("a") };
  help.element.innerHTML = `[help]`;
  help.element.onclick = () => toggleSlab(help, slabs.helpslab);

  almostSlablistSpan.element.append(
    deck.element,
    house.element,
    worth.element,
    help.element
  );
  return { ...almostSlablistSpan, deck, house, worth, help };
};

const toggleSlab = (a: Elementful<"a">, slab: Slab) => {
  slab.isSightly = !slab.isSightly;
  if (slab.isSightly) {
    a.element.classList.remove("unsightly");
  } else {
    a.element.classList.add("unsightly");
  }
  matchSightly(slab);
};

export const matchSightly = (slab: Slab) => {
  slab.element.style.display = slab.isSightly ? "" : "none";
};
