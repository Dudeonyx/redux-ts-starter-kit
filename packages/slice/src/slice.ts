import { PayloadAction, AnyAction } from './types';
import {
  makeActionCreators,
  makeSelectors,
  makeReMapableSelectors,
  ReMappedSelectors,
  makeReducer,
  makeNameSpacedReducer,
} from './slice-utils';
import { Draft } from 'immer';

interface NotEmptyObject {
  [s: string]: string | number | symbol | boolean | object | undefined | null;
  [s: number]: string | number | symbol | boolean | object | undefined | null;
}
/** Type alias for case reducers when `slice` is blank or undefined */
type CaseReducer<S = any, P = any, T extends string = string> = (
  state: Draft<S>,
  payload: P,
  type: T,
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
export type Cases<
  SS,
  Ax extends {},
  TyO extends { [C in keyof Ax]?: string } = {}
> = {
  [K in keyof Ax]: CaseReducer<SS, Ax[K], InferType<TyO, Extract<K, string>>>
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

type InferType<
  TyO extends { [s: string]: string | undefined },
  Fallback extends string
> = TyO extends { [K in Fallback]: string } ? TyO[Fallback] : Fallback;
/** Type alias for generated action creators */
export type ActionCreators<A, TyO extends { [K in keyof A]?: string } = {}> = {
  [key in Extract<keyof A, string>]: unknown extends A[key] // hacky ternary for `A[key]` = `any`
    ? {
        (payload?: any): PayloadAction<any, InferType<TyO, key>>;
        type: InferType<TyO, key>;
        toString: () => InferType<TyO, key>;
      }
    : A[key] extends never | undefined | void // No payload when type is `never`
    ? {
        (): PayloadAction<undefined, InferType<TyO, key>>;
        type: InferType<TyO, key>;
        toString: () => InferType<TyO, key>;
      }
    : A[key] extends NotEmptyObject
    ? {
        (payload: A[key]): PayloadAction<A[key], InferType<TyO, key>>;
        type: InferType<TyO, key>;
        toString: () => InferType<TyO, key>;
      }
    : {} extends A[key] // ensures payload isn't inferred as {}
    ? {
        (): PayloadAction<undefined, InferType<TyO, key>>;
        type: InferType<TyO, key>;
        toString: () => InferType<TyO, key>;
      }
    : {
        (payload: A[key]): PayloadAction<A[key], InferType<TyO, key>>;
        type: InferType<TyO, key>;
        toString: () => InferType<TyO, key>;
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
  Ax extends ActionCreators<any, any>,
  SS,
  SelectorMap extends { [s: string]: (s: SS) => any }
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
  actions: Ax;

  mapSelectorsTo: <
    P extends string[] & {
      length: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
    }
  >(
    ...paths: P
  ) => ReMappedSelectors<P, SelectorMap>;

  createNameSpacedReducer: <Sl extends string>(
    slice: Sl,
  ) => {
    sliceReducer: Reducer<SS> & { toString: () => Sl };
    sliceActions: {
      [K in keyof Ax]: Ax[K] & {
        slice: Sl;
      }
    };
  };
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
  cases: Cases<SS, Ax, TyO>;

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
  ActionCreators<Actions, TypeOverrides>,
  SliceState,
  (Selectors<SliceState>) & ComputedMap<SliceState, Computed>
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
  ActionCreators<Actions, TypeOverrides>,
  SliceState,
  (Selectors<SliceState>) & ComputedMap<SliceState, Computed>
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
}: CreateSliceOptions<SliceState, Actions, Computed, TypeOverrides>): Slice<
  ActionCreators<Actions, TypeOverrides>,
  SliceState,
  (Selectors<SliceState>) & ComputedMap<SliceState, Computed>
> {
  const actionKeys = Object.keys(cases) as Array<
    Extract<keyof Actions, string>
  >;

  const reducer = makeReducer(initialState, cases, typeOverrides);

  const actions = makeActionCreators<Actions, TypeOverrides>(
    actionKeys,
    typeOverrides,
  );
  const baseSelectors = makeSelectors(initialState);

  const createNameSpacedReducer = makeNameSpacedReducer(reducer, actions);

  const mapSelectorsTo = makeReMapableSelectors(baseSelectors, computed);

  return {
    actions,
    reducer,
    mapSelectorsTo,
    createNameSpacedReducer,
  };
}
