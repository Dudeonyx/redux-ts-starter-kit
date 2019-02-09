export function createAction<P = any, T extends string = string>(type: T) {
  const action = (payload: P) => ({
    type,
    payload,
  });

  action.type = `${type}` as T;
  action.toString = (): T => `${type}` as T;
  return action;
}

export const getActionType = (action: any) => `${action}`;
