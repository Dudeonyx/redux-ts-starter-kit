import createNextState from 'immer';
import type { AnyAction } from './types';
import type { CasesBase, Reducer } from './slice';

/**
 * @description Input for the createReducer utility
 *
 * @export
 * @interface CreateReducer
 * @template SS - The [State] interface
 */
export interface CreateReducer<S = any, C extends CasesBase<S> = any> {
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
  cases: C;
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

export function createReducer<S, C extends CasesBase<S> = CasesBase<S>>({
  initialState,
  cases,
}: CreateReducer<S, C>): Reducer<S, AnyAction> {
  const reducer = (state = initialState, action: AnyAction) =>
    createNextState(state, (draft: any) => {
      const caseReducer = cases[action.type];
      if (caseReducer) {
        return caseReducer(draft, action.payload);
      }
      return draft;
    }) as S;

  return reducer;
}
