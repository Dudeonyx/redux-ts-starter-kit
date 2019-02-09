import { PayloadAction } from './types';
import { makeReducer, makeActionCreators, makeSelectors } from './slice-utils';

/** Type alias for case reducers when `slice` is blank or undefined */
type CaseReducer<SS = any, A = any> = (
  state: SS,
  payload: A,
) => SS | void | undefined;

/** Type alias for the generated reducer */
export interface Reducer<
  SS = any,
  A extends PayloadAction = PayloadAction,
  SliceName extends string = string
> {
  (state: SS | undefined, action: A): SS;
  toString: () => SliceName;
}

/** Map of `cases` */
export type Cases<SS = any, Ax = any> = {
  [K in keyof Ax]: CaseReducer<SS, Ax[K]>
};
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

/**
 * A map of case reducers for creating a standard reducer
 * @export
 * @template SS is the [SliceState] or [State]
 * @template A  is the [Action]
 */
export type ReducerMap<SS, A = ActionsMap> = {
  [key in keyof A]: CaseReducer<SS, A[key]>
};
/** Type alias for generated selectors */
export type Selectors<SS, S> = SS extends any[]
  ? {
      getSlice: (state: S) => SS;
    }
  : SS extends AnyState
  ? ({ [key in keyof SS]: (state: S) => SS[key] } & {
      getSlice: (state: S) => SS;
    })
  : {
      getSlice: (state: S) => SS;
    };
/** Type alias for generated action creators */
export type ActionCreators<A> = {
  [key in keyof A]: unknown extends A[key] // hacky ternary for `A[key]` = `any`
    ? {
        (payload?: any): PayloadAction<Extract<key, string>, any>;
        type: key;
        toString: () => key;
      } // tslint:disable-next-line: ban-types
    : Object extends A[key] // ensures payload isn't inferred as {}
    ? {
        (): PayloadAction<Extract<key, string>, undefined>;
        type: key;
        toString: () => key;
      }
    : A[key] extends never // No payload when type is `never`
    ? {
        (): PayloadAction<Extract<key, string>, undefined>;
        type: key;
        toString: () => key;
      }
    : {
        (payload: A[key]): PayloadAction<Extract<key, string>, A[key]>;
        type: key;
        toString: () => key;
      }
};

/** */
/**
 * @interface Slice
 * @description The interface of the object returned by createSlice
 * @template A - is the [Action] creator interface
 * @template SS - [SliceState]
 * @template S - [State]
 * @template Slc - [slice]
 */
export interface Slice<
  A = any,
  SS = any,
  SliceName extends string = string
> {
  /**
   * @description The name of the slice generated, i.e it's key in the redux state tree.
   * @type {SliceName}
   * @memberof Slice
   */
  slice: SliceName;
  /**
   * @description The generated reducer
   *
   * @type {Reducer<SS, Action>}
   * @memberof Slice
   */
  reducer: Reducer<SS, PayloadAction, SliceName>;
  /**
   * The automatically generated selectors
   *
   * @memberof Slice
   */
  selectors: SliceName extends '' ? Selectors<SS, SS> : Selectors<SS, {[slice in SliceName]: SS}>;
  /**
   * The automatically generated action creators
   *
   * @memberof Slice
   */
  actions: ActionCreators<A>;
}

interface InputWithoutSlice<SS = any, Ax = ActionsMap> {
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
}

interface InputWithSlice<
  SS = any,
  Ax = ActionsMap,
  SliceName extends string = string
> extends InputWithoutSlice<SS, Ax> {
  /**
   * @description An optional property representing the key of the generated slice in the redux state tree.
   *
   * @type {keyof S}
   * @memberof InputWithSlice
   */
  slice: SliceName;
}

interface InputWithBlankSlice<SS = any, Ax = ActionsMap>
  extends InputWithoutSlice<SS, Ax> {
  /**
   * @description An optional property representing the key of the generated slice in the redux state tree.
   *
   * @type {''}
   * @memberof InputWithBlankSlice
   */
  slice: '';
}
interface InputWithOptionalSlice<
  SS = any,
  Ax = ActionsMap,
  SliceName extends string = string
> extends InputWithoutSlice<SS, Ax> {
  /**
   * @description An optional property representing the key of the generated slice in the redux state tree.
   *
   * @type {keyof S}
   * @memberof InputWithOptionalSlice
   */
  slice?: SliceName;
}

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
  SliceName extends ''
>({
  cases,
  initialState,
  slice,
}: InputWithBlankSlice<SliceState, Actions>): Slice<
  Actions,
  SliceState,
  ''
>;

export function createSlice<
  Actions extends ActionsMap,
  SliceState,
  SliceName extends string
>({
  cases,
  initialState,
  slice,
}: InputWithSlice<SliceState, Actions, SliceName>): Slice<
  Actions,
  SliceState,
  SliceName
>;

export function createSlice<
  Actions extends ActionsMap,
  SliceState,
  SliceName extends string
>({
  cases,
  initialState,
}: InputWithoutSlice<SliceState, Actions>): Slice<
  Actions,
  SliceState,
  ''
>;

export function createSlice<
  Actions extends ActionsMap,
  SliceState,
  SliceName extends string
>({
  cases,
  initialState,
  slice = '' as any,
}: InputWithOptionalSlice<SliceState, Actions, SliceName>) {
  const actionKeys = Object.keys(cases) as Array<
    Extract<keyof Actions, string>
  >;

  const reducer = makeReducer<Actions, SliceState, SliceName>(
    cases,
    initialState,
    slice,
  );

  const actions = makeActionCreators<Actions>(actionKeys);

  const selectors = makeSelectors<SliceState, SliceName>(slice, initialState);
  return {
    actions,
    reducer,
    slice,
    selectors,
  };
}
