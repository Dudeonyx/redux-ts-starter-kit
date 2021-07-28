import type { Draft } from 'immer';
import type { AnyAction, PayloadAction, RemoveIndex } from './types';
import type { MapSelectorsTo, ReMappedSelectors } from './slice-utils';
import {
  makeReMapableSelectors,
  makeActionCreators,
  makeSelectors,
  makeReducer,
} from './slice-utils';

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
 * @template SS is the `SliceState`
 * @template Ax  is the `ActionsMap`
 */
export type CasesBase<SS> = {
  [s: string]: CaseReducer<SS>;
};
export type CasesBuilder<SS, Ax extends {}> = {
  [K in keyof Ax]: CaseReducer<SS, Ax[K]>;
};

/** Generic Action Map interface */
export interface ActionMap<P = any> {
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

type InferTypeLiteral<TyO extends string, Fallback> = TyO extends string
  ? TyO
  : Fallback extends string
  ? Fallback
  : never;

type InferTypeLiteralWithSliceName<
  SliceName extends string | '',
  TyO extends string,
  Fallback,
> = SliceName extends ''
  ? InferTypeLiteral<TyO, Fallback>
  : `${SliceName}/${InferTypeLiteral<TyO, Fallback>}`;
/** Type alias for generated action creators */
export type ActionCreatorsMap<
  A,
  TyO extends { [K in keyof A]?: string } = {},
  SliceName extends string = '',
> = {
  [key in keyof A]: ActionCreator<
    A[key],
    InferTypeLiteralWithSliceName<SliceName, NonNullable<TyO[key]>, key>
  > & {
    type: InferTypeLiteralWithSliceName<SliceName, NonNullable<TyO[key]>, key>;
    toString: () => InferTypeLiteralWithSliceName<
      SliceName,
      NonNullable<TyO[key]>,
      key
    >;
  };
};

type ActionCreator<A, T extends string> = 0 extends A & 1 // hacky ternary for `A[K] is any` see `https://stackoverflow.com/questions/55541275/typescript-check-for-the-any-type`
  ? (payload?: any) => PayloadAction<any, T>
  : unknown extends A // payload is unknown, and therefore skipped
  ? () => PayloadAction<undefined, T>
  : [undefined] extends [A] // if payload is maybe undefined
  ? (payload?: A) => PayloadAction<A, T>
  : [null] extends [A] // if payload is maybe null
  ? (payload: A) => PayloadAction<A, T>
  : keyof A extends never // ensures payload isn't inferred as {}, this is due to way ts narrows uninferred types to {}, ts@>3.5 will potentially fix this by infering as unknown instead
  ? () => PayloadAction<undefined, T>
  : (payload: A) => PayloadAction<A, T>;

type PayloadTypeMap<Cases extends CasesBase<any>> = {
  [K in keyof Cases]: Cases[K] extends (s: any, p: infer P) => any ? P : never;
};

export type ActionCreatorsMapFromCases<
  Cases extends CasesBase<any>,
  TyO = {},
  SliceName extends string = '',
> = ActionCreatorsMap<PayloadTypeMap<Cases>, TyO, SliceName>;

/** Map of computed selectors */
type ComputedMap<S> = { [s: string]: (state: S) => any };

/** Hack used to make values of `typeOverrides` Object string literals */
type Const<TyO> = { [K in keyof TyO]: TyO[K] };

/**
 * @interface Slice
 * @description The interface of the object returned by createSlice
 * @template Ax - is the [Action] creator interface
 * @template SS - [SliceState]
 * @template S - [State]
 * @template Slc - [slice]
 */
export interface Slice<
  SliceName extends string,
  Cases extends CasesBase<SS>,
  SS,
  SelectorMap extends { [s: string]: (state: SS) => any },
  Computed extends { [s: string]: (state: SS) => any },
  TyO extends { [K in keyof Cases]?: string },
> {
  /**
   * The name of the slice
   *
   * @type {SliceName}
   * @memberof Slice
   */
  name: SliceName;
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
  actions: ActionCreatorsMapFromCases<Cases, TyO, SliceName>;
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
   * const todosSelector = todosSlice.mapSelectorsTo('todos');
   *
   * const mapStateToProps = (state: typeof store.getState) => todosSelector.selectSlice(state)
   *
   * @memberof Slice
   */
  reMapSelectorsTo: MapSelectorsTo<SelectorMap & Computed>;

  selectors: ReMappedSelectors<[SliceName], SelectorMap & Computed>;

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
  // createNameSpace: CreateNameSpace<SS, ActionCreatorsMapFromCases<Cases, TyO>>;
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
interface CreateSliceOptions<
  SliceName extends string,
  SS,
  Cases extends CasesBase<SS>,
  Cx extends ComputedMap<SS>,
  TyO,
> {
  /**
   *The slice name
   *
   * @type {SliceName}
   * @memberof CreateSliceOptions
   */
  name: SliceName;
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
   * @type {Cases}
   * @example
   * interface Todo {title: string, completed: boolean};
   * const todoSlice = createSlice({
   *   initialState: [] as Todo[],
   *   cases: {
   *     addTodo: (state, payload: string) => {
   *       state.push({title: payload, completed: false})
   *     }
   *   }
   * })
   * @memberof CreateSliceOptions
   */
  cases: Cases;

  /**
   * @description computed selectors for this slice, will be memoized using the `memoize-state` lib
   * https://github.com/theKashey/memoize-state
   *
   * @see note: (js-users ignore) if using `this` to access other selectors,
   * ReturnType should be explicit to prevent `typescript` errors,
   * see https://github.com/dudeonyx/redux-ts-starter-kit/issues
   * @example
   * type Todo = {title: string, completed: boolean};
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
  computed?: Cx;

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
 * @param {CreateSliceOptions<SliceState, Actions, Computed, TypeOverrides>} options
 * @returns {(Slice<
 *   SliceName,
 *   Cases,
 *   SliceState,
 *   Selectors<SliceState>,
 *   AreStrictlyEqual<
 *     Computed,
 *     { [s: string]: (state: SliceState) => any } | {},
 *     {},
 *     Computed
 *   >,
 *   TyO
 * >)}
 * @type   RemoveIndex<Computed> is needed to prevent `Computed` infering as { [s: string]: (state: SliceState) => any } when computed
 *         is undefined in the argument to `createSlice`. This would otherwise break type safety.
 */
export function createSlice<
  SliceName extends string,
  Cases extends CasesBase<SliceState>,
  SliceState,
  Computed extends ComputedMap<SliceState> = ComputedMap<SliceState>,
  TyO extends { [K in keyof Cases]?: string } = {},
>(
  options: CreateSliceOptions<
    SliceName,
    SliceState,
    Cases,
    Computed,
    Const<TyO>
  >,
): Slice<
  SliceName,
  Cases,
  SliceState,
  Selectors<SliceState>,
  RemoveIndex<Computed>,
  TyO
>;

export function createSlice<
  SliceName extends string | '',
  Cases extends CasesBase<SliceState>,
  SliceState,
  Computed extends ComputedMap<SliceState> = {},
  TyO extends { [K in keyof Cases]?: string } = {},
>({
  cases,
  name,
  initialState,
  computed = {} as Computed,
  typeOverrides = {} as Const<TyO>,
}: CreateSliceOptions<
  SliceName,
  SliceState,
  Cases,
  Computed,
  Const<TyO>
>): Slice<
  SliceName,
  Cases,
  SliceState,
  Selectors<SliceState>,
  RemoveIndex<Computed>,
  TyO
> {
  const actionKeys = Object.keys(cases) as Array<
    Extract<keyof PayloadTypeMap<Cases>, string>
  >;

  const reducer = makeReducer(initialState, cases, typeOverrides, name);

  const actions = makeActionCreators<
    PayloadTypeMap<Cases>,
    Const<TyO>,
    SliceName
  >(actionKeys, typeOverrides, name);
  const baseSelectors = makeSelectors(initialState);

  // const createNameSpace = makeNameSpacedReducer(reducer, actions);

  const reMapSelectorsTo = makeReMapableSelectors(baseSelectors, computed);
  const selectors = reMapSelectorsTo(name);

  return {
    name,
    actions,
    reducer,
    selectors: selectors as any,
    reMapSelectorsTo: reMapSelectorsTo as any,
    // createNameSpace,
  };
}
