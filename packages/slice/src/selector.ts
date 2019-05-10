export const IS_PRODUCTION = process.env.NODE_ENV === 'production';

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
  S extends string[] | ReadonlyArray<string>,
  Start extends number,
  Fin,
  Max extends number = GetArrayLength<S>
> = number extends Start
  ? never
  : Start extends Max
  ? Fin
  : { [K in S[Start]]: NestedObject<S, IncreaseNum<Start>, Fin, Max> };

export type GetArrayLength<S extends any[] | ReadonlyArray<any>> = S extends {
  length: infer L;
}
  ? L
  : never;

type Getter<
  P extends string[] | ReadonlyArray<string>,
  O extends { [s: string]: any }
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

export function makeTypeSafeSelector<P extends string[]>(
  slice: '',
  ...paths: P
): {
  <V>(): (object: NestedObject<P, 0, V>) => V;
  bindToInput: <O extends NestedObject<P, 0, any>>() => (
    object: O,
  ) => Getter<P, O>;
};
export function makeTypeSafeSelector<P extends string[]>(
  ...paths: P
): {
  <V>(): (object: NestedObject<P, 0, V>) => V;
  bindToInput: <O extends NestedObject<P, 0, any>>() => (
    object: O,
  ) => Getter<P, O>;
};

export function makeTypeSafeSelector<
  P extends (string[]) & {
    length: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  }
>(...paths: P) {
  return paths[0] !== ''
    ? Object.assign(
        <V>() => {
          return (object: NestedObject<P, 0, V>): V => {
            return getter(paths, object) as any;
          };
        },
        {
          bindToInput: <O extends NestedObject<P, 0, any>>() => {
            return (object: O): Getter<P, O> => {
              return getter(paths, object as any) as any;
            };
          },
        },
      )
    : Object.assign(
        <V>() => {
          return (object: any): V => {
            return getter(paths.slice(1), object) as any;
          };
        },
        {
          bindToInput: <O extends NestedObject<P, 0, any>>() => {
            return (object: O): any => {
              return getter(paths.slice(1), object);
            };
          },
        },
      );
}

export const makeGetter = <P extends string[]>(...paths: P) => {
  return (object: NestedObject<P, 0, any>) => {
    return getter(paths, object);
  };
};

export const get = <
  O extends NestedObject<P, 0, any>,
  P extends string[] | ReadonlyArray<string>
>(
  object: O,
  ...paths: P
) => getter(paths, object);

function getter<
  P extends string[] | ReadonlyArray<string>,
  O extends NestedObject<P, I, any>,
  I extends number = 0
>(
  paths: P,
  object: O | undefined,
  index: I = 0 as I,
): Getter<P, O> | undefined {
  if (paths.length === 0) {
    return object as any;
  }
  if (object == null) {
    if (index !== 0) {
      // tslint:disable-next-line: no-unused-expression
      IS_PRODUCTION ||
        console.warn(
          'There is a possible mis-match between the "paths" and "object" in a getter resulting in an undefined value before the last path, The potentially bad path is "%s". The combined path leading up to here is "%s"',
          `['${paths[index - 1]}']`,
          `['${paths.slice(0, index).join('\'][\'')}']`,
        );
    } else {
      // tslint:disable-next-line: no-unused-expression
      IS_PRODUCTION ||
        console.warn('A getter was called on an undefined or null value');
    }

    return object as any;
  }
  if (typeof object !== 'object') {
    // tslint:disable-next-line: no-unused-expression
    IS_PRODUCTION ||
      console.warn(
        'Warning: You attempted to call a getter on a Non-Object value, The value is "%s", and the path to the value is "%s"',
        object,
        index === 0 ? '' : `['${paths.slice(0, index).join('\'][\'')}']`,
      );
    return undefined;
  }
  const key = paths[index];
  const nextIndex = index + 1;
  if (paths.length === nextIndex) {
    if (!(key in object)) {
      // tslint:disable-next-line: no-unused-expression
      IS_PRODUCTION ||
        console.warn(
          'There is a possible mis-match between the final "path" argument and "object" in a getter resulting in an undefined value, The potentially bad final path is "%s". The combined path leading up to here is "%s"',
          `['${key}']`,
          `['${paths.join('\'][\'')}']`,
        );
    }
    return object[key];
  }
  return getter(paths, object[key], nextIndex);
}

export const A = <
  Ar extends Array<
    string | number | object | boolean | symbol | undefined | null
  >
>(
  ...values: Ar
): Ar => values;
