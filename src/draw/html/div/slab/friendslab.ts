import { makeSlab, type Slab } from "./slab";
import { type ElementWithId, type HTMLMake, makeWithId } from "../../type";

export type Friendslab = Slab<"friendslab"> & {
  houseDiv: ElementWithId<"div", "house">;
};

export const makeFriendslab: HTMLMake<Friendslab> = (gameState) => {
  const friendslab = makeSlab(gameState, "friendslab");

  const h4 = document.createElement("h4");
  h4.innerHTML = "here r ur friends";
  friendslab.element.append(h4);

  const houseDiv = makeWithId("div", "house");
  friendslab.element.append(houseDiv.element);

  return { ...friendslab, houseDiv };
};
