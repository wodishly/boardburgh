import { makeSlab, type Slab } from "./slab";
import { type Elementful, type HTMLMake } from "../../type";
import type { FriendState } from "../../../../friend/friendstate";
import { flight, type Flight } from "../../../../help/rime";
import { sameshift } from "../../../../help/type";
import { Settings } from "../../../../settings";

export type Worthslab = Slab<"worthslab"> & { table: Elementful<"table"> };

type RowTr = Elementful<"tr"> & {
  name: string;
  worth: number;
  friendStates: FriendStates;
};

type FriendStates = Record<Exclude<FriendState, "hover">, number>;

const makeRowTr = (
  name: string,
  worth = 0,
  friendStates: FriendStates = {
    home: Settings.friendTell,
    burgh: 0,
    field: 0,
    road: 0,
  }
): RowTr => {
  const tr = { element: document.createElement("tr") };
  const tds = [
    name,
    worth,
    friendStates.home,
    friendStates.burgh,
    friendStates.field,
    friendStates.road,
  ];
  for (let i = 0; i < tds.length; i++) {
    const td = { element: document.createElement("td") };
    td.element.innerHTML = tds[i].toString();
    tr.element.append(td.element);
  }
  return { ...tr, name, worth, friendStates };
};

export const makeWorthslab: HTMLMake<Worthslab> = (gameState) => {
  const worthslab = makeSlab(gameState, "worthslab");

  const h4 = document.createElement("h4");
  h4.innerHTML = "here r ur worths";
  worthslab.element.append(h4);

  const table = { element: document.createElement("table") };

  const thrs = sameshift(flight(2), () => document.createElement("tr"));
  const ths = [
    ["Name", "Worth", "Friends"],
    ["Home", "Burgh", "Field", "Road"],
  ] as const;

  for (let i = 0; i < ths[0].length; i++) {
    const th = document.createElement("th");
    th.innerHTML = ths[0][i];
    switch (ths[0][i]) {
      case "Name":
      case "Worth":
        th.rowSpan = 2;
        break;
      case "Friends":
        th.colSpan = 4;
        break;
      default:
        throw new Error("bad th");
    }
    thrs[0].append(th);
  }
  for (let i = 0; i < ths[1].length; i++) {
    const th = document.createElement("th");
    th.innerHTML = ths[1][i];
    thrs[1].append(th);
  }

  table.element.append(
    ...thrs,
    makeRowTr("Klaus").element,
    makeRowTr("Jürgen", 200, { home: 1, burgh: 2, field: 2, road: 2 }).element
  );

  worthslab.element.append(table.element);

  return { ...worthslab, table };
};
