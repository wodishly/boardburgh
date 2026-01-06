import type { Brush } from "./draw/brush";

export const Settings = {
  brickLength: 128,
  neighborThreshold: 1 / 8,
  draw: {
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
  mean: { strokeWidth: 2 },
} as const;

Brushwit satisfies Record<string, Partial<Brush>>;

export const Stavewit = {
  fontSize: 20,
  fontFace: "sans-serif",
  fillColor: "black",
  strokeColor: "red",
  textAlign: "center",
  textBaseline: "middle",
} as const;

Stavewit satisfies Partial<Brush>;
