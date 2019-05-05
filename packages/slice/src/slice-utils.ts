import { createAction } from './action';
import { makeTypeSafeSelector, NestedObject, GetArrayLength } from './selector';
import { ActionsMap, ActionCreators, Selectors, Cases } from './slice';
import memoize from 'memoize-state';
import { createReducer } from './reducer';

type InferSelectorMapState<Slctr> = Slctr extends {
  [K in keyof Slctr]: (s: infer S) => any
}
  ? S
  : never;
type InferMapFnInput<MapFn> = MapFn extends (o: infer O) => any ? O : never;

export const makeComputedSelectors = <
  P extends string[] & {
    length: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  },
  ComputedMap extends { [s: string]: (s: any) => any }
>(
  selectors: ComputedMap,
  ...paths: P
) => {
  type State = InferSelectorMapState<ComputedMap>;
  const mapFn = makeTypeSafeSelector(...paths)<State>();
  type Obj = InferMapFnInput<typeof mapFn>;
  return (Object.keys(selectors) as Array<keyof ComputedMap>).reduce<
    { [K in keyof ComputedMap]: (state: Obj) => ReturnType<ComputedMap[K]> }
  >(
    (map, key) => {
      const memoed = memoize(selectors[key]);
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
  SelectorMap extends { [s: string]: (s: any) => any },
  ComputedMap extends { [s: string]: (s: any) => any }
>(
  selectors: SelectorMap,
  computed: ComputedMap,
) => {
  return <
    P extends string[] & {
      length: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
    }
  >(
    ...paths: P
  ) =>
    reMapSelectors(
      { ...selectors, ...makeComputedSelectors(computed) },
      ...paths,
    );
};

export const makeActionCreators = <
  Actions extends ActionsMap,
  TypeOverrides extends { [K in keyof Actions]?: string }
>(
  actionKeys: Array<Extract<keyof Actions, string>>,
  typeOverrides?: TypeOverrides,
): ActionCreators<Actions, TypeOverrides> => {
  return actionKeys.reduce(
    (map, action) => {
      const type =
        typeOverrides &&
        typeof typeOverrides[action] === 'string' &&
        typeOverrides[action] !== ''
          ? typeOverrides[action]!
          : action;
      map[action] = createAction(type);
      return map;
    },
    {} as any,
  );
};

export const makeReducer = <
  Ax extends ActionsMap,
  TyO extends { [K in keyof Ax]?: string },
  S
>(
  initialState: S,
  casesInput: Cases<S, Ax, TyO>,
  typeOverrides: TyO,
) => {
  const cases = (Object.keys(casesInput) as Array<keyof Ax>).reduce(
    (map, key) => {
      const type =
        typeOverrides &&
        typeof typeOverrides[key] === 'string' &&
        typeOverrides[key] !== ''
          ? typeOverrides[key]!
          : key;
      map[type] = casesInput[key];
      return map;
    },
    {} as any,
  );

  return createReducer({
    initialState,
    cases,
  });
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
  const initialStateKeys: Array<Extract<keyof SliceState, string>> =
    typeof initialState === 'object' &&
    initialState !== null &&
    !Array.isArray(initialState)
      ? (Object.keys(initialState) as Array<Extract<keyof SliceState, string>>)
      : [];
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
