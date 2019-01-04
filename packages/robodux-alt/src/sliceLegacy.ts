import { Action } from './types';
import { createSelector } from './selector';
import createAction from './action';
import createReducer from './reducer';

type ActionReducer<SS = any, A = any> = (
  state: SS,
  payload: A,
) => SS | void | undefined;

type ActionReducerWithSlice<SS = any, A = any, S = any> = (
  state: SS,
  payload: A,
  _FullState: S,
) => SS | void | undefined;

type Reducer<SS = any, A = Action> = (state: SS | undefined, payload: A) => SS;

type ActionsObj<SS = any, Ax = any> = {
  [K in keyof Ax]: ActionReducer<SS, Ax[K]>
};
type ActionsObjWithSlice<SS = any, Ax = any, S = any> = {
  [K in keyof Ax]: ActionReducerWithSlice<SS, Ax[K], S>
};

type ActionsAny<P = any> = {
  [Action: string]: P;
};

interface ReduceM<SS> {
  [Action: string]: ActionReducer<SS, Action>;
}
type Result<A = any, SS = any, S = SS, str = keyof S> = {
  slice: SS extends S ? '' : str;
  reducer: Reducer<SS, Action>;
  selectors: { getSlice: (state: S) => SS };
  actions: {
    [key in keyof A]: Object extends A[key]
      ? (payload?: any) => Action
      : A[key] extends never
      ? () => Action
      : (payload: A[key]) => Action<A[key]>
  };
};
type InputWithSlice<SS = any, Ax = ActionsAny, S = any> = {
  initialState: SS;
  actions: ActionsObjWithSlice<SS, Ax, S>;
  slice: keyof S;
};
type InputWithoutSlice<SS = any, Ax = ActionsAny> = {
  initialState: SS;
  actions: ActionsObj<SS, Ax>;
};
type InputWithOptionalSlice<SS = any, Ax = ActionsAny, S = any> = {
  initialState: SS;
  actions: ActionsObjWithSlice<SS, Ax, S>;
  slice?: keyof S;
};

const allCapsSnakeCase = (string: string) =>
  string
    .replace(/(\w)([A-Z])/g, '$1_$2')
    .replace(/(\w)/g, (w) => w.toUpperCase());

const actionTypeBuilder = (slice: string) => (action: string) =>
  slice ? `${slice}/${allCapsSnakeCase(action)}` : allCapsSnakeCase(action);

type AnyState = { [slice: string]: any };

export function createSliceLegacy<
  SliceState,
  Actions extends ActionsAny,
  State extends AnyState
>({
  actions,
  initialState,
  slice,
}: InputWithSlice<SliceState, Actions, State>): Result<
  Actions,
  SliceState,
  State,
  typeof slice
>;
export function createSliceLegacy<SliceState, Actions extends ActionsAny>({
  actions,
  initialState,
}: InputWithoutSlice<SliceState, Actions>): Result<Actions, SliceState>;

export function createSliceLegacy<
  SliceState,
  Actions extends ActionsAny,
  State extends AnyState
>({
  actions,
  initialState,
  slice = '',
}: InputWithOptionalSlice<SliceState, Actions, State>) {
  const actionKeys = Object.keys(actions) as (keyof Actions)[];
  const createActionType = actionTypeBuilder(<string>slice);

  const reducerMap = actionKeys.reduce<ReduceM<SliceState>>((map, action) => {
    (map as any)[createActionType(<string>action)] = actions[action];
    return map;
  }, {});
  const reducer = createReducer<SliceState>({
    initialState,
    actions: reducerMap,
    slice: <string>slice,
  });

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

  const selectors = {
    getSlice: createSelector<State, SliceState>(<string>slice),
  };
  return {
    actions: actionMap,
    reducer,
    slice,
    selectors,
  };
}
