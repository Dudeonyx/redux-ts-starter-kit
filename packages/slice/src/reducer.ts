import createNextState from 'immer';
import { Action } from './types';
import { ReducerMap } from './slice';

export interface CreateReducer<SS = any> {
  initialState: SS;
  cases: ReducerMap<SS, any>;
  slice?: string;
  defaultCase?: (state: SS) => SS | void | undefined;
}
export type NoEmptyArray<State> = State extends never[] ? any[] : State;

export function createReducer<S, SS extends S = any>({
  initialState,
  cases,
  slice = '',
  defaultCase,
}: CreateReducer<NoEmptyArray<SS>>) {
  const reducer = (state = initialState, action: Action<any>) => {
    return createNextState(state, (draft) => {
      const caseReducer = cases[action.type];

      if (caseReducer) {
        return caseReducer(draft as NoEmptyArray<SS>, action.payload);
      }
      if (defaultCase && typeof defaultCase === 'function') {
        return defaultCase(draft as NoEmptyArray<SS>);
      }
      return draft;
    });
  };

  reducer.toString = () => slice;
  return reducer;
}
