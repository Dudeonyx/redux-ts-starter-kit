/* eslint-disable no-console */
import { IS_PRODUCTION } from './selector';

function createAction<P = any, T extends string = string>(type: T) {
  const action = (payload: P) => ({
    type,
    payload,
  });
  action.type = `${type}` as T;
  action.toString = (): T => `${type}` as T;
  return action;
}
export function createSliceAction<T extends string, Sl extends string>(
  type: T,
  slice: Sl,
) {
  return <P>() => {
    const action = (payload: P) => ({
      type,
      payload,
      slice,
    });
    action.type = String(type) as T;
    action.slice = String(slice) as Sl;
    action.toString = (): T => String(type) as T;
    return action;
  };
}

export function createType(type: ''): never;
export function createType<T extends string>(type: T): T;
export function createType<T extends string>(type: T) {
  if (String(type) !== type) {
    // tslint:disable-next-line: no-unused-expression
    IS_PRODUCTION ||
      console.error(
        `The argument to createType must be a string, But a(n) ${typeof type} was received instead.`,
      );
  }
  return type;
}

export function createTypeSafeActionCreator<T extends string>(type: T) {
  return <P>() => createAction<P, T>(type);
}

export const getActionType = (action: any) => `${action}`;
