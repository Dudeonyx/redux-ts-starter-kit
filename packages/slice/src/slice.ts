import { createAction } from './action';
import { createReducer, NoEmptyArray } from './reducer';
import { createSubSelector, createSelector } from './selector';
import { Action } from './types';
import { actionTypeBuilder } from './actionTypeBuilder';

/** fix for `let` initialised `slice` */
type NoBadState<S> = S extends { [x: string]: {} } ? AnyState : S;

/** Type alias for case reducers when `slice` is blank or undefined */
type CaseReducer<SS = any, A = any> = (
  state: SS,
  payload: A,
) => SS | void | undefined;

/** Type alias for the generated reducer */
export type Reducer<SS = any, A extends Action = Action> = (
  state: SS | undefined,
  payload: A,
) => SS;

/** Map of `cases` */
export type Cases<SS = any, Ax = any> = {
  [K in keyof Ax]: CaseReducer<SS, Ax[K]>
};
/** Generic Actions interface */
interface ActionsAny<P = any> {
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
export interface ReducerMap<SS, A = Action> {
  [Action: string]: CaseReducer<SS>;
}
/** Type alias for generated selectors */
export type Selectors<SS, S> = SS extends any[]
  ? {
      getSlice: (state: NoBadState<S>) => SS;
    }
  : SS extends AnyState
  ? ({ [key in keyof SS]: (state: NoBadState<S>) => SS[key] } & {
      getSlice: (state: NoBadState<S>) => SS;
    })
  : {
      getSlice: (state: NoBadState<S>) => SS;
    };
/** Type alias for generated action creators */
export type ActionCreators<A> = {
  // tslint:disable-next-line: ban-types
  [key in keyof A]: Object extends A[key] // ensures payload isn't inferred as {}
    ? (payload?: any) => Action
    : A[key] extends never // No payload when type is `never`
    ? () => Action
    : (payload: A[key]) => Action<A[key]>
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
export interface Slice<A = any, SS = any, S = SS, Slc = ''> {
  /**
   * @description The name of the slice generated, i.e it's key in the redux state tree.
   * @type {Slc}
   * @memberof Slice
   */
  slice: Slc;
  /**
   * @description The generated reducer
   *
   * @type {Reducer<SS, Action>}
   * @memberof Slice
   */
  reducer: Reducer<SS, Action>;
  /**
   * The automatically generated selectors
   *
   * @memberof Slice
   */
  selectors: Selectors<SS, S>;
  /**
   * The automatically generated action creators
   *
   * @memberof Slice
   */
  actions: ActionCreators<A>;
}

interface InputWithoutSlice<SS = any, Ax = ActionsAny> {
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

interface InputWithSlice<SS = any, Ax = ActionsAny, S = any>
  extends InputWithoutSlice<SS, Ax> {
  /**
   * @description An optional property representing the key of the generated slice in the redux state tree.
   *
   * @type {keyof S}
   * @memberof InputWithSlice
   */
  slice: keyof S;
}

interface InputWithBlankSlice<SS = any, Ax = ActionsAny>
  extends InputWithoutSlice<SS, Ax> {
  /**
   * @description An optional property representing the key of the generated slice in the redux state tree.
   *
   * @type {''}
   * @memberof InputWithBlankSlice
   */
  slice: '';
}
interface InputWithOptionalSlice<SS = any, Ax = ActionsAny, S = any>
  extends InputWithoutSlice<SS, Ax> {
  /**
   * @description An optional property representing the key of the generated slice in the redux state tree.
   *
   * @type {keyof S}
   * @memberof InputWithOptionalSlice
   */
  slice?: keyof S;
}

/**
 * @description Generates a redux state tree slice, complete with a r`educer]`,
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
 * @param {{cases: Cases<SS, Ax>, initialState: SS, slice: string}} {{
 *   cases,
 *   initialState,
 *   slice
 * }}
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
  Actions extends ActionsAny,
  SliceState,
  State extends SliceState
>({
  cases,
  initialState,
  slice,
}: InputWithBlankSlice<NoEmptyArray<SliceState>, Actions>): Slice<
  Actions,
  NoEmptyArray<SliceState>,
  State,
  ''
>;

export function createSlice<
  Actions extends ActionsAny,
  SliceState,
  State extends AnyState
>({
  cases,
  initialState,
  slice,
}: InputWithSlice<NoEmptyArray<SliceState>, Actions, State>): Slice<
  Actions,
  NoEmptyArray<SliceState>,
  State,
  typeof slice
>;

export function createSlice<
  Actions extends ActionsAny,
  SliceState,
  State extends SliceState
>({
  cases,
  initialState,
}: InputWithoutSlice<NoEmptyArray<SliceState>, Actions>): Slice<
  Actions,
  NoEmptyArray<SliceState>,
  NoEmptyArray<SliceState>,
  ''
>;

export function createSlice<
  Actions extends ActionsAny,
  SliceState,
  State extends AnyState
>({
  cases,
  initialState,
  slice = '',
}: InputWithOptionalSlice<NoEmptyArray<SliceState>, Actions, State>) {
  const actionKeys = Object.keys(cases) as Array<keyof Actions>;
  const createActionType = actionTypeBuilder(slice);

  const reducerMap = actionKeys.reduce<ReducerMap<NoEmptyArray<SliceState>>>(
    (map, action) => {
      map[createActionType(action)] = cases[action];
      return map;
    },
    {},
  );
  const reducer = createReducer({
    initialState,
    cases: reducerMap,
    slice: slice as string,
  });

  const actionMap: ActionCreators<Action> = actionKeys.reduce(
    (map, action) => {
      const type = createActionType(action);
      map[action] = createAction(type);
      return map;
    },
    {} as any,
  );

  let initialStateKeys: Array<keyof SliceState> = [];
  if (
    typeof initialState === 'object' &&
    initialState !== null &&
    !Array.isArray(initialState)
  ) {
    initialStateKeys = Object.keys(initialState) as Array<keyof SliceState>;
  }
  const otherSelectors = initialStateKeys.reduce<
    { [key in keyof SliceState]: (state: State) => SliceState[key] }
  >(
    (map, key) => {
      map[key] = createSubSelector<State, SliceState>(slice, key);
      return map;
    },
    {} as any,
  );
  const selectors = {
    getSlice: createSelector<State, SliceState>(slice),
    ...otherSelectors,
  };
  return {
    actions: actionMap,
    reducer,
    slice,
    selectors,
  };
}
