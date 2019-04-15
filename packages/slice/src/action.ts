export function createAction<P = any, T extends string = string>(
  type: T,
): {
  (payload: P): {
    type: T;
    slice: '';
    payload: P;
  };
  type: T;
  slice: '';
  toString(): T;
};
export function createAction<
  P = any,
  T extends string = string,
  Slc extends string = string
>(
  type: T,
  slice: Slc,
): {
  (payload: P): {
    type: T;
    slice: Slc;
    payload: P;
  };
  type: T;
  slice: Slc;
  toString(): T;
};
export function createAction<
  P = any,
  T extends string = string,
  Slc extends string = string
>(type: T, slice: Slc = '' as Slc) {
  const action = (payload: P) => ({
    type,
    slice,
    payload,
  });

  action.type = `${type}` as T;
  action.type = `${slice}` as Slc;
  action.toString = (): T => `${type}` as T;
  return action;
}

export const getActionType = <T extends string>(action: {
  (payload: any): any;
  toString: () => T;
}) => `${action}` as T;
