import { createAction } from './action';
import { createReducer, NoEmptyArray } from './reducer';
import { createSubSelector, createSelector } from './selector';
import { Action } from './types';
import { actionTypeBuilder } from './actionTypeBuilder';

type NoBadState<S> = S extends {[x:string]: {}} ? AnyState : S

type ActionReducer<SS = any, A = any> = (
  state: SS,
  payload: A,
) => SS | void | undefined;

type ActionReducerWithSlice<SS = any, A = any, S = any> = (
  state: SS,
  payload: A,
  _FullState: S,
) => SS | void | undefined;

export type Reducer<SS = any, A extends Action = Action> = (
  state: SS | undefined,
  payload: A,
) => SS;

type ActionsObj<SS = any, Ax = any> = {
  [K in keyof Ax]: ActionReducer<SS, Ax[K]>
};
type ActionsObjWithSlice<SS = any, Ax = any, S = any> = {
  [K in keyof Ax]: ActionReducerWithSlice<SS, Ax[K], S>
};

interface ActionsAny<P = any> {
  [Action: string]: P;
}
export interface AnyState {
  [slice: string]: any;
}

export interface ReducerMap<SS, A = Action> {
  [Action: string]: ActionReducer<SS, A>;
}

export interface Slice<A = any, SS = any, S = SS, str = ''> {
  slice: SS extends S ? '' : str;
  reducer: Reducer<SS, Action>;
  selectors: SS extends any[]
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
  actions: {
    // tslint:disable-next-line: ban-types
    [key in keyof A]: Object extends A[key] // ensures payload isn't inferred as {}
      ? (payload?: any) => Action
      : A[key] extends never
      ? () => Action
      : (payload: A[key]) => Action<A[key]>
  };
}

interface InputWithSlice<SS = any, Ax = ActionsAny, S = any> {
  initialState: SS;
  cases: ActionsObjWithSlice<SS, Ax, S>;
  slice: keyof S;
}
interface InputWithoutSlice<SS = any, Ax = ActionsAny> {
  initialState: SS;
  cases: ActionsObj<SS, Ax>;
}
interface InputWithBlankSlice<SS = any, Ax = ActionsAny> {
  initialState: SS;
  cases: ActionsObj<SS, Ax>;
  slice: '';
}
interface InputWithOptionalSlice<SS = any, Ax = ActionsAny, S = any> {
  initialState: SS;
  cases: ActionsObjWithSlice<SS, Ax, S>;
  slice?: keyof S;
}

//#region

export function createSlice<Actions extends ActionsAny, SliceState, State extends SliceState>({
  cases,
  initialState,
  slice,
}: InputWithBlankSlice<NoEmptyArray<SliceState>, Actions>): Slice<
  Actions,
  NoEmptyArray<SliceState>,
  State,
  typeof slice
>;

export function createSlice<
  Actions extends ActionsAny,
  SliceState,
  State extends AnyState
>({
  slice,
  cases,
  initialState,
}: InputWithSlice<NoEmptyArray<SliceState>, Actions, State>): Slice<
  Actions,
  NoEmptyArray<SliceState>,
  State,
  typeof slice
>;



export function createSlice<Actions extends ActionsAny, SliceState, State extends SliceState>({
  cases,
  initialState,
}: InputWithoutSlice<NoEmptyArray<SliceState>, Actions>): Slice<
  Actions,
  NoEmptyArray<SliceState>
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
  const createActionType = actionTypeBuilder(slice as string);

  const reducerMap = actionKeys.reduce<ReducerMap<SliceState>>(
    (map, action) => {
      (map as any)[createActionType(action as string)] = cases[action];
      return map;
    },
    {},
  );
  const reducer = createReducer<SliceState>({
    initialState,
    cases: reducerMap,
    slice: slice as string,
  });

  const actionMap = actionKeys.reduce<
    {
      // tslint:disable-next-line: ban-types
      [key in keyof Actions]: Object extends Actions[key]
        ? (payload?: any) => Action
        : Actions[key] extends never
        ? () => Action
        : (payload: Actions[key]) => Action<Actions[key]>
    }
  >(
    (map, action) => {
      const type = createActionType(action as string);
      (map as any)[action] = createAction(type);
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
    initialStateKeys = Object.keys(initialState) as any;
  }
  const otherSelectors = initialStateKeys.reduce<
    { [key in keyof SliceState]: (state: State) => SliceState[key] }
  >(
    (map, key) => {
      map[key] = createSubSelector<State, SliceState>(
        slice,
        key,
      );
      return map;
    },
    {} as any,
  );
  const selectors = {
    getSlice: createSelector<State, SliceState>(slice as string),
    ...otherSelectors,
  };
  return {
    actions: actionMap,
    reducer,
    slice,
    selectors,
  };
}
