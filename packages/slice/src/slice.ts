import createAction from "./action";
import createReducer, { NoEmptyArray } from "./reducer";
import { createSubSelector, createSelector } from "./selector";
import { Action } from "./types";

interface ActionReducer<SS = any, A = any> {
  (state: SS, payload: A): SS | void | undefined;
}

interface ActionReducerWithSlice<SS = any, A = any, S = any> {
  (state: SS, payload: A, _FullState: S): SS | void | undefined;
}

export interface Reducer<SS = any, A = Action> {
  (state: SS | undefined, payload: A): SS;
}

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

export interface ReduceM<SS, A = Action> {
  [Action: string]: ActionReducer<SS, A>;
}

interface Slice<A = any, SS = any, S = SS, str = ""> {
  slice: SS extends S ? "" : str;
  reducer: Reducer<SS, Action>;
  selectors: SS extends AnyState
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
  slice: "";
}
interface InputWithOptionalSlice<SS = any, Ax = ActionsAny, S = any> {
  initialState: SS;
  cases: ActionsObjWithSlice<SS, Ax, S>;
  slice?: keyof S;
}

const allCapsSnakeCase = (string: string) =>
  string
    .replace(/(\w)([A-Z])/g, "$1_$2")
    .replace(/(\w)/g, w => w.toUpperCase());

const actionTypeBuilder = (slice: string) => (action: string) =>
  slice ? `${slice}/${allCapsSnakeCase(action)}` : allCapsSnakeCase(action);

//#region

export default function createSlice<
  Actions extends ActionsAny,
  SliceState,
  State extends AnyState
>({
  slice,
  cases,
  initialState
}: InputWithSlice<NoEmptyArray<SliceState>, Actions, State>): Slice<
  Actions,
  NoEmptyArray<SliceState>,
  State,
  typeof slice
>;

export default function createSlice<Actions extends ActionsAny, SliceState>({
  cases,
  initialState,
  slice
}: InputWithBlankSlice<NoEmptyArray<SliceState>, Actions>): Slice<
  Actions,
  NoEmptyArray<SliceState>,
  NoEmptyArray<SliceState>,
  typeof slice
>;

export default function createSlice<Actions extends ActionsAny, SliceState>({
  cases,
  initialState
}: InputWithoutSlice<NoEmptyArray<SliceState>, Actions>): Slice<
  Actions,
  NoEmptyArray<SliceState>
>;

export default function createSlice<
  Actions extends ActionsAny,
  SliceState,
  State extends AnyState
>({
  cases,
  initialState,
  slice = ""
}: InputWithOptionalSlice<NoEmptyArray<SliceState>, Actions, State>) {
  const actionKeys = Object.keys(cases) as (keyof Actions)[];
  const createActionType = actionTypeBuilder(<string>slice);

  const reducerMap = actionKeys.reduce<ReduceM<SliceState>>((map, action) => {
    (map as any)[createActionType(<string>action)] = cases[action];
    return map;
  }, {});
  const reducer = createReducer<SliceState>({
    initialState,
    cases: reducerMap,
    slice: <string>slice
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
    {} as any
  );

  let initialStateKeys: (keyof SliceState)[] = [];
  if (typeof initialState === "object" && !Array.isArray(initialState)) {
    initialStateKeys = <any>Object.keys(initialState);
  }
  const otherSelectors = initialStateKeys.reduce<
    { [key in keyof SliceState]: (state: State) => SliceState[key] }
  >(
    (map, key) => {
      map[key] = createSubSelector<State, SliceState>(
        slice as keyof State,
        key
      );
      return map;
    },
    {} as any
  );
  const selectors = {
    getSlice: createSelector<State, SliceState>(<string>slice),
    ...otherSelectors
  };
  return {
    actions: actionMap,
    reducer,
    slice,
    selectors
  };
}
