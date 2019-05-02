import { createAction } from './action';
import { makeTypeSafeSelector, NestedObject, GetArrayLength } from './selector';
import { ActionsMap, ActionCreators, Selectors } from './slice';
import memoize from 'memoize-state';

type InferSelectorMapState<Slctr> = Slctr extends {
  [K in keyof Slctr]: (s: infer S) => any
}
  ? S
  : never;
type InferMapFnInput<MapFn> = MapFn extends (o: infer O) => any ? O : never;

export const reMapComputed = <
  P extends string[] & {
    length: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  },
  ComputedMap extends { [s: string]: (s: any) => any }
>(
  computed: ComputedMap,
  ...paths: P
) => {
  type State = InferSelectorMapState<ComputedMap>;
  const mapFn = makeTypeSafeSelector(...paths)<State>();
  type Obj = InferMapFnInput<typeof mapFn>;
  return (Object.keys(computed) as Array<keyof ComputedMap>).reduce<
    { [K in keyof ComputedMap]: (state: Obj) => ReturnType<ComputedMap[K]> }
  >(
    (map, key) => {
      const memoed = memoize(computed[key]);
      return {
        ...map,
        [key]: (s: Obj) => memoed(mapFn(s)),
      };
    },
    {} as any,
  );
};
export const reMapSelectors = <
  P extends string[] & {
    length: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  },
  SelectorMap extends { [s: string]: (s: any) => any }
>(
  selectors: SelectorMap,
  ...paths: P
) => {
  type State = InferSelectorMapState<SelectorMap>;
  const mapFn = makeTypeSafeSelector(...paths)<State>();
  type Obj = InferMapFnInput<typeof mapFn>;
  return (Object.keys(selectors) as Array<keyof SelectorMap>).reduce<
    { [K in keyof SelectorMap]: (state: Obj) => ReturnType<SelectorMap[K]> }
  >(
    (map, key) => ({
      ...map,
      [key]: (s: Obj) => selectors[key](mapFn(s)),
    }),
    {} as any,
  );
};

export type ReMappedSelectors<
  P extends string[],
  SS,
  Selects extends { [s: string]: (state: SS) => any }
> = {
  [K in keyof Selects]: (
    state: NestedObject<P, 0, GetArrayLength<P>, SS>,
  ) => ReturnType<Selects[K]>
};

export const makeReMapableSelectors = <
  SelectorMap extends { [s: string]: (s: any) => any }
>(
  selectors: SelectorMap,
) => {
  return <
    P extends string[] & {
      length: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
    }
  >(
    ...paths: P
  ) => reMapSelectors(selectors, ...paths);
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
  <SliceState>(initialState: SliceState, paths?: ''): Selectors<SliceState>;
  <SliceState, P extends string[]>(
    initialState: SliceState,
    ...paths: P
  ): ReMappedSelectors<P, SliceState, Selectors<SliceState>>;
}
export const makeSelectors: MakeSelectors = <SliceState, P extends string[]>(
  initialState: SliceState,
  ...paths: P
) => {
  let initialStateKeys: Array<Extract<keyof SliceState, string>> = [];
  if (
    typeof initialState === 'object' &&
    initialState !== null &&
    !Array.isArray(initialState)
  ) {
    initialStateKeys = Object.keys(initialState) as Array<
      Extract<keyof SliceState, string>
    >;
  }
  const otherSelectors = initialStateKeys.reduce<
    {
      [key in Extract<keyof SliceState, string>]: (
        state: SliceState,
      ) => SliceState[key]
    }
  >(
    (map, key) => ({
      ...map,
      [key]: makeTypeSafeSelector(...paths, key)<SliceState[typeof key]>(),
    }),
    {} as any,
  );
  return {
    selectSlice: makeTypeSafeSelector(...paths)<SliceState>(),
    ...otherSelectors,
  };
};
