export type Flight<T, N extends number> = N extends any
  ? number extends N
    ? T[]
    : Fledge<T, N, []>
  : never;

type Fledge<T, N extends number, R extends unknown[]> = R["length"] extends N
  ? R
  : Fledge<T, N, [T, ...R]>;

// includes 0
export type Overtell<N extends number> = Tell<N> & Overnought<N>;

export type Tell<N extends number> = `${N}` extends `${number}.${number}`
  ? never
  : N;

// includes 0
export type Overnought<N extends number> = `${N}` extends `-${number}`
  ? never
  : N;

export type Next<N extends number> = Overtell<N> extends never
  ? never
  : [any, ...Flight<any, N>]["length"] extends number
  ? [any, ...Flight<any, N>]["length"]
  : never;

// unused
export type Plus<N extends number, M extends number> = [
  ...Flight<any, N>,
  ...Flight<any, M>
]["length"] extends number
  ? [...Flight<any, N>, ...Flight<any, M>]["length"]
  : never;

export type Minus<
  N extends number,
  M extends number
> = Overtell<N> extends never
  ? never
  : Overtell<M> extends never
  ? never
  : Flight<any, N> extends [...Flight<any, M>, ...infer R]
  ? R["length"]
  : never;

export type Modulo<
  N extends number,
  M extends number
> = Overtell<N> extends never
  ? never
  : Overtell<M> extends never
  ? never
  : Minus<N, M> extends never
  ? N
  : Modulo<Minus<N, M>, M>;

export const flight = <N extends number>(n: N) =>
  [...Array(n).keys()] as Flight<number, N>;
