import createNextState from 'immer';
import { Action } from './types';
import { ReducerMap } from './slice';

/**
 * @description Input for the createReducer utility
 *
 * @export
 * @interface CreateReducer
 * @template SS - The [State] interface
 */
export interface CreateReducer<S = any> {
  /**
   * The initial State, same as in standard reducer
   *
   * @type {S}
   * @memberof CreateReducer
   */
  initialState: S;
  /**
   * @description - An object whose methods represent the cases the generated reducer handles,
   * can be thought of as the equivalent of [switch-case] statements in a standard reducer.
   *
   * @type {ReducerMap<SS, any>}
   * @memberof CreateReducer
   */
  cases: ReducerMap<S, any>;

  /**
   * @description An optional property representing the key of the generated slice in the redux state tree.
   *
   * @type {string}
   * @memberof CreateReducer
   */
  slice?: string;
}
/** fix for `never[]` */
export type NoEmptyArray<State> = State extends never[] ? any[] : State;

/**
 *
 *
 * @export
 * @template S - The [State]
 * @template SS -
 * @param {CreateReducer<NoEmptyArray<SS>>} {
 *   initialState,
 *   cases,
 *   slice = '',
 * }
 * @returns
 */
export function createReducer<S>({
  initialState,
  cases,
  slice = '',
}: CreateReducer<NoEmptyArray<S>>) {
  const reducer = (state = initialState, action: Action<any>) => {
    return createNextState(state, (draft) => {
      const caseReducer = cases[action.type];

      if (caseReducer) {
        return caseReducer(draft as NoEmptyArray<S>, action.payload);
      }

      return draft;
    });
  };

  reducer.toString = () => slice;
  return reducer;
}
