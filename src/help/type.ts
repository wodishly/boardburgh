import type { Flight } from "./rime";

export type Override<T> = T;
export type Maybe<T> = T | undefined;
export type Ends<T> = { start: T; end: T };

export type Onset<S extends string> = S extends `${infer T}${infer _}`
  ? T
  : never;

export type Thaw<T extends object> = {
  -readonly [K in keyof T]: T[K];
};

export type Wayward<T, U = T, V = U, W = V> = {
  east: T;
  north: U;
  west: V;
  south: W;
};

export const sameshift = <N extends number, T extends Flight<T[number], N>, U>(
  xs: T,
  f: (x: T[number]) => U
) => xs.map(f) as Override<{ [K in keyof T]: U }>;

export const swap = <T, U>([x, y]: [T, U]): [U, T] => {
  return [y, x];
};

export const ly = <T>(x: T): T => {
  console.log(x);
  return x;
};

export const isObject = (x: unknown): x is object => {
  return !!x && typeof x === "object";
};

export const only = <T>(xs: T[]): T => {
  if (xs.length === 1) {
    return xs[0];
  } else {
    throw new Error("bad only");
  }
};
