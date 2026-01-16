import type { Brush } from "./draw/brush";

export const fg = () => {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "white"
    : "black";
};

export const bg = () => {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "black"
    : "white";
};

export const Settings = {
  brickLength: 128,
  neighborThreshold: 1 / 8,
  pan: {
    utmost: 2<<12,
  },
  zoom: {
    step: 1 / 512,
    utleast: 1 / 8,
    utmost: 4,
  },
  dragBecomesSpin: 24,
  friendTell: 7,
  draw: {
    roadHalfwidth: 0.15,
  },
} as const;

export const Brushwit = {
  burgh: { fillColor: "peru", strokeColor: "sienna" },
  field: { fillColor: "lightgreen", strokeColor: "lightgreen" },
  road: { fillColor: "yellow", strokeColor: "brown" },
  shield: { fillColor: "#88f", strokeColor: "#eef" },
  town: { fillColor: "grey", strokeColor: "black" },
  church: { fillColor: "coral", strokeColor: "darkred" },
  mean: { strokeWidth: 2 },
} as const;

Brushwit satisfies Record<string, Partial<Brush>>;

export const Stavewit = {
  fontSize: 20,
  fontFace: "sans-serif",
  fillColor: fg(),
  strokeColor: "red",
  textAlign: "center",
  textBaseline: "middle",
} as const;

Stavewit satisfies Partial<Brush>;
