export interface Action<T extends string = string> {
  readonly type: T;
}

export interface NotEmptyObject {
  [s: string]: string | number | symbol | boolean | object | undefined | null;
  [s: number]: string | number | symbol | boolean | object | undefined | null;
}

export interface AnyAction<T extends string = string> extends Action<T> {
  [s: string]: any;
}
export interface PayloadAction<P = any, T extends string = string>
  extends Action<T> {
  readonly payload: P;
}

type IncreaseNum<N extends number> = N extends 0
  ? 1
  : N extends 1
  ? 2
  : N extends 2
  ? 3
  : N extends 3
  ? 4
  : N extends 4
  ? 5
  : N extends 5
  ? 6
  : N extends 6
  ? 7
  : N extends 7
  ? 8
  : N extends 8
  ? 9
  : N extends 9
  ? 10
  : N extends 10
  ? 11
  : never;

export type NestedObject<
  S extends (string | number)[] | ReadonlyArray<string | number>,
  Start extends number,
  Fin,
  Max extends number = GetArrayLength<S>,
> = number extends Start
  ? never
  : Start extends Max
  ? Fin
  : S[Start] extends number
  ? // ? S[IncreaseNum<Start>] extends string
    //   ? (NestedObject<S, IncreaseNum<Start>, Fin, Max> &
    //       Record<string, unknown>)[]
    //   : NestedObject<S, IncreaseNum<Start>, Fin, Max>
    S[IncreaseNum<Start>] extends string
    ? (NestedObject<S, IncreaseNum<Start>, Fin, Max> & NotEmptyObject)[]
    : NestedObject<S, IncreaseNum<Start>, Fin, Max>[]
  : {
      [K in S[Start]]: NestedObject<S, IncreaseNum<Start>, Fin, Max>;
    };

// const g: NestedObject<['hello', 'hi', 0, 'hello', 0, 'supP'], 0, any> = {
//   hello: { hi: [{ hello: [{ supP: '' }], hi: '' }] },
// };
// const g2: NestedObject<
//   ['hello', 'hi', 0, 0, 'hello',],
//   0,
//   { supP: string }
// > = {
//   hello: { hi: [[{ hello: { supP: '' }, hi: '' }]] },
// };

export type GetArrayLength<S extends any[] | ReadonlyArray<any>> = S extends {
  length: infer L;
}
  ? L
  : never;
export type Getter<
  P extends (string | number)[] | ReadonlyArray<string | number>,
  O extends { [s: string]: any },
> = GetArrayLength<P> extends 0
  ? O
  : GetArrayLength<P> extends 1
  ? O[P[0]]
  : GetArrayLength<P> extends 2
  ? O[P[0]][P[1]]
  : GetArrayLength<P> extends 3
  ? O[P[0]][P[1]][P[2]]
  : GetArrayLength<P> extends 4
  ? O[P[0]][P[1]][P[2]][P[3]]
  : GetArrayLength<P> extends 5
  ? O[P[0]][P[1]][P[2]][P[3]][P[4]]
  : GetArrayLength<P> extends 6
  ? O[P[0]][P[1]][P[2]][P[3]][P[4]][P[5]]
  : GetArrayLength<P> extends 7
  ? O[P[0]][P[1]][P[2]][P[3]][P[4]][P[5]][P[6]]
  : GetArrayLength<P> extends 8
  ? O[P[0]][P[1]][P[2]][P[3]][P[4]][P[5]][P[6]][P[7]]
  : GetArrayLength<P> extends 9
  ? O[P[0]][P[1]][P[2]][P[3]][P[4]][P[5]][P[6]][P[7]][P[8]]
  : GetArrayLength<P> extends 10
  ? O[P[0]][P[1]][P[2]][P[3]][P[4]][P[5]][P[6]][P[7]][P[8]][P[9]]
  : never;

type ANY = string | boolean | number | symbol | object | null | undefined;

