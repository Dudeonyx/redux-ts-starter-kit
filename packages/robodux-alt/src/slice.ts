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

type Reduce<State, Payload = null> = Payload extends null
  ? (state: State) => State | undefined | void
  : (state: State, payload: Payload) => State | undefined | void;

interface ReduceMap<State> {
  [key: string]: Reduce<State, any>;
}

interface ICreate<State, Actions> {
  slice?: string;
  actions: { [key in keyof Actions]: Reduce<State, Actions[key]> };
  initialState: State;
}

const actionTypeBuilder = (slice: string) => (action: string) =>
  slice ? `${slice}/${action}` : action;

type NoUndefinedActionsCheck<Actions> = Actions extends undefined
  ? { [s: string]: any }
  : Actions;
export default function create<
  SliceState,
  Actions = undefined,
  State = { [key: string]: SliceState } | SliceState
>({
  slice = '',
  actions,
  initialState,
}: ICreate<SliceState, NoUndefinedActionsCheck<Actions>>) {
  type Ax = NoUndefinedActionsCheck<Actions>;
  const { actionMap, reducer } = makeActionMapAndReducer<SliceState, Ax>(
    actions,
    slice,
    initialState,
  );

  const selectors = makeSelectors<SliceState, State>(slice);

  return {
    actions: actionMap,
    reducer,
    slice,
    selectors,
  };
}

export function createSliceAlt<
  SliceState,
  Actions = undefined,
  State = { [key: string]: SliceState } | SliceState
>({
  slice = '',
  actions,
  initialState,
}: ICreate<SliceState, NoUndefinedActionsCheck<Actions>>) {
  type Ax = NoUndefinedActionsCheck<Actions>;
  const { actionMap, reducer } = makeActionMapAndReducer<SliceState, Ax>(
    actions,
    slice,
    initialState,
  );

  const selectors = makeSelectorsAlt<SliceState, State>(slice, initialState);
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
      const subSelectorName = createSubSelectorName(slice, key as string);
      map[subSelectorName] = createSubSelector<State, SliceState>(
        slice as keyof State,
        key,
      );
      return map;
    }, selectors);
  }
  return selectors;
}

function makeActionMapAndReducer<SliceState, Ax>(
  actions: { [key in keyof Ax]: Reduce<SliceState, Ax[key]> },
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
  const actionMap = makeActionMap<Ax>(actionKeys, createActionType);
  return { actionMap, reducer };
}

function makeReducer<SliceState, Ax>(
  actionKeys: (keyof Ax)[],
  createActionType: (action: string) => string,
  actions: { [key in keyof Ax]: Reduce<SliceState, Ax[key]> },
  initialState: SliceState,
  slice: string,
) {
  const reducerMap = actionKeys.reduce<ReduceMap<SliceState>>((map, action) => {
    map[createActionType(action as string)] = actions[action];
    return map;
  }, {});
  const reducer = createReducer<SliceState>({
    initialState,
    actions: reducerMap,
    slice,
  });
  return reducer;
}

function makeActionMap<Ax>(
  actionKeys: (keyof Ax)[],
  createActionType: (s: string) => string,
) {
  const actionMap = actionKeys.reduce<
    {
      [A in keyof Ax]: Ax extends { [s: string]: {} }
        ? (payload?: Ax[A]) => Action<Ax[A]>
        : Ax[A] extends null ? () => Action : (payload: Ax[A]) => Action<Ax[A]>
    }
  >(
    (map, action) => {
      const type = createActionType(action as string);
      map[action] = createAction(type) as any;
      return map;
    },
    {} as any,
  );
  return actionMap;
}
