import memoize from 'memoize-state';
import { createTypeSafeAction, createSliceAction } from './action';
import { makeTypeSafeSelector, NestedObject } from './selector';
import { ActionsMap, ActionCreators, Selectors, Cases, Reducer } from './slice';
import { createReducer } from './reducer';
import { AnyAction, PayloadAction } from './types';

export type ArgOf<Fn> = Fn extends (o: infer O) => any ? O : never;

export const makeComputedSelectors = <
  ComputedMap extends { [s: string]: (s: any) => any },
>(
  selectors: ComputedMap,
) => {
  const temp = {} as ComputedMap;
  (Object.keys(selectors) as Array<keyof ComputedMap>).forEach((key) => {
    temp[key] = memoize(
      selectors[key].bind(temp) as ComputedMap[keyof ComputedMap],
    );
  });
  return temp;
};

export const reMapSelectors = <
  P extends string[] & {
    length: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  },
  SelectorMap extends { [s: string]: (s: any) => any },
>(
  selectors: SelectorMap,
  ...paths: P
): ReMappedSelectors<P, SelectorMap> => {
  const mapFn = makeTypeSafeSelector(...paths)();
  type Obj = ArgOf<typeof mapFn>;
  return (Object.keys(selectors) as Array<keyof SelectorMap>).reduce<
    ReMappedSelectors<P, SelectorMap>
  >((map, key) => {
    const selector = selectors[key];
    return {
      ...map,
      [key]: (state: Obj) => selector(mapFn(state)),
    };
  }, {} as any);
};

export type ReMappedSelectors<
  P extends string[],
  Selects extends { [s: string]: (state: any) => any },
> = { [K in keyof Selects]: ReMappedSelector<P, Selects[K]> };

export type ReMappedSelector<
  P extends string[],
  Select extends (state: any) => any,
> = (state: NestedObject<P, 0, ArgOf<Select>>) => ReturnType<Select>;

export interface MapSelectorsTo<
  SelectorMap extends { [s: string]: (state: any) => any },
> {
  <
    P extends string[] & {
      length: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
    },
  >(
    p0: '',
    ...paths: P
  ): ReMappedSelectors<P, SelectorMap>;
  <
    P extends string[] & {
      length: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
    },
  >(
    ...paths: P
  ): ReMappedSelectors<P, SelectorMap>;
}
export function makeReMapableSelectors<
  SelectorMap extends { [s: string]: (s: any) => any },
>(selectors: SelectorMap): MapSelectorsTo<SelectorMap>;

export function makeReMapableSelectors<
  SelectorMap extends { [s: string]: (s: any) => any },
  ComputedMap extends { [s: string]: (s: any) => any },
  S,
>(
  selectors: SelectorMap,
  computed: ComputedMap,
): MapSelectorsTo<SelectorMap & ComputedMap>;

export function makeReMapableSelectors<
  SelectorMap extends { [s: string]: (s: any) => any },
  ComputedMap extends { [s: string]: (s: any) => any },
>(
  selectors: SelectorMap,
  computed: ComputedMap = {} as any,
): MapSelectorsTo<SelectorMap & ComputedMap> {
  return <
    P extends string[] & {
      length: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
    },
  >(
    ...paths: P
  ) =>
    reMapSelectors(
      { ...selectors, ...makeComputedSelectors(computed) },
      ...paths,
    );
}

export const makeActionCreators = <
  Actions extends ActionsMap,
  TypeOverrides extends { [K in keyof Actions]?: string },
>(
  actionKeys: Array<Extract<keyof Actions, string>>,
  typeOverrides: TypeOverrides = {} as TypeOverrides,
): ActionCreators<Actions, TypeOverrides> => actionKeys.reduce((map, action) => {
    const type = pickType<Actions, TypeOverrides>(typeOverrides, action);
    map[action] = createTypeSafeAction(type)<Actions[typeof action]>();
    return map;
  }, {} as any);

export const makeReducer = <
  Ax extends ActionsMap,
  S,
  TyO extends { [K in keyof Ax]?: string },
>(
  initialState: S,
  casesInput: Cases<S, Ax, TyO>,
  typeOverrides: TyO = {} as TyO,
) => {
  const cases = (
    Object.keys(casesInput) as Array<Extract<keyof Ax, string>>
  ).reduce((map, key) => {
    const type = pickType<Ax, TyO>(typeOverrides, key);
    map[type] = casesInput[key];
    return map;
  }, {} as any);

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
  ): ReMappedSelectors<P, Selectors<SliceState>>;
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
      ) => SliceState[key];
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

export type CreateNameSpace<SS, Ax> = <Sl extends string>(
  slice: Sl,
) => {
  sliceReducer: Reducer<SS> & { toString: () => Sl };
  sliceActions: {
    [K in keyof Ax]: Ax[K] & {
      slice: Sl;
    };
  };
};

export const makeNameSpacedReducer = <S, A extends ActionCreators<any, any>>(
  reducer: Reducer<S>,
  actions: A,
): CreateNameSpace<S, A> => <Sl extends string>(slice: Sl) => {
    const initialState = reducer(undefined, { type: '^&&@@^&&^$$&**%' });
    const sliceReducer = (state: S = initialState, action: AnyAction) => {
      if (slice !== action.slice) {
        return state;
      }
      return reducer(state, action);
    };
    sliceReducer.toString = (): Sl => String(slice) as Sl;
    const sliceActions = (
      Object.entries(actions) as Array<[keyof A, A[keyof A]]>
    ).reduce<{ [K in keyof A]: A[K] & { slice: Sl } }>((map, [key, fn]) => ({
        ...map,
        [key]: createSliceAction(fn.type, slice)<
          InferActionCreatorPayload<typeof fn>
        >(),
      }), {} as any);

    return { sliceReducer, sliceActions };
  };

type InferActionCreatorPayload<A> = A extends () => PayloadAction<infer P, any>
  ? P
  : never;

function pickType<
  Ax extends ActionsMap,
  TyO extends { [K in keyof Ax]?: string },
>(typeOverrides: TyO, key: Extract<keyof Ax, string>) {
  const newType = typeOverrides[key];
  return typeof newType === 'string' && newType !== '' ? newType : key;
}
