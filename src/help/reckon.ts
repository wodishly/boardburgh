import type { Flight } from "./rime";
import type { Override } from "./type";

export type ZKind = "world" | "canvas" | "svg";

export type Z<
  K extends ZKind,
  X extends number = number,
  Y extends number = number
> = {
  x: X;
  y: Y;
  kind: K;
};

export type Zful<K extends ZKind> = { z: Z<K> };

export type WithCommas<X extends number, Y extends number> = `${X},${Y}`;
export type WithSpaces<X extends number, Y extends number> = `${X} ${Y}`;

export type Navel<K extends ZKind> = Z<K, 0, 0>;

export const navel = <K extends ZKind>(kind: K): Navel<K> => {
  return {
    x: 0,
    y: 0,
    kind,
  };
};

export const toList = <K extends ZKind>({ x, y }: Z<K>): Flight<number, 2> => {
  return [x, y];
};

export const z = <K extends ZKind>(x: number, y: number, kind: K): Z<K> => {
  return { x, y, kind };
};

export const zFarth = <K extends ZKind>(z: Z<K>, w: Z<K>) => {
  return Math.sqrt((z.x - w.x) ** 2 + (z.y - w.y) ** 2);
};

export const zPlus = <K extends ZKind>(z: Z<K>, w: Z<K>): Z<K> => {
  return { x: z.x + w.x, y: z.y + w.y, kind: z.kind };
};

export const zMinus = <K extends ZKind>(z: Z<K>, w: Z<K>): Z<K> => {
  return { x: z.x - w.x, y: z.y - w.y, kind: z.kind };
};

export const zTimes = <K extends ZKind>(z: Z<K>, n: number): Z<K> => {
  return { x: n * z.x, y: n * z.y, kind: z.kind };
};
export const dotTimes = <K extends ZKind>(z: Z<K>, w: Z<K>): Z<K> => {
  return { x: z.x * w.x, y: z.y * w.y, kind: z.kind };
};

export const zMiddle = <K extends ZKind>(z: Z<K>, w: Z<K>): Z<K> => {
  return { x: (z.x + w.x) / 2, y: (z.y + w.y) / 2, kind: z.kind };
};

export const zMap = <K extends ZKind>(
  z: Z<K>,
  f: (_z: number) => number
): Z<K> => {
  return { x: f(z.x), y: f(z.y), kind: z.kind };
};

export const zLerp = <K extends ZKind>(z: Z<K>, w: Z<K>, n: number): Z<K> => {
  return { x: z.x + (w.x - z.x) * n, y: z.y + (w.y - z.y) * n, kind: z.kind };
};

export const choose = <T, N extends number>(xs: Flight<T, N>) => {
  return xs[Math.floor(Math.random() * xs.length)];
};

export const shuffle = <T>(xs: T[]): T[] => {
  let left = xs.length;
  let shuffled = [...xs];
  while (left) {
    const i = Math.floor(Math.random() * left);
    const s = shuffled[i];
    shuffled.splice(i, 1);
    shuffled.push(s);
    left -= 1;
  }
  return shuffled;
};

export const withCommas = <X extends number, Y extends number>(
  { x, y }: Z<ZKind>,
  doRound = false
) =>
  `${doRound ? Math.round(x) : x},${doRound ? Math.round(y) : y}` as Override<
    WithCommas<X, Y>
  >;

export const withSpaces = <X extends number, Y extends number>(
  { x, y }: Z<ZKind>,
  doRound = false
) => {
  return `${doRound ? Math.round(x) : x} ${
    doRound ? Math.round(y) : y
  }` as Override<WithSpaces<X, Y>>;
};

export const roundTo = (n: number, sharpness = 0) => {
  return Math.round(n * 10 ** sharpness) / 10 ** sharpness;
};

export const mod = (n: number, d: number) => {
  return ((n % d) + d) % d;
};

export const toXY = <K extends ZKind>(
  greatness: number,
  winkle: number,
  kind: K
): Z<K> => {
  return {
    x: greatness * Math.cos(winkle),
    y: greatness * Math.sin(winkle),
    kind,
  };
};
