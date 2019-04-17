import { TestType, Action, GenericAction } from './types';
import { PayloadAction } from './types';
import { makeReducer, makeActionCreators, makeSelectors } from './slice-utils';
import { Draft } from 'immer';

/** Type alias for case reducers when `slice` is blank or undefined */
// tslint:disable-next-line: callable-types
type CaseReducer<SS, A extends Action> = (
  state: Draft<SS>,
  action: A extends PayloadAction<infer P, infer T> ? {} extends P ? PayloadAction<any,any>: PayloadAction<P,T>: never,
) => SS | void | undefined;

/** Type alias for the generated reducer */
export interface Reducer<
  SS = any,
  A extends GenericAction<any, any, any> = GenericAction<any, any, any>,
  SliceName extends string = any
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
export type Cases<SS, Ax extends { [s: string]: PayloadAction<any> }> = {
  [K in keyof Ax]: Ax[K] extends PayloadAction<any, any>
    ? CaseReducer<SS, Ax[K]>
    : void
};

export type Casesify<SS, A extends { [s: string]: any }> = {
  [key in keyof A]: CaseReducer<SS, PayloadAction<A[key]>>
};

export type Actionify<A extends { [s: string]: any }> = {
  [key in keyof A]: PayloadAction<A[key]>
};
/** Generic Actions Map interface */
export interface ActionsMap {
  [action: string]: any;
}

type CaseActions<CS extends Cases<any, any>> = {
  [T in keyof CS]: CS[T] extends (state: any) => any
    ? PayloadAction<undefined, any, any>
    : (CS[T] extends (
        state: any,
        action: PayloadAction<infer P, infer Ty, any>,
      ) => any
        ? PayloadAction<P, Ty, any>
        : PayloadAction<void, any, any>)
};

/** Generic State interface
 * @export
 */
export interface AnyState {
  [slice: string]: any;
}

/** Type alias for generated selectors */
export type Selectors<SS, S, D extends 0 | 1 | 2 = 1> = D extends 1 | 2
  ? TestType<SS> extends 'Object'
    ? ({
        [key in keyof SS]: TestType<SS[key]> extends 'Object'
          ? D extends 2
            ? Selectors<SS[key], S, 1>
            : (state: S) => SS[key]
          : (state: S) => SS[key]
      } & {
        getSlice: (state: S) => SS;
      })
    : {
        getSlice: (state: S) => SS;
      }
  : {
      getSlice: (state: S) => SS;
    };

/** Type alias for generated action creators */
export type ActionCreators<A extends ActionsMap, Slc extends string = ''> = {
  [key in Extract<keyof A, string>]: A[key] extends PayloadAction<
    infer P,
    infer K,
    any
  >
    ? TestType<P> extends 'Any'
      ? {
          (payload?: any): PayloadAction<any, K, Slc>;
          type: K;
          slice: Slc;
          toString: () => K;
        } // tslint:disable-next-line: ban-types
      : TestType<P> extends 'EmptyObject' | 'Never' | never // ensures payload isn't inferred as {}
      ? {
          (): PayloadAction<undefined, K, Slc>;
          type: K;
          slice: Slc;
          toString: () => K;
        }
      : {
          (payload: P): PayloadAction<P, K, Slc>;
          type: K;
          slice: Slc;
          toString: () => K;
        }
    : TestType<A[key]> extends 'Any'
    ? {
        (payload?: any): PayloadAction<any, string, Slc>;
        type: string;
        slice: Slc;
        toString: () => string;
      }
    : {
        (): PayloadAction<any, string, Slc>;
        type: string;
        slice: Slc;
        toString: () => string;
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
export interface Slice<
  CS extends Cases<SS,any>,
  SS,
  SliceName extends string
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
   * @type {Reducer<SS, GenericAction< any,string, string>, SliceName>}
   * @memberof Slice
   */
  reducer: Reducer<SS, GenericAction<any, string, string>, SliceName>;
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
  actions: ActionCreators<CaseActions<CS>, SliceName>;
}

interface InputWithoutSlice<SS, CS extends Cases<SS,any>> {
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
  cases: CS;
}

interface InputWithSlice<SS, CS extends Cases<SS,any>, SliceName extends string>
  extends InputWithoutSlice<SS, CS> {
  /**
   * @description An optional property representing the key of the generated slice in the redux state tree.
   *
   * @type {keyof S}
   * @memberof InputWithSlice
   */
  slice: SliceName;
}

interface InputWithBlankSlice<SS, CS extends Cases<SS,any>>
  extends InputWithoutSlice<SS, CS> {
  /**
   * @description An optional property representing the key of the generated slice in the redux state tree.
   *
   * @type {''}
   * @memberof InputWithBlankSlice
   */
  slice: '';
}
interface InputWithOptionalSlice<
  SS,
  CS extends Cases<SS,any>,
  SliceName extends string
> extends InputWithoutSlice<SS, CS> {
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
 * @template SliceName - The name of the slice of state the reducer manages,
 * can be blank or left out entirely
 *
 * @param {{cases: Cases<SS, Ax>, initialState: SS, slice: string}} {
 *   cases,
 *   initialState,
 *   slice
 * }
 *
 * @returns {Slice<Actions, SliceState, SliceName>} {
 *   reducer,
 *   actions,
 *   selectors,
 *   slice
 * }
 */
export function createSlice<
  CaseMap extends Cases<SliceState, any>,
  SliceState,
  SliceName extends ''
>({
  cases,
  initialState,
  slice,
}: InputWithBlankSlice<SliceState, CaseMap>): Slice<CaseMap, SliceState, ''>;

export function createSlice<
  CaseMap extends Cases<SliceState, any>,
  SliceState,
  SliceName extends string
>({
  cases,
  initialState,
  slice,
}: InputWithSlice<SliceState, CaseMap, SliceName>): Slice<
  CaseMap,
  SliceState,
  SliceName
>;

export function createSlice<
  CaseMap extends Cases<SliceState, any>,
  SliceState,
  SliceName extends string
>({
  cases,
  initialState,
}: InputWithoutSlice<SliceState, CaseMap>): Slice<CaseMap, SliceState, ''>;

export function createSlice<
  CaseMap extends Cases<SliceState, any>,
  SliceState,
  SliceName extends string
>({
  cases,
  initialState,
  slice = '' as any,
}: InputWithOptionalSlice<SliceState, CaseMap, SliceName>): Slice<
  CaseMap,
  SliceState,
  SliceName
> {
  const actionKeys = Object.keys(cases) as Array<
    Extract<keyof CaseMap, string>
  >;

  const reducer = makeReducer<CaseMap, SliceState, SliceName>(
    cases,
    initialState,
    slice,
  );

  const actions = makeActionCreators<CaseActions<CaseMap>, SliceName>(actionKeys, slice);

  const selectors = makeSelectors<SliceState, SliceName>(slice, initialState);
  return {
    actions,
    reducer,
    slice,
    selectors: selectors as any,
  };
}
