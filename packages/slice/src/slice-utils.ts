import { createAction } from './action';
import { createReducer } from './reducer';
import {
  createSubSelector,
  createSelector,
  createSubSubSelector,
} from './selector';
import { ActionsMap, ActionCreators, Cases, Selectors } from './slice';
// import { PayloadAction, GenericAction } from './types';
import isPlainObject from './isPlainObject';
import { createActionType } from './actionType';

export function makeActionCreators<
  Actions extends ActionsMap,
  Sl extends string
>(
  actionKeys: Array<Extract<keyof Actions, string>>,
  slice: Sl,
): ActionCreators<Actions, Sl>;

export function makeActionCreators<Actions extends ActionsMap>(
  actionKeys: Array<Extract<keyof Actions, string>>,
): ActionCreators<Actions>;

export function makeActionCreators<
  Actions extends ActionsMap,
  Sl extends string
>(
  actionKeys: Array<Extract<keyof Actions, string>>,
  slice: Sl = '' as Sl,
): ActionCreators<Actions, Sl> {
  return actionKeys.reduce(
    (map, action) => {
      map[action] = createAction(action, slice);
      return map;
    },
    {} as any,
  );
}

export const makeReducer = <
  Ax extends ActionsMap,
  SliceState,
  SliceName extends string
>(
  cases: Cases<SliceState, Ax>,
  initialState: SliceState,
  slice: SliceName,
) => {
  const actionKeys = Object.keys(cases) as Array<keyof Ax>;
  const reducerMap = actionKeys.reduce<Cases<SliceState, Ax>>(
    (map, action) => {
      map[action] = cases[createActionType(slice, action)];
      return map;
    },
    {} as any,
  );
  const reducer = createReducer({
    initialState,
    cases: reducerMap,
    slice,
  });
  // const sliceSpacedReducer = makeSliceSpacedReducer(slice, reducer);

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
  <SliceState, SliceName extends ''>(
    slice: SliceName,
    initialState: SliceState,
    depth: 0,
  ): Selectors<SliceState, SliceState, 0>;
  <SliceState, SliceName extends ''>(
    slice: SliceName,
    initialState: SliceState,
    depth: 1,
  ): Selectors<SliceState, SliceState, 1>;
  <SliceState, SliceName extends ''>(
    slice: SliceName,
    initialState: SliceState,
    depth: 2,
  ): Selectors<SliceState, SliceState, 2>;
  <SliceState, SliceName extends string>(
    slice: SliceName,
    initialState: SliceState,
  ): Selectors<SliceState, { [slice in SliceName]: SliceState }>;
  <SliceState, SliceName extends string>(
    slice: SliceName,
    initialState: SliceState,
    depth: 0,
  ): Selectors<SliceState, { [slice in SliceName]: SliceState }, 0>;
  <SliceState, SliceName extends string>(
    slice: SliceName,
    initialState: SliceState,
    depth: 1,
  ): Selectors<SliceState, { [slice in SliceName]: SliceState }, 1>;
  <SliceState, SliceName extends string>(
    slice: SliceName,
    initialState: SliceState,
    depth: 2,
  ): Selectors<SliceState, { [slice in SliceName]: SliceState }, 2>;
}
export const makeSelectors: MakeSelectors = <
  SliceState,
  SliceName extends string
>(
  slice: SliceName,
  initialState?: SliceState,
  depth: 0 | 1 | 2 = 1,
) => {
  if (
    depth >= 1 &&
    isPlainObject(initialState) &&
    !Array.isArray(initialState)
  ) {
    const initialStateKeys = Object.keys(initialState) as Array<
      keyof SliceState
    >;
    const otherSelectors = initialStateKeys.reduce<
      {
        [key in keyof SliceState]:
          | ((
              state: { [sliceKey in SliceName]: SliceState },
            ) => SliceState[key])
          | Selectors<SliceState[key], { [sliceKey in SliceName]: SliceState }>
      }
    >(
      (map, key) => {
        map[key] = makeSubSubSelectors<SliceState, SliceName, typeof key>(
          initialState,
          key,
          slice,
          !!(depth - 1),
        );

        return map;
      },
      {} as any,
    );
    return {
      ...otherSelectors,
      getSlice: createSelector<
        { [sliceKey in SliceName]: SliceState },
        SliceState,
        SliceName
      >(slice),
    };
  }
  return {
    getSlice: createSelector<
      { [sliceKey in SliceName]: SliceState },
      SliceState,
      SliceName
    >(slice),
  };
};
function makeSubSubSelectors<
  SliceState extends {},
  SliceName extends string,
  Key extends keyof SliceState
>(
  initialState: SliceState,
  key: Key,
  slice: SliceName,
  depth: boolean = true,
):
  | Selectors<SliceState[Key], { [k in SliceName]: SliceState }>
  | ((state: { [k in SliceName]: SliceState }) => SliceState[Key]) {
  if (
    depth &&
    isPlainObject(initialState) &&
    !Array.isArray(initialState) &&
    isPlainObject(initialState[key]) &&
    !Array.isArray(initialState[key])
  ) {
    return {
      ...Object.keys(initialState[key]).reduce(
        (acc, subKey) => {
          acc[subKey] = createSubSubSelector<
            { [sliceKey in SliceName]: SliceState },
            SliceState,
            SliceName,
            Extract<typeof key, string>
          >(slice, key as any, subKey);
          return acc;
        },
        {} as any,
      ),
      getSlice: createSubSelector<
        { [sliceKey in SliceName]: SliceState },
        SliceState,
        SliceName,
        Extract<typeof key, string>
      >(slice, key as any),
    };
  }
  return createSubSelector<
    { [sliceKey in SliceName]: SliceState },
    SliceState,
    SliceName,
    Extract<typeof key, string>
  >(slice, key as any);
}

// function makeSliceSpacedReducer<
//   PA extends GenericAction,
//   SliceName extends string,
//   SS
// >(slice: SliceName, reducer: Reducer<SS, PA, SliceName>) {
//   if (slice === '' || slice === undefined) {
//     return reducer;
//   }
//   const initialState = reducer(undefined, {
//     type: '@%@^#$*&^@^#%%$^$%%@%$%$@$%$',
//   } as any);
//   const newReducer = (state = initialState, action: PA) => {
//     return action.slice === slice ? reducer(state, action) : state;
//   };
//   newReducer.toString = () => slice;
//   return newReducer as typeof reducer;
// }