export function constArr<P0 extends ANY>(a: [P0]): typeof a;
export function constArr<P0 extends ANY, P1 extends ANY>(a: [P0, P1]): typeof a;
export function constArr<P0 extends ANY, P1 extends ANY, P2 extends ANY>(
  a: [P0, P1, P2],
): typeof a;
export function constArr<
  P0 extends ANY,
  P1 extends ANY,
  P2 extends ANY,
  P3 extends ANY,
>(a: [P0, P1, P2, P3]): typeof a;
export function constArr<
  P0 extends ANY,
  P1 extends ANY,
  P2 extends ANY,
  P3 extends ANY,
  P4 extends ANY,
>(a: [P0, P1, P2, P3, P4]): typeof a;
export function constArr<
  P0 extends ANY,
  P1 extends ANY,
  P2 extends ANY,
  P3 extends ANY,
  P4 extends ANY,
  P5 extends ANY,
>(a: [P0, P1, P2, P3, P4, P5]): typeof a;
export function constArr<
  P0 extends ANY,
  P1 extends ANY,
  P2 extends ANY,
  P3 extends ANY,
  P4 extends ANY,
  P5 extends ANY,
  P6 extends ANY,
>(a: [P0, P1, P2, P3, P4, P5, P6]): typeof a;
export function constArr<
  P0 extends ANY,
  P1 extends ANY,
  P2 extends ANY,
  P3 extends ANY,
  P4 extends ANY,
  P5 extends ANY,
  P6 extends ANY,
  P7 extends ANY,
>(a: [P0, P1, P2, P3, P4, P5, P6, P7]): typeof a;
export function constArr<
  P0 extends ANY,
  P1 extends ANY,
  P2 extends ANY,
  P3 extends ANY,
  P4 extends ANY,
  P5 extends ANY,
  P6 extends ANY,
  P7 extends ANY,
  P8 extends ANY,
>(a: [P0, P1, P2, P3, P4, P5, P6, P7, P8]): typeof a;
export function constArr<
  P0 extends ANY,
  P1 extends ANY,
  P2 extends ANY,
  P3 extends ANY,
  P4 extends ANY,
  P5 extends ANY,
  P6 extends ANY,
  P7 extends ANY,
  P8 extends ANY,
  P9 extends ANY,
>(a: [P0, P1, P2, P3, P4, P5, P6, P7, P8, P9]): typeof a;
export function constArr<
  P0 extends ANY,
  P1 extends ANY,
  P2 extends ANY,
  P3 extends ANY,
  P4 extends ANY,
  P5 extends ANY,
  P6 extends ANY,
  P7 extends ANY,
  P8 extends ANY,
  P9 extends ANY,
  P10 extends ANY,
>(a: [P0, P1, P2, P3, P4, P5, P6, P7, P8, P9, P10]): typeof a;
export function constArr<
  P0 extends ANY,
  P1 extends ANY,
  P2 extends ANY,
  P3 extends ANY,
  P4 extends ANY,
  P5 extends ANY,
  P6 extends ANY,
  P7 extends ANY,
  P8 extends ANY,
  P9 extends ANY,
  P10 extends ANY,
  P11 extends ANY,
>(a: [P0, P1, P2, P3, P4, P5, P6, P7, P8, P9, P10, P11]): typeof a;
export function constArr<
  P0 extends ANY,
  P1 extends ANY,
  P2 extends ANY,
  P3 extends ANY,
  P4 extends ANY,
  P5 extends ANY,
  P6 extends ANY,
  P7 extends ANY,
  P8 extends ANY,
  P9 extends ANY,
  P10 extends ANY,
  P11 extends ANY,
  P12 extends ANY,
>(a: [P0, P1, P2, P3, P4, P5, P6, P7, P8, P9, P10, P11, P12]): typeof a;
export function constArr<P0 extends ANY[]>(a: P0) {
  return a;
}
