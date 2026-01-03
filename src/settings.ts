import type { Brush } from "./draw/draw";

export const Settings = {
  brickLength: 128,
  draw: {
    lineWidth: 4,
    roadHalfwidth: 0.15,
  },
} as const;

export const Brushwit = {
  city: { fillColor: "peru", strokeColor: "sienna" },
  field: { fillColor: "lightgreen", strokeColor: "lightgreen" },
  road: { fillColor: "yellow", strokeColor: "brown" },
  shield: { fillColor: "#88f", strokeColor: "#eef" },
  town: { fillColor: "grey", strokeColor: "black" },
  church: { fillColor: "coral", strokeColor: "darkred" },
  mean: { strokeWidth: 1 },
} as const;

Brushwit satisfies Record<string, Partial<Brush>>;

export const Stavewit = {
  fontSize: 20,
  fontFace: "sans-serif",
  fillColor: "black",
  strokeColor: undefined,
  strokeWidth: 0,
  textAlign: "center",
  textBaseline: "middle",
} as const;

Stavewit satisfies Partial<Brush>;
