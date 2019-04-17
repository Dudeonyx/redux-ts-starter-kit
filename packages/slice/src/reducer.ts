import { produce as createNextState } from 'immer';
import { PayloadAction, GenericAction } from './types';
import { Cases, Reducer } from './slice';

/**
 * @description Input for the createReducer utility
 *
 * @export
 * @interface CreateReducer
 * @template SS - The [State] interface
 */
export interface CreateReducer<S, CS extends Cases<S,any>, SliceName = string> {
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
  cases: CS;
}

interface CreateReducer2<S, CS extends Cases<S, any>, SliceName>
  extends CreateReducer<S, CS, SliceName> {
  /**
   * @description An optional property representing the key of the generated slice in the redux state tree.
   *
   * @type {string}
   * @memberof CreateReducer
   */
  slice: SliceName;
}
interface CreateReducer3<S, CS extends Cases<S, any>, SliceName>
  extends CreateReducer<S, CS, SliceName> {
  /**
   * @description An optional property representing the key of the generated slice in the redux state tree.
   *
   * @type {string}
   * @memberof CreateReducer
   */
  slice?: SliceName;
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
  CS extends Cases<S,any>,
  SliceName extends string
>({
  initialState,
  cases,
  slice,
}: CreateReducer2<S, CS, SliceName>): Reducer<
  S,
  GenericAction<any, string>,
  SliceName
>;

export function createReducer<
  S,
  CS extends Cases<S,any>,
  SliceName extends string
>({
  initialState,
  cases,
}: CreateReducer<S, CS, SliceName>): Reducer<S, GenericAction<any, string>, ''>;

export function createReducer<
  S,
  CS extends Cases<S,any>,
  SliceName extends string = string
>({
  initialState,
  cases,
  slice = '' as SliceName,
}: CreateReducer3<S, CS, SliceName>): Reducer<S, GenericAction, SliceName> {
  const reducer = (state = initialState, action: GenericAction) => {
    return createNextState(state, (draft) => {
      const caseReducer = cases[action.type];

      if (caseReducer) {
        return caseReducer(draft, action as PayloadAction);
      }

      return draft;
    }) as S;
  };

  reducer.toString = () => slice;
  return reducer;
}
