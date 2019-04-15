import { produce as createNextState } from 'immer';
import { PayloadAction } from './types';
import { Cases, ActionsMap, Reducer } from './slice';

/**
 * @description Input for the createReducer utility
 *
 * @export
 * @interface CreateReducer
 * @template SS - The [State] interface
 */
export interface CreateReducer<S = any, A = any, SliceName = string> {
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

interface CreateReducer2<S, A, SliceName>
  extends CreateReducer<S, A, SliceName> {
  /**
   * @description An optional property representing the key of the generated slice in the redux state tree.
   *
   * @type {string}
   * @memberof CreateReducer
   */
  slice: SliceName;
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
export function createReducer<
  S,
  A extends ActionsMap = ActionsMap,
  SliceName extends string = string
>({
  initialState,
  cases,
  slice,
}: CreateReducer2<S, A, SliceName>): Reducer<S, PayloadAction, SliceName>;

export function createReducer<
  S,
  A extends ActionsMap = ActionsMap,
  SliceName extends string = string
>({
  initialState,
  cases,
}: CreateReducer<S, A, SliceName>): Reducer<S, PayloadAction, ''>;

export function createReducer<
  S,
  A extends ActionsMap = ActionsMap,
  SliceName extends string = string
>({ initialState, cases, slice = '' }: any): any {
  const reducer = (state = initialState, action: PayloadAction) => {
    return createNextState(state, (draft) => {
      const caseReducer = cases[action.type];

      if (caseReducer) {
        return caseReducer(draft as S, action.payload);
      }

      return draft;
    });
  };

  reducer.toString = () => slice;
  return reducer as any;
}
