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

/* export type NestedObject<
  S extends (string | number)[] | ReadonlyArray<string | number>,
  Start extends number,
  Fin,
  Max extends number = GetArrayLength<S>,
> = number extends Start
  ? never
  : Start extends Max
  ? Fin
  : S[Start] extends number
  ? S[IncreaseNum<Start>] extends string
    ? (NestedObject<S, IncreaseNum<Start>, Fin, Max> & NotEmptyObject)[]
    : NestedObject<S, IncreaseNum<Start>, Fin, Max>[]
  : {
      [K in S[Start]]: NestedObject<S, IncreaseNum<Start>, Fin, Max>;
    }; */

export type NestedObject<
  S extends string[] | ReadonlyArray<string>,
  Start extends number,
  Fin,
  Max extends number = GetArrayLength<S>,
> = number extends Start
  ? never
  : Start extends Max
  ? Fin
  : { [K in S[Start]]: NestedObject<S, IncreaseNum<Start>, Fin, Max> };

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
