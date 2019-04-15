import { PayloadAction } from './types';
import { makeReducer, makeActionCreators, makeSelectors } from './slice-utils';
import { Draft } from 'immer';

/** Type alias for case reducers when `slice` is blank or undefined */
type CaseReducer<SS = any, A = any> = (
  state: Draft<SS>,
  payload: A,
) => SS | void | undefined;

/** Type alias for the generated reducer */
export interface Reducer<
  SS = any,
  A extends PayloadAction = PayloadAction<string, any, any>,
  SliceName extends string = string
> {
  (state: SS | undefined, action: A): SS;
  toString: () => SliceName;
}

/**
 * A map of case reducers for creating a standard reducer
 * @export
 * @template SS is the [SliceState] or [State]
 * @template A  is the [Action]
 */
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

type TestType<G> = unknown extends G // Hacky ternary to catch `any`
  ? 'Any'
  : G extends number
  ? 'Number'
  : G extends string
  ? 'String'
  : G extends symbol
  ? 'Symbol'
  : G extends boolean
  ? 'Boolean'
  : G extends any[] | ReadonlyArray<any>
  ? 'Array'
  : G extends Error
  ? 'Error'
  : G extends Date
  ? 'Date'
  : G extends Map<any, any>
  ? 'Map'
  : G extends WeakMap<any, any>
  ? 'WeakMap'
  : G extends Set<any>
  ? 'Set'
  : G extends WeakSet<any>
  ? 'WeakSet' // tslint:disable-next-line: ban-types
  : G extends String
  ? 'String()' // tslint:disable-next-line: ban-types
  : G extends Number
  ? 'Number()' // tslint:disable-next-line: ban-types
  : G extends Boolean
  ? 'Boolean()' // tslint:disable-next-line: ban-types
  : G extends Symbol
  ? 'Symbol()'
  : {} extends G
  ? 'EmptyObject'
  : G extends AnyState
  ? 'Object'
  : G extends object
  ? 'Non-primitive'
  : never extends G
  ? 'Never'
  : 'Unknown';

// type FD1 = TestType<unknown>;
// type FD2 = TestType<string>;
// type FD3 = TestType<never>;
// type FD4 = TestType<number>;
// type FD5 = TestType<{}>;
// type FD6 = TestType<[]>;
// type FD7 = TestType<Error>;
// type FD8 = TestType<Date>;
// type FD9 = TestType<WeakMap<any,any>>;
// type FD10 = TestType<WeakSet<any>>;
// type FD11 = TestType<Map<any,any>>;
// type FD12 = TestType<Set<any>>;
// type FD13 = TestType<Number>;
/** Type alias for generated selectors */
export type Selectors<SS, S, D extends 0 | 1 = 1> = TestType<
  SS
> extends 'Object'
  ? ({
      [key in keyof SS]: D extends 1
        ? TestType<SS[key]> extends 'Object'
          ? Selectors<SS[key], S, 0>
          : (state: S) => SS[key]
        : (state: S) => SS[key]
    } & {
      getSlice: (state: S) => SS;
    })
  : {
      getSlice: (state: S) => SS;
    };

/** Type alias for generated action creators */
export type ActionCreators<A, Slc extends string = ''> = {
  [key in Extract<keyof A, string>]: TestType<A[key]> extends 'Any'
    ? {
        (payload?: any): PayloadAction<key, any, Slc>;
        type: key;
        slice: Slc;
        toString: () => key;
      } // tslint:disable-next-line: ban-types
    : TestType<A[key]> extends 'EmptyObject' | 'Never' | never // ensures payload isn't inferred as {}
    ? {
        (): PayloadAction<key, undefined, Slc>;
        type: key;
        slice: Slc;
        toString: () => key;
      }
    : {
        (payload: A[key]): PayloadAction<key, A[key], Slc>;
        type: key;
        slice: Slc;
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
 * @template SliceName - [slice]
 */
export interface Slice<A = any, SS = any, SliceName extends string = string> {
  /**
   * @description The name of the slice generated, i.e it's key in the redux state tree.
   * @type {SliceName}
   * @memberof Slice
   */
  slice: SliceName;
  /**
   * @description The generated reducer
   *
   * @type {Reducer<SS, PayloadAction<string, any, string>, SliceName>}
   * @memberof Slice
   */
  reducer: Reducer<SS, PayloadAction<string, any, string>, SliceName>;
  /**
   * @description The generated slice reducer, unlike the normal reducer
   * `sliceReducer` only listens to actions with a matching `slice` key
   *
   * @type {Reducer<SS, PayloadAction<string, any, SliceName>, SliceName>}
   * @memberof Slice
   */
  sliceReducer: Reducer<SS, PayloadAction<string, any, SliceName>, SliceName>;
  /**
   * The automatically generated selectors
   *
   * @memberof Slice
   */
  selectors: SliceName extends ''
    ? Selectors<SS, SS>
    : Selectors<SS, { [slice in SliceName]: SS }>;
  /**
   * The automatically generated action creators
   *
   * @memberof Slice
   */
  actions: ActionCreators<A, SliceName>;
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
}: InputWithBlankSlice<SliceState, Actions>): Slice<Actions, SliceState, ''>;

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
}: InputWithoutSlice<SliceState, Actions>): Slice<Actions, SliceState, ''>;

export function createSlice<
  Actions extends ActionsMap,
  SliceState,
  SliceName extends string
>({
  cases,
  initialState,
  slice = '' as any,
}: InputWithOptionalSlice<SliceState, Actions, SliceName>): Slice<
  Actions,
  SliceState,
  SliceName
> {
  const actionKeys = Object.keys(cases) as Array<
    Extract<keyof Actions, string>
  >;

  const [reducer, sliceReducer,] = makeReducer<Actions, SliceState, SliceName>(
    cases,
    initialState,
    slice,
  );

  const actions = makeActionCreators<Actions, SliceName>(actionKeys, slice);

  const selectors = makeSelectors<SliceState, SliceName>(slice, initialState);
  return {
    actions,
    reducer: reducer as any,
    sliceReducer,
    slice,
    selectors: selectors as any,
  };
}
