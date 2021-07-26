import type { IsAny } from 'tsdef';

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

type IncreaseNum<N extends number> = IsAny<N, never, false> extends false
  ? N extends 0
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
    : never
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
  ? S[IncreaseNum<Start>] extends number
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
  P extends string[] | ReadonlyArray<string>,
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

/* type MakeObject<P extends (string | number)[], Final = any> = P extends 0
  ? Final
  : P extends 1
  ? { [K0 in P[0]]: Final }
  : P extends 2
  ? { [K0 in P[0]]: { [K1 in P[1]]: Final } }
  : P extends 3
  ? { [K0 in P[0]]: { [K1 in P[1]]: { [K2 in P[2]]: Final } } }
  : P extends 4
  ? {
      [K0 in P[0]]: { [K1 in P[1]]: { [K2 in P[2]]: { [K3 in P[3]]: Final } } };
    }
  : P extends 5
  ? {
      [K0 in P[0]]: {
        [K1 in P[1]]: {
          [K2 in P[2]]: { [K3 in P[3]]: { [K4 in P[4]]: Final } };
        };
      };
    }
  : P extends 6
  ? {
      [K0 in P[0]]: {
        [K1 in P[1]]: {
          [K2 in P[2]]: {
            [K3 in P[3]]: { [K4 in P[4]]: { [K5 in P[5]]: Final } };
          };
        };
      };
    }
  : P extends 7
  ? {
      [K0 in P[0]]: {
        [K1 in P[1]]: {
          [K2 in P[2]]: {
            [K3 in P[3]]: {
              [K4 in P[4]]: { [K5 in P[5]]: { [K6 in P[6]]: Final } };
            };
          };
        };
      };
    }
  : P extends 8
  ? {
      [K0 in P[0]]: {
        [K1 in P[1]]: {
          [K2 in P[2]]: {
            [K3 in P[3]]: {
              [K4 in P[4]]: {
                [K5 in P[5]]: { [K6 in P[6]]: { [K7 in P[7]]: Final } };
              };
            };
          };
        };
      };
    }
  : P extends 9
  ? {
      [K0 in P[0]]: {
        [K1 in P[1]]: {
          [K2 in P[2]]: {
            [K3 in P[3]]: {
              [K4 in P[4]]: {
                [K5 in P[5]]: {
                  [K6 in P[6]]: { [K7 in P[7]]: { [K8 in P[8]]: Final } };
                };
              };
            };
          };
        };
      };
    }
  : P extends 10
  ? {
      [K0 in P[0]]: {
        [K1 in P[1]]: {
          [K2 in P[2]]: {
            [K3 in P[3]]: {
              [K4 in P[4]]: {
                [K5 in P[5]]: {
                  [K6 in P[6]]: {
                    [K7 in P[7]]: { [K8 in P[8]]: { [K9 in P[9]]: Final } };
                  };
                };
              };
            };
          };
        };
      };
    }
  : never; */
