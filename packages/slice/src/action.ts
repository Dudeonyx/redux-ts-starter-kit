export function createAction<P = any, T extends string = string, Slc extends string = string>(type: T, slice: Slc) {
  const action = (payload: P) => ({
    type,
    slice,
    payload,
  });

  action.type = `${type}` as T;
  action.toString = (): T => `${type}` as T;
  return action;
}

export const getActionType = <T extends string>(action: {(payload:any): any; toString: ()=> T}) => `${action}` as T;
