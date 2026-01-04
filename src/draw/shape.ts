import type { Z, ZKind } from "../help/reckon";
import type { Flight } from "../help/rime";

export type Fournook<K extends ZKind> = {
  navel: Z<K>;
  greatness: Z<K>;
};

export type Nookful<K extends ZKind, N extends number> = Flight<Z<K>, N>;

export type Rectangle<K extends ZKind> = Z<K> & {
  width: number;
  height: number;
};

export type RoundedRectangle<K extends ZKind> = Rectangle<K> & {
  rx: number;
  ry: number;
};

export const toRectangle = <K extends ZKind>({
  navel,
  greatness,
}: Fournook<K>): Rectangle<K> => {
  return {
    x: navel.x - greatness.x / 2,
    y: navel.y - greatness.y / 2,
    kind: navel.kind,
    width: greatness.x,
    height: greatness.y,
  };
};

export type Ring<
  K extends ZKind,
  X extends number = number,
  Y extends number = number
> = {
  navel: Z<K, X, Y>;
  halfwidth: number;
};

export type Ringdeal<
  K extends ZKind,
  X extends number = number,
  Y extends number = number
> = Ring<K, X, Y> & {
  start: number;
  end: number;
};
