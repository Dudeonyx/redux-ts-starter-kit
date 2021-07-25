import type { NestedObject, Getter, GetArrayLength } from './types';

export const IS_PRODUCTION = process.env.NODE_ENV === 'production';

export function makeTypeSafeSelector<P extends (string | number)[]>(
  slice: '',
  ...paths: P
): {
  <V>(): (object: NestedObject<P, 0, V>) => V;
  bindToInput: <O extends NestedObject<P, 0, any>>() => (
    object: O,
  ) => Getter<P, O>;
};
export function makeTypeSafeSelector<P extends (string | number)[]>(
  ...paths: P
): {
  <V>(): (object: NestedObject<P, 0, V>) => V;
  bindToInput: <O extends NestedObject<P, 0, any>>() => (
    object: O,
  ) => Getter<P, O>;
};

export function makeTypeSafeSelector<
  P extends (string | number)[] & {
    length: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  },
>(...paths: P) {
  return paths[0] !== ''
    ? Object.assign(
        <V>() =>
          (object: NestedObject<P, 0, V>): V =>
            getter(paths, object) as any,
        {
          bindToInput:
            <O extends NestedObject<P, 0, any>>() =>
            (object: O): Getter<P, O> =>
              getter(paths, object) as any,
        },
      )
    : Object.assign(
        <V>() =>
          (object: any): V =>
            getter(paths.slice(1), object) as any,
        {
          bindToInput:
            <O extends NestedObject<P, 0, any>>() =>
            (object: O): any =>
              getter(paths.slice(1), object),
        },
      );
}

export const makeGetter =
  <P extends (string | number)[]>(...paths: P) =>
  (object: NestedObject<P, 0, any>) =>
    getter(paths, object);

export const get = <
  O extends NestedObject<P, 0, any>,
  P extends (string | number)[] | ReadonlyArray<string | number>,
>(
  object: O,
  ...paths: P
) => getter(paths, object);

function getter<
  P extends (string | number)[] | ReadonlyArray<string | number>,
  O extends NestedObject<P, 0, any, GetArrayLength<P>>,
>(paths: P, targetObject: O | undefined): Getter<P, O> | undefined {
  if (paths.length === 0) {
    return targetObject as any;
  }
  let result: Getter<P, O> = targetObject as any;
  const { length } = paths;
  for (let i = 0; i < length; i += 1) {
    const key: P[number] = paths[i];
    if (result == null) {
      if (i !== 0) {
        // tslint:disable-next-line: no-unused-expression
        IS_PRODUCTION ||
          // eslint-disable-next-line no-console
          console.warn(
            'There is a possible mis-match between the "paths" and "object" in a getter resulting in an undefined value before the last path, The potentially bad path is "%s". The combined path leading up to here is "%s"',
            `['${paths[i - 1]}']`,
            `['${paths.slice(0, i).join("']['")}']`,
          );
      } else {
        // tslint:disable-next-line: no-unused-expression
        IS_PRODUCTION ||
          // eslint-disable-next-line no-console
          console.warn('A getter was called on an undefined or null value');
      }

      return result;
    }

    if (typeof result !== 'object') {
      // tslint:disable-next-line: no-unused-expression
      IS_PRODUCTION ||
        // eslint-disable-next-line no-console
        console.warn(
          'Warning: You attempted to call a getter on a Non-Object value, The value is "%s", and the path to the value is "%s"',
          result,
          i === 0 ? '' : `['${paths.slice(0, i).join("']['")}']`,
        );
    }
    result = (result as any)[key];
    if (length === i + 1 && result == null) {
      // tslint:disable-next-line: no-unused-expression
      IS_PRODUCTION ||
        // eslint-disable-next-line no-console
        console.warn(
          'There is a possible mis-match between the final "path" argument and "object" in a getter resulting in an undefined value, The potentially bad final path is "%s". The combined path leading up to here is "%s"',
          `['${key}']`,
          `['${paths.join("']['")}']`,
        );
    }
  }
  return result;
}
