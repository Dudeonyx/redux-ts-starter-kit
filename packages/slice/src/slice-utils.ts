import { createTypeSafeAction, createSliceAction } from './action';
import { makeTypeSafeSelector, NestedObject } from './selector';
import { ActionsMap, ActionCreators, Selectors, Cases, Reducer } from './slice';
import memoize from 'memoize-state';
import { createReducer } from './reducer';
import { AnyAction, PayloadAction } from './types';

// type InferSelectorMapState<Slctr> = Slctr extends {
//   [K in keyof Slctr]: (s: infer S) => any
// }
//   ? S
//   : never;
export type ArgOf<Fn> = Fn extends (o: infer O) => any ? O : never;

export const makeComputedSelectors = <
  ComputedMap extends { [s: string]: (s: any) => any }
>(
  selectors: ComputedMap,
) => {
  return (Object.keys(selectors) as Array<keyof ComputedMap>).reduce<
    ComputedMap
  >(
    (map, key) => {
      const memoed = memoize(selectors[key]);
      return {
        ...map,
        [key]: memoed,
      };
    },
    {} as any,
  );
};
const reMapSelector = <S, R, P extends string[]>(
  selector: (state: S) => R,
  ...paths: P
): ReMappedSelector<P, typeof selector> => {
  const mapFn = makeTypeSafeSelector(...paths)<S>();
  type Obj = ArgOf<typeof mapFn>;
  return (state: Obj) => selector(mapFn(state));
};
export const reMapSelectors = <
  P extends string[] & {
    length: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  },
  SelectorMap extends { [s: string]: (s: any) => any }
>(
  selectors: SelectorMap,
  ...paths: P
): ReMappedSelectors<P, SelectorMap> => {
  return (Object.keys(selectors) as Array<keyof SelectorMap>).reduce<
    ReMappedSelectors<P, SelectorMap>
  >(
    (map, key) => ({
      ...map,
      [key]: reMapSelector(selectors[key], ...paths),
    }),
    {} as any,
  );
};

export type ReMappedSelectors<
  P extends string[],
  Selects extends { [s: string]: (state: any) => any }
> = { [K in keyof Selects]: ReMappedSelector<P, Selects[K]> };

type ReMappedSelector<
  P extends string[],
  Select extends (state: any) => any
> = (state: NestedObject<P, 0, ArgOf<Select>>) => ReturnType<Select>;

export function makeReMapableSelectors<
  SelectorMap extends { [s: string]: (s: any) => any }
>(
  selectors: SelectorMap,
): <
  P extends string[] & {
    length: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  }
>(
  ...paths: P
) => ReMappedSelectors<P, SelectorMap>;

export function makeReMapableSelectors<
  SelectorMap extends { [s: string]: (s: any) => any },
  ComputedMap extends { [s: string]: (s: any) => any }
>(
  selectors: SelectorMap,
  computed: ComputedMap,
): <
  P extends string[] & {
    length: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  }
>(
  ...paths: P
) => ReMappedSelectors<P, SelectorMap & ComputedMap>;

export function makeReMapableSelectors<
  SelectorMap extends { [s: string]: (s: any) => any },
  ComputedMap extends { [s: string]: (s: any) => any }
>(selectors: SelectorMap, computed: ComputedMap = {} as any) {
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
}

export const makeActionCreators = <
  Actions extends ActionsMap,
  TypeOverrides extends { [K in keyof Actions]?: string }
>(
  actionKeys: Array<Extract<keyof Actions, string>>,
  typeOverrides: TypeOverrides = {} as TypeOverrides,
): ActionCreators<Actions, TypeOverrides> => {
  return actionKeys.reduce(
    (map, action) => {
      const type = pickType<Actions, TypeOverrides>(typeOverrides, action);
      map[action] = createTypeSafeAction(type)();
      return map;
    },
    {} as any,
  );
};

export const makeReducer = <
  Ax extends ActionsMap,
  S,
  TyO extends { [K in keyof Ax]?: string }
>(
  initialState: S,
  casesInput: Cases<S, Ax, TyO>,
  typeOverrides: TyO = {} as TyO,
) => {
  const cases = (Object.keys(casesInput) as Array<
    Extract<keyof Ax, string>
  >).reduce(
    (map, key) => {
      const type = pickType<Ax, TyO>(typeOverrides, key);
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

export const makeNameSpacedReducer = <S, A extends ActionCreators<any, any>>(
  reducer: Reducer<S>,
  actions: A,
) => {
  return <Sl extends string>(slice: Sl) => {
    const initialState = reducer(undefined, { type: '^&&@@^&&^$$&**%' });
    const sliceReducer = (state: S = initialState, action: AnyAction) => {
      if (slice !== action.slice) {
        return state;
      }
      return reducer(state, action);
    };
    sliceReducer.toString = (): Sl => String(slice) as Sl;
    const sliceActions = (Object.entries(actions) as Array<
      [keyof A, A[keyof A]]
    >).reduce<{ [K in keyof A]: A[K] & { slice: Sl } }>(
      (map, [key, fn,]) => {
        return {
          ...map,
          [key]: createSliceAction(fn.type, slice)<
            InferActionCreatorPayload<typeof fn>
          >(),
        };
      },
      {} as any,
    );

    return { sliceReducer, sliceActions };
  };
};

type InferActionCreatorPayload<A> = A extends () => PayloadAction<infer P, any>
  ? P
  : never;

function pickType<
  Ax extends ActionsMap,
  TyO extends { [K in keyof Ax]?: string }
>(typeOverrides: TyO, key: Extract<keyof Ax, string>) {
  return typeof typeOverrides[key] === 'string' && typeOverrides[key] !== ''
    ? typeOverrides[key]!
    : key;
}
