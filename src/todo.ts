import type { WithSpaces } from "./help/reckon";

type D<
  X0 extends number,
  Y0 extends number,
  X1 extends number,
  Y1 extends number,
  B extends boolean
> = `${M<X0, Y0>} ${L<X1, Y1>} ${Z<B>}`;
type M<X extends number = number, Y extends number = number> = `M${WithSpaces<
  X,
  Y
>}`;
type L<X extends number = number, Y extends number = number> = `L${WithSpaces<
  X,
  Y
>}`;
type Z<B extends boolean = false> = B extends true ? `Z` : ``;
