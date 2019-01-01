import createAction from './action';
import createReducer from './reducer';
import {
  createSelector,
  createSelectorName,
  createSubSelectorName,
  createSubSelector,
  createSelectorAlt,
} from './selector';
import { Action } from './types';

/* type Reduce<State, Payload> = (state: State, payload: Payload) => State | undefined | void;

interface ReduceMap<State> {
  [key: string]: Reduce<State, AnyAction>;
}


interface ICreate<State, Actions> {
  slice?: string;
  actions: { [key in keyof Actions]: Reduce<State, Actions[key]> };
  initialState: State;
} */

type ActionReducer<S = any, A = any> = (
  state: S | undefined,
  payload: A,
) => S | void | undefined;
// type CReducer2<S = any> = (state: S) => S;
type Reducer<SS = any, A = Action> = (state: SS | undefined, payload: A) => SS;

type ActionsObj<SS = any, Ax = any> = {
  [K in keyof Ax]: ActionReducer<SS, Ax[K]>
};

type ActionsAny<P = any> = {
  [Action: string]: P;
};
interface ReduceM<SS> {
  [Action: string]: ActionReducer<SS, Action>;
}
type Result<A extends ActionsAny = ActionsAny, SS = any, S = SS> = {
  slice: string;
  reducer: Reducer<SS, Action>;
  selectors: { [x: string]: (state: S) => SS };
  actions: {
    [key in keyof A]: Object extends A[key]
      ? (payload?: any) => Action
      : A[key] extends never
        ? () => Action
        : (payload: A[key]) => Action<A[key]>
  };
};
type ResultAlt<A = any, SS = any, S = SS> = {
  slice: string;
  reducer: Reducer<SS, Action>;
  selectors: { [x: string]: (state: S) => SS | SS[keyof SS] };
  actions: {
    [key in keyof A]: Object extends A[key]
      ? (payload?: any) => Action
      : A[key] extends never
        ? () => Action
        : (payload: A[key]) => Action<A[key]>
  };
};
type Input<SS = any, Ax = ActionsAny> = {
  initialState: SS;
  actions: ActionsObj<SS, Ax>;
  slice?: string;
};
type Input0<SS = any, Ax = ActionsAny> = {
  initialState: SS;
  actions: ActionsObj<SS, Ax>;
};

const actionTypeBuilder = (slice: string) => (action: string) =>
  slice ? `${slice}/${action}` : action;

type NoEmptyObject<S> = Object extends S ? { [slice: string]: any } : S;

export default function create<Actions extends ActionsAny, SliceState>({
  actions,
  initialState,
}: Input0<SliceState, Actions>): Result<Actions, SliceState>;

export default function create<
  Actions extends ActionsAny,
  SliceState,
  State extends {}
>({
  slice,
  actions,
  initialState,
}: Input<SliceState, Actions>): Result<
  Actions,
  SliceState,
  NoEmptyObject<State>
>;

export default function create<Actions extends ActionsAny, SliceState, State>({
  actions,
  initialState,
  slice = '',
}: Input<SliceState, Actions>) {
  const { actionMap, reducer } = makeActionMapAndReducer<
    SliceState,
    ActionsObj<SliceState, Actions>,
    Actions
  >(actions, slice, initialState);
  type StateX = NoEmptyObject<State>;
  const selectors = makeSelectors<SliceState, StateX>(slice);

  return {
    actions: actionMap,
    reducer,
    slice,
    selectors,
  };
}
//#region

export function createSliceAlt<Actions extends ActionsAny, SliceState>({
  actions,
  initialState,
}: Input0<SliceState, Actions>): ResultAlt<Actions, SliceState>;

export function createSliceAlt<
  Actions extends ActionsAny,
  SliceState,
  State extends {}
>({
  slice,
  actions,
  initialState,
}: Input<SliceState, Actions>): ResultAlt<
  Actions,
  SliceState,
  NoEmptyObject<State>
>;

export function createSliceAlt<
  Actions extends ActionsAny,
  SliceState,
  State = undefined
>({ slice = '', actions, initialState }: Input<SliceState, Actions>) {
  const { actionMap, reducer } = makeActionMapAndReducer<
    SliceState,
    ActionsObj<SliceState, Actions>,
    Actions
  >(actions, slice, initialState);
  type StateX = NoEmptyObject<State>;
  const selectors = makeSelectorsAlt<SliceState, StateX>(slice, initialState);
  return {
    actions: actionMap,
    reducer,
    slice,
    selectors,
  };
}

function makeSelectors<SliceState, State>(slice: string) {
  const selectorName = createSelectorName(slice);
  const selectors = {
    [selectorName]: createSelector<State, SliceState>(slice),
  };
  return selectors;
}

function makeSelectorsAlt<SliceState, State>(
  slice: string,
  initialState: SliceState,
) {
  const selectorName = createSelectorName(slice);
  const selectors = {
    [selectorName]: createSelectorAlt<State, SliceState>(slice),
  };
  if (typeof initialState === 'object' && !Array.isArray(initialState)) {
    const initialStateKeys = Object.keys(initialState) as (keyof SliceState)[];
    initialStateKeys.reduce((map, key) => {
      const subSelectorName = createSubSelectorName(slice, <string>key);
      map[subSelectorName] = createSubSelector<State, SliceState>(
        slice as keyof State,
        key,
      );
      return map;
    }, selectors);
  }
  return selectors;
}
//#endregion
function makeActionMapAndReducer<SliceState, Ax, Actions>(
  actions: Ax,
  slice: string,
  initialState: SliceState,
) {
  const actionKeys = Object.keys(actions) as (keyof Ax)[];
  const createActionType = actionTypeBuilder(slice);
  const reducer = makeReducer<SliceState, Ax>(
    actionKeys,
    createActionType,
    actions,
    initialState,
    slice,
  );
  const actionMap = makeActionMap<Ax, Actions>(actionKeys, createActionType);
  return { actionMap, reducer };
}

function makeReducer<SliceState, Ax>(
  actionKeys: (keyof Ax)[],
  createActionType: (action: string) => string,
  actions: Ax,
  initialState: SliceState,
  slice: string,
) {
  const reducerMap = actionKeys.reduce<ReduceM<SliceState>>((map, action) => {
    (map as any)[createActionType(<string>action)] = actions[action];
    return map;
  }, {});
  const reducer = createReducer<SliceState>({
    initialState,
    actions: reducerMap,
    slice,
  });
  return reducer;
}

function makeActionMap<Ax, Actions>(
  actionKeys: (keyof Ax)[],
  createActionType: (s: string) => string,
) {
  const actionMap = actionKeys.reduce<
    {
      [key in keyof Actions]: Object extends Actions[key]
        ? (payload?: any) => Action
        : Actions[key] extends never
          ? () => Action
          : (payload: Actions[key]) => Action<Actions[key]>
    }
  >(
    (map, action) => {
      const type = createActionType(<string>action);
      (<any>map)[action] = createAction(type);
      return map;
    },
    {} as any,
  );
  return actionMap;
}
