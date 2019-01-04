import createAction from './action';
import createReducer from './reducer';
import { createSubSelector, createSelectorAlt } from './selector';
import { Action } from './types';

type ActionReducer<SS = any, A = any> = (
  state: SS,
  payload: A,
) => SS | void | undefined;

type ActionReducerWithSlice<SS = any, A = any, S = any> = (
  state: SS,
  payload: A,
  _FullState: S,
) => SS | void | undefined;

export type Reducer<SS = any, A = Action> = (
  state: SS | undefined,
  payload: A,
) => SS;

type ActionsObj<SS = any, Ax = any> = {
  [K in keyof Ax]: ActionReducer<SS, Ax[K]>
};
type ActionsObjWithSlice<SS = any, Ax = any, S = any> = {
  [K in keyof Ax]: ActionReducerWithSlice<SS, Ax[K], S>
};

type ActionsAny<P = any> = {
  [Action: string]: P;
};
type AnyState = { [slice: string]: any };

export interface ReduceM<SS, A = Action> {
  [Action: string]: ActionReducer<SS, A>;
}

type ResultAlt<A = any, SS = any, S = SS, str = keyof S> = {
  slice: SS extends S ? '' : str;
  reducer: Reducer<SS, Action>;
  selectors: SS extends {}
    ? ({ [key in keyof SS]: (state: S) => SS[key] } & {
        getSlice: (state: S) => SS;
      })
    : {
        getSlice: (state: S) => SS;
      };
  actions: {
    [key in keyof A]: Object extends A[key] // ensures payload isn't inferred as {}
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

//#region

export default function createSlice<
  SliceState,
  Actions extends ActionsAny,
  State extends AnyState
>({
  slice,
  actions,
  initialState,
}: InputWithSlice<SliceState, Actions, State>): ResultAlt<
  Actions,
  SliceState,
  State,
  typeof slice
>;
export default function createSlice<SliceState, Actions extends ActionsAny>({
  actions,
  initialState,
}: InputWithoutSlice<SliceState, Actions>): ResultAlt<Actions, SliceState>;

export default function createSlice<
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

  let initialStateKeys: (keyof SliceState)[] = [];
  if (typeof initialState === 'object' && !Array.isArray(initialState)) {
    initialStateKeys = <any>Object.keys(initialState);
  }
  const otherSelectors = initialStateKeys.reduce<
    { [key in keyof SliceState]: (state: State) => SliceState[key] }
  >(
    (map, key) => {
      map[key] = createSubSelector<State, SliceState>(
        slice as keyof State,
        key,
      );
      return map;
    },
    {} as any,
  );
  const selectors = {
    getSlice: createSelectorAlt<State, SliceState>(<string>slice),
    ...otherSelectors,
  };
  return {
    actions: actionMap,
    reducer,
    slice,
    selectors,
  };
}
