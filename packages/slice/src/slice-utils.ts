import { createAction } from './action';
import { createSubSelector, createSelector } from './selector';
import { ActionsMap, ActionCreators, Selectors } from './slice';

export const reMapSelectors = <
  State,
  Slice,
  Selects extends { [s: string]: (s: Slice) => any }
>(
  mapper: (s: State) => Slice,
  selectors: Selects,
) => {
  return (Object.keys(selectors) as Array<keyof Selects>).reduce<
    { [K in keyof Selects]: (state: State) => ReturnType<Selects[K]> }
  >(
    (map, key) => {
      return { ...map, [key]: (s: State) => selectors[key](mapper(s)) };
    },
    {} as any,
  );
};

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
