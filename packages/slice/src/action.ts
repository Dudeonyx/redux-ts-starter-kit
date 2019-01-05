import { ActionType } from './types';

export function createAction<P = any>(type: ActionType) {
  const action = (payload: P) => ({
    type,
    payload,
  });

  action.toString = () => `${type}`;
  return action;
}

export const getActionType = (action: any) => `${action}`;
