import { PayloadAction, AnyAction } from './types';
import {
  makeActionCreators,
  makeSelectors,
  makeReMapableSelectors,
  makeReducer,
  makeNameSpacedReducer,
  MapSelectorsTo,
  CreateNameSpace,
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
 * @template SS is the `SliceState`
 * @template Ax  is the `ActionsMap`
 */
export type Cases<
  SS,
  Ax extends {},
  TyO extends { [C in keyof Ax]?: string } = {}
> = { [K in keyof Ax]: CaseReducer<SS, Ax[K], InferType<TyO[K], K>> };

/** Generic Actions Map interface */
export interface ActionsMap<P = any> {
  [Action: string]: P;
}
export interface AnyState {
  [slice: string]: any;
}

/** Type alias for generated selectors */
export type Selectors<SS> = {
  selectSlice: (state: SS) => SS;
} & (SS extends any[] | ReadonlyArray<any>
  ? {}
  : SS extends AnyState
  ? { [key in keyof SS]: (state: SS) => SS[key] }
  : {});
type InferType<TyO extends string | undefined, Fallback> = TyO extends string
  ? TyO
  : Fallback extends string
  ? Fallback
  : never;
/** Type alias for generated action creators */
export type ActionCreators<A, TyO extends { [K in keyof A]?: string } = {}> = {
  [key in Extract<keyof A, string>]: ActionCreator<
    A,
    key,
    InferType<TyO[key], key>
  > & {
    type: InferType<TyO[key], key>;
    toString: () => InferType<TyO[key], key>;
  }
};

type ActionCreator<
  A,
  K extends keyof A,
  T extends string
> = unknown extends A[K] // hacky ternary for `A[K] is any`
  ? (payload?: any) => PayloadAction<any, T>
  : A[K] extends never | undefined | void // No payload when type is `never` | `undefined` | `void`
  ? () => PayloadAction<undefined, T>
  : A[K] extends NotEmptyObject // needed to prevent very rare edge cases where the next ternary is wrongly triggered
  ? (payload: A[K]) => PayloadAction<A[K], T>
  : {} extends A[K] // ensures payload isn't inferred as {}, this is due to way ts narrows uninferred types to {}, ts@>3.5 will potentially fix this
  ? () => PayloadAction<undefined, T>
  : (payload: A[K]) => PayloadAction<A[K], T>;

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
   * @type {Reducer<SS, AnyAction>}
   * @memberof Slice
   */
  reducer: Reducer<SS, AnyAction>;
  /**
   * An object containing the automatically generated action creators
   * @type { [s:string]: (payload:any)=> PayloadAction }
   * @memberof Slice
   */
  actions: Ax;
  /**
   * Helper utility for mapping selectors to paths
   *
   * @example
   * // if your reducer is for a todos slice i.e
   *
   * const todosSlice = createSlice({
   *   //...
   * })
   *
   * const rootReducer = combineReducers({
   *    todos: todosSlice.reducer
   * });
   * const store = createStore(rootReducer);
   *
   * const selectors = todosSlice.mapSelectorsTo('todos');
   *
   * const mapStateToProps = (state: typeof store.getState) => selectors.selectSlice(state)
   *
   * @memberof Slice
   */
  mapSelectorsTo: MapSelectorsTo<SelectorMap>;

  /**
   * Helper utility for nameSpacing the reducer and action creators
   *
   * @example
   * const { sliceReducer, sliceActions } = createNameSpace('todos')
   *
   * console.log(sliceActions.addTodo('Do something'))
   * // -> { type: 'addTodo', payload: 'Do something', slice: 'todos' }
   *
   * @memberof Slice
   */
  createNameSpace: CreateNameSpace<SS, Ax>;
}

/**
 * Options for `createSlice` utility
 *
 * @interface CreateSliceOptions
 * @template SS The `SliceState` type
 * @template Ax The Actions map, format - `{ [caseName]: typeof payload }`
 * @template Cx The computed selectors map, format - `{ [selectorName]: returnType }`
 * @template TyO The type overrides map, format - `{[caseName]: <string>typeOverride}`
 */
interface CreateSliceOptions<SS, Ax, Cx, TyO> {
  /**
   * The initial State, same as standard reducer
   *
   * @type {SS}
   * @memberof CreateSliceOptions
   */
  initialState: SS;
  /**
   * @description - An object whose methods represent the cases the generated reducer handles,
   * can be thought of as the equivalent of [switch-case] statements in a standard reducer.
   *
   * @type {Cases<SS, Ax, TyO>}
   * @example
   * type Todo = {title: string, completed: boolean}
   * createSlice({
   *   initialState: [] as Todo[],
   *   cases: {
   *     addTodo: (state, payload: string) => {
   *       state.push({title: payload, completed: false})
   *     }
   *   }
   * })
   * @memberof CreateSliceOptions
   */
  cases: Cases<SS, Ax, TyO>;

