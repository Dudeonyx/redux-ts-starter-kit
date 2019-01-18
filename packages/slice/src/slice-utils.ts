import { createAction } from './action';
import { createReducer } from './reducer';
import { createSubSelector, createSelector } from './selector';
import { createActionType } from './actionType';
import {
  ActionsAny,
  ActionCreators,
  AnyState,
  Cases,
  ReducerMap,
  InferState,
  Selectors,
} from './slice';

export const makeActionCreators = <Actions extends ActionsAny>(
  actionKeys: Array<keyof Actions>,
  slice: string | number | symbol,
): ActionCreators<Actions> => {
  return actionKeys.reduce(
    (map, action) => {
      const type = createActionType(slice, action);
      map[action] = createAction(type);
      return map;
    },
    {} as any,
  );
};
export const makeReducer = <
  Actions extends ActionsAny,
  SliceState,
  State extends AnyState
>(
  cases: Cases<SliceState, Actions>,
  initialState: SliceState,
  slice: keyof State,
) => {
  const actionKeys = Object.keys(cases) as Array<keyof Actions>;
  const reducerMap = actionKeys.reduce<ReducerMap<SliceState>>(
    (map, action) => {
      map[createActionType(slice, action)] = cases[action];
      return map;
    },
    {},
  );
  const reducer = createReducer({
    initialState,
    cases: reducerMap,
    slice: slice as string,
  });
  return reducer;
};

export interface MakeSelectors {
  <SliceState = any, State extends SliceState = SliceState>(slice: ''): {
    getSlice: (state: State) => SliceState;
  };
  <SliceState = any, State extends AnyState = AnyState>(slice: keyof State): {
    getSlice: (
      state: InferState<typeof slice, State, SliceState>,
    ) => SliceState;
  };
  <SliceState, State extends SliceState>(
    slice: '',
    initialState: SliceState,
  ): Selectors<SliceState, State>;
  <SliceState, State extends AnyState>(
    slice: keyof State,
    initialState: SliceState,
  ): Selectors<SliceState, InferState<typeof slice, State, SliceState>>;
}
export const makeSelectors: MakeSelectors = <SliceState, State>(
  slice: keyof State,
  initialState?: SliceState,
) => {
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
  return {
    getSlice: createSelector<State, SliceState>(slice),
    ...otherSelectors,
  };
};
