import { createAction } from './action';
import { createReducer } from './reducer';
import { createSubSelector, createSelector } from './selector';
import {
  ActionsMap,
  ActionCreators,
  Cases,
  ReducerMap,
  Selectors,
} from './slice';

export const makeActionCreators = <Actions extends ActionsMap>(
  actionKeys: Array<Extract<keyof Actions, string>>,
): ActionCreators<Actions> => {
  return actionKeys.reduce(
    (map, action) => {
      map[action] = createAction(action);
      return map;
    },
    {} as any,
  );
};
export const makeReducer = <
  Actions extends ActionsMap,
  SliceState,
  SliceName extends string
>(
  cases: Cases<SliceState, Actions>,
  initialState: SliceState,
  slice: SliceName,
) => {
  const actionKeys = Object.keys(cases) as Array<keyof Actions>;
  const reducerMap = actionKeys.reduce<ReducerMap<SliceState, Actions>>(
    (map, action) => {
      map[action] = cases[action];
      return map;
    },
    {} as any,
  );
  const reducer = createReducer({
    initialState,
    cases: reducerMap,
    slice,
  });
  return reducer;
};

export interface MakeSelectors {
  <SliceState = any, SliceName extends '' = ''>(slice: SliceName): {
    getSlice: (state: SliceState) => SliceState;
  };
  <SliceState = any, SliceName extends string = string>(slice: SliceName): {
    getSlice: (state: { [slice in SliceName]: SliceState }) => SliceState;
  };
  <SliceState, SliceName extends ''>(
    slice: SliceName,
    initialState: SliceState,
  ): Selectors<SliceState, SliceState>;
  <SliceState, SliceName extends string>(
    slice: SliceName,
    initialState: SliceState,
  ): Selectors<SliceState, { [slice in SliceName]: SliceState }>;
}
export const makeSelectors: MakeSelectors = <
  SliceState,
  SliceName extends string
>(
  slice: SliceName,
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
    {
      [key in keyof SliceState]: (
        state: { [sliceKey in SliceName]: SliceState },
      ) => SliceState[key]
    }
  >(
    (map, key) => {
      map[key] = createSubSelector<
        { [sliceKey in SliceName]: SliceState },
        SliceState
      >(slice, key);
      return map;
    },
    {} as any,
  );
  return {
    getSlice: createSelector<
      { [sliceKey in SliceName]: SliceState },
      SliceState
    >(slice),
    ...otherSelectors,
  };
};