  /**
   * @description computed selectors for this slice, will be memoized using `memomoize-state` lib
   * https://github.com/theKashey/memoize-state
   *
   * @see note: (js-users ignore) if using `this` to access other selectors, ReturnType should be explicit to prevent `typescript` errors, see https://github.com/dudeonyx/redux-ts-starter-kit/issues
   * @example
   * type Todo = {title: string, completed: boolean}
   * const todosSlice = createSlice({
   *   initialState: [] as Todo[],
   *   computed: {
   *     getCompletedTodos: state => state.filter(todo => todo.completed),
   *     getCompletedTodosLength(state): number {
   *       return this.getCompletedTodos(state).length;
   *     },
   *   }
   *   cases: {
   *     //...
   *   }
   * })
   * @type {ComputedMap<SS, Cx>}
   * @memberof CreateSliceOptions
   */
  computed?: ComputedMap<SS, Cx>;

  /**
   * @description Type overrides to override the `type` which case reducers respond to
   * which by default is simply the name of the case reducer.
   * i.e the `addTodo` case reducer in `cases: { addTodo: (state, payload) => {//...}, }`
   * would by default respond to actions of type `addTodo` e.g. `{ type: 'addTodo', payload: 'Jog' }`.
   * This can be changed thanks to the `typeOverrides` option.
   * For example the changed the type to `ADD_TODO` instead see the example below.
   *
   * It should be noted that the action creators `createSlice` generates automatically account for typeOverrides
   *
   * @example
   * const todoSlice = createSlice({
   *     cases: {
   *         addTodo: (state, payload: string) => {
   *             state.push({title: payload, completed: false})
   *         },
   *         deleteTodo: //...,
   *         setCompleted: //...,
   *     },
   *     typeOverrides: {
   *         addTodo: 'ADD_TODO'
   *     }
   * })
   *
   * @type {TyO}
   * @memberof CreateSliceOptions
   */
  typeOverrides?: TyO;
}

type ComputedMap<S, C extends {}> = { [K in keyof C]: (state: S) => C[K] };
type Const<TyO> = { [K in keyof TyO]: TyO[K] };

/**
 * @description Generates a redux state tree slice, complete with a `reducer`,
 *  `action creators`, `mapSelectorsTo` and `createNameSpace`
 *
 * @export
 * @template Actions - A map of action creator names and payloads, in the form `{[caseName]: typeof payload}`,
 *  a payload type of `never` | `undefined` | `void` can be used to indicate that no payload is expected
 * @template SliceState - The interface of the initial state,
 * @template Computed
 * @template TypeOverrides
 * @param {CreateSliceOptions<SliceState, Actions, Computed, TypeOverrides>} {
 *   cases,
 *   initialState,
 * }
 * @returns {(Slice<
 *   ActionCreators<Actions, TypeOverrides>,
 *   SliceState,
 *   Selectors<SliceState> & ComputedMap<SliceState, Computed>
 * >)}
 */
export function createSlice<
  Actions extends ActionsMap,
  SliceState,
  Computed extends ActionsMap,
  TyO extends { [K in keyof Actions]?: string }
>(
  options: CreateSliceOptions<SliceState, Actions, Computed, Const<TyO>>,
): Slice<
  ActionCreators<Actions, TyO>,
  SliceState,
  Selectors<SliceState> & ComputedMap<SliceState, Computed>
>;
export function createSlice<
  Actions extends ActionsMap,
  SliceState,
  Computed extends ActionsMap,
  TyO extends { [K in keyof Actions]?: string }
>(
  options: CreateSliceOptions<SliceState, Actions, Computed, Const<TyO>>,
): Slice<
  ActionCreators<Actions, TyO>,
  SliceState,
  Selectors<SliceState> & ComputedMap<SliceState, Computed>
>;

export function createSlice<
  Actions extends ActionsMap,
  SliceState,
  Computed extends ActionsMap,
  TyO extends { [K in keyof Actions]?: string }
>({
  cases,
  initialState,
  computed = {} as any,
  typeOverrides = {} as any,
}: CreateSliceOptions<SliceState, Actions, Computed, Const<TyO>>): Slice<
  ActionCreators<Actions, TyO>,
  SliceState,
  Selectors<SliceState> & ComputedMap<SliceState, Computed>
> {
  const actionKeys = Object.keys(cases) as Array<
    Extract<keyof Actions, string>
  >;

  const reducer = makeReducer(initialState, cases, typeOverrides);

  const actions = makeActionCreators<Actions, Const<TyO>>(
    actionKeys,
    typeOverrides,
  );
  const baseSelectors = makeSelectors(initialState);

  const createNameSpace = makeNameSpacedReducer(reducer, actions);

  const mapSelectorsTo = makeReMapableSelectors(baseSelectors, computed);

  return {
    actions,
    reducer,
    mapSelectorsTo,
    createNameSpace,
  };
}
