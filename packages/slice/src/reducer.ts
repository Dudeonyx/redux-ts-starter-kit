import createNextState from 'immer';
import { AnyAction } from './types';
import { Cases, ActionsMap, Reducer } from './slice';

/**
 * @description Input for the createReducer utility
 *
 * @export
 * @interface CreateReducer
 * @template SS - The [State] interface
 */
export interface CreateReducer<S = any, A = any> {
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
  cases: Cases<S, A>;
}

/**
 * Creates a simple reducer
 *
 * @export
 * @template S - The [State]
 * @param {CreateReducer<S>} {
 *   initialState,
 *   cases,
 *   slice = '',
 * }
 * @returns
 */

export function createReducer<S, A extends ActionsMap = ActionsMap>({
  initialState,
  cases,
}: CreateReducer<S, A>): Reducer<S, AnyAction> {
  const reducer = (state = initialState, action: AnyAction) =>
    createNextState(state, (draft: any) => {
      const caseReducer = cases[action.type];
      if (caseReducer) {
        return caseReducer(draft, action.payload, action.type);
      }
      return draft;
    }) as S;

  return reducer;
}
