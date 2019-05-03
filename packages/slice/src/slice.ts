import { PayloadAction, AnyAction } from './types';
import {
  makeActionCreators,
  makeSelectors,
  makeReMapableSelectors,
  ReMappedSelectors,
} from './slice-utils';
import { Draft } from 'immer';
import { createReducer } from './reducer';

interface NotEmptyObject {
  [s: string]: string | number | symbol | boolean | object | undefined | null;
  [s: number]: string | number | symbol | boolean | object | undefined | null;
}
/** Type alias for case reducers when `slice` is blank or undefined */
type CaseReducer<S = any, P = any> = (
  state: Draft<S>,
  payload: P,
) => S | void | undefined;

/** Type alias for the generated reducer */
export type Reducer<S = any, A extends AnyAction = AnyAction> = (
  state: S | undefined,
  action: A,
) => S;

/**
 * A map of case reducers for creating a standard reducer
 * @export
 * @template SS is the [SliceState] or [State]
 * @template A  is the [Action]
 */
export type Cases<SS = any, Ax = any> = {
  [K in keyof Ax]: CaseReducer<SS, Ax[K]>
};

// type PayloadActionMap<A extends ActionCreators<any>> = {
//   [T in keyof A]: ReturnType<A[T]>
// };

/** Generic Actions Map interface */
export interface ActionsMap<P = any> {
  [Action: string]: P;
}
/** Generic State interface
 * @export
 */
export interface AnyState {
  [slice: string]: any;
}

/** Type alias for generated selectors */
export type Selectors<SS> = SS extends any[] | ReadonlyArray<any>
  ? {
      selectSlice: (state: SS) => SS;
    }
  : SS extends AnyState
  ? ({ [key in keyof SS]: (state: SS) => SS[key] } & {
      selectSlice: (state: SS) => SS;
    })
  : {
      selectSlice: (state: SS) => SS;
    };

type InferType<Type, Fallback extends string> = Type extends string
  ? Type
  : Fallback;
/** Type alias for generated action creators */
export type ActionCreators<A, TyO extends { [K in keyof A]?: string } = {}> = {
  [key in Extract<keyof A, string>]: unknown extends A[key] // hacky ternary for `A[key]` = `any`
    ? {
        (payload?: any): PayloadAction<any, InferType<TyO[key], key>>;
        type: InferType<TyO[key], key>;
        toString: () => InferType<TyO[key], key>;
      }
    : A[key] extends never | undefined | void // No payload when type is `never`
    ? {
        (): PayloadAction<undefined, InferType<TyO[key], key>>;
        type: InferType<TyO[key], key>;
        toString: () => InferType<TyO[key], key>;
      }
    : A[key] extends NotEmptyObject
    ? {
        (payload: A[key]): PayloadAction<A[key], InferType<TyO[key], key>>;
        type: InferType<TyO[key], key>;
        toString: () => InferType<TyO[key], key>;
      }
    : {} extends A[key] // ensures payload isn't inferred as {}
    ? {
        (): PayloadAction<undefined, InferType<TyO[key], key>>;
        type: InferType<TyO[key], key>;
        toString: () => InferType<TyO[key], key>;
      }
    : {
        (payload: A[key]): PayloadAction<A[key], InferType<TyO[key], key>>;
        type: InferType<TyO[key], key>;
        toString: () => InferType<TyO[key], key>;
      }
};

/** */
/**
 * @interface Slice
 * @description The interface of the object returned by createSlice
 * @template Ax - is the [Action] creator interface
 * @template SS - [SliceState]
 * @template S - [State]
 * @template Slc - [slice]
 */
export interface Slice<
  Ax,
  SS,
  SelectorMap extends { [s: string]: (s: SS) => any },
  Computed extends { [s: string]: (s: SS) => any },
  TyO extends { [K in keyof Ax]?: string }
> {
  /**
   * @description The generated reducer
   *
   * @type {Reducer<SS, Action>}
   * @memberof Slice
   */
  reducer: Reducer<SS, AnyAction>;
  /**
   * The automatically generated action creators
   *
   * @memberof Slice
   */
  actions: ActionCreators<Ax, TyO>;

  mapSelectorsTo: <P extends string[]>(
    ...paths: P
  ) => ReMappedSelectors<P, SS, SelectorMap & Computed>;
}

interface CreateSliceOptions<SS, Ax, Cx, TyO> {
  /**
   * The initial State, same as standard reducer
   *
   * @type {SS}
   * @memberof InputWithoutSlice
   */
  initialState: SS;
  /**
   * @description - An object whose methods represent the cases the generated reducer handles,
   * can be thought of as the equivalent of [switch-case] statements in a standard reducer.
   *
   * @type {Cases<SS, Ax>}
   * @memberof InputWithoutSlice
   */
  cases: Cases<SS, Ax>;

  computed?: ComputedMap<SS, Cx>;

  typeOverrides?: TyO;
}

type ComputedMap<S, C extends {}> = { [K in keyof C]: (state: S) => C[K] };

/**
 * @description Generates a redux state tree slice, complete with a `reducer`,
 *  `action creators` and `selectors`
 *
 * @export
 *
 * @template Actions - A map of action creator names and payloads, in the form `{[actionName]: typeof payload}`,
 *  a payload type of `never` can be used to indicate that no payload is expected
 *
 * @template SliceState - The interface of the initial state,
 *  it is also the interface of the slice of state.
 *
 * @template State - The interface of the entire redux state tree
 *
 * @param {{cases: Cases<SS, Ax>, initialState: SS, slice: string}} {
 *   cases,
 *   initialState,
 *   slice
 * }
 *
 * @returns {Slice<
 *   Actions,
 *   NoEmptyArray<SliceState>,
 *   State,
 *   typeof slice
 * >} {
 *   reducer,
 *   actions,
 *   selectors,
 *   slice
 * }
 */

export function createSlice<
  Actions extends ActionsMap,
  SliceState,
  Computed extends ActionsMap = {},
  TypeOverrides extends { [K in keyof Actions]?: string } = {}
>({
  cases,
  initialState,
}: CreateSliceOptions<SliceState, Actions, Computed, TypeOverrides>): Slice<
  Actions,
  SliceState,
  Selectors<SliceState>,
  ComputedMap<SliceState, Computed>,
  TypeOverrides
>;
export function createSlice<
  Actions extends ActionsMap,
  SliceState,
  Computed extends ActionsMap = {},
  TypeOverrides extends { [K in keyof Actions]?: string } = {}
>({
  cases,
  initialState,
}: CreateSliceOptions<SliceState, Actions, Computed, TypeOverrides>): Slice<
  Actions,
  SliceState,
  Selectors<SliceState>,
  ComputedMap<SliceState, Computed>,
  TypeOverrides
>;

export function createSlice<
  Actions extends ActionsMap,
  SliceState,
  Computed extends ActionsMap = {},
  TypeOverrides extends { [K in keyof Actions]?: string } = {}
>({
  cases,
  initialState,
  computed = {} as any,
  typeOverrides = {} as TypeOverrides,
}: CreateSliceOptions<SliceState, Actions, Computed, TypeOverrides>) {
  const actionKeys = Object.keys(cases) as Array<
    Extract<keyof Actions, string>
  >;

  const reducer = createReducer({
    cases,
    initialState,
  });

  const actions = makeActionCreators<Actions, TypeOverrides>(
    actionKeys,
    typeOverrides,
  );
  const baseSelectors = makeSelectors(initialState);

  const mapSelectorsTo = makeReMapableSelectors(baseSelectors, computed);

  return {
    actions,
    reducer,
    mapSelectorsTo,
  };
}
