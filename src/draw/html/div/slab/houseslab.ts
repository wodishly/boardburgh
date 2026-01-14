import { makeSlab, type Slab } from "./slab";
import { type ElementWithId, type HTMLMake, makeWithId } from "../../type";

export type Houseslab = Slab<"houseslab"> & {
  houseDiv: ElementWithId<"div", "house">;
};

export const makeHouseslab: HTMLMake<Houseslab> = (gameState) => {
  const houseslab = makeSlab(gameState, "houseslab");

  const h4 = document.createElement("h4");
  h4.innerHTML = "here r ur friends";
  houseslab.element.append(h4);

  const houseDiv = makeWithId("div", "house");
  houseslab.element.append(houseDiv.element);

  return { ...houseslab, houseDiv };
};
