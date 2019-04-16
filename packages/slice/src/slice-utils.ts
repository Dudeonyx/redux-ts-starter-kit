import { createAction } from './action';
import { createReducer } from './reducer';
import {
  createSubSelector,
  createSelector,
  createSubSubSelector,
} from './selector';
import { ActionsMap, ActionCreators, Cases, Selectors, Reducer } from './slice';
import { PayloadAction, PayloadAction } from './types';
import isPlainObject from './isPlainObject';



export function makeActionCreators<
  Actions extends ActionsMap<{[s:string]: PayloadAction}>,
  Sl extends string
>(
  actionKeys: Array<Extract<keyof Actions, string>>,
  slice: Sl,
): ActionCreators<Actions, Sl>;

export function makeActionCreators<Actions extends ActionsMap<{[s:string]: PayloadAction}>>(
  actionKeys: Array<Extract<keyof Actions, string>>,
): ActionCreators<Actions>;

export function makeActionCreators<
  Actions extends ActionsMap<{[s:string]: PayloadAction}>,
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
  CS extends Cases<SliceState,any>,
  SliceState,
  SliceName extends string
>(
  cases: CS,
  initialState: SliceState,
  slice: SliceName,
) => {
  const actionKeys = Object.keys(cases) as Array<keyof CS>;
  const reducerMap = actionKeys.reduce<CS>(
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
  const sliceSpacedReducer = makeSliceSpacedReducer(slice, reducer);

  return [reducer, sliceSpacedReducer,] as [typeof reducer, typeof reducer];
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
  depth: 0 | 1 = 1,
) => {
  let initialStateKeys: Array<keyof SliceState> = [];
  if (isPlainObject(initialState) && !Array.isArray(initialState)) {
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
      map[key] =
        isPlainObject(initialState) &&
        !Array.isArray(initialState) &&
        isPlainObject(initialState[key]) &&
        !Array.isArray(initialState[key])
          ? makeSubSubSelectors<SliceState, SliceName>(initialState, key, slice)
          : createSubSelector<
              { [sliceKey in SliceName]: SliceState },
              SliceState,
              SliceName,
              Extract<typeof key, string>
            >(slice, key as any);
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
};
function makeSubSubSelectors<SliceState, SliceName extends string>(
  initialState: SliceState,
  key: keyof SliceState,
  slice: SliceName,
): {
  [k in keyof SliceState]: (
    state: { [sliceKey in SliceName]: SliceState },
  ) => SliceState[k]
}[keyof SliceState] {
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

function makeSliceSpacedReducer<
  PA extends PayloadAction,
  SliceName extends string,
  SS
>(slice: SliceName, reducer: Reducer<SS, PA, SliceName>) {
  if (slice === '' || slice === undefined) {
    return reducer;
  }
  const initialState = reducer(undefined, {
    type: '@%@^#$*&^@^#%%$^$%%@%$%$@$%$',
  } as any);
  const newReducer = (state = initialState, action: PA) => {
    return action.slice === slice ? reducer(state, action) : state;
  };
  newReducer.toString = () => slice;
  return newReducer as typeof reducer;
}
