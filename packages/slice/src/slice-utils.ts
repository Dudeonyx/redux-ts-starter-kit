import memoize from 'memoize-state';
import { createTypeSafeActionCreator } from './action';
import type { NestedObject } from './types';
import { makeTypeSafeSelector } from './selector';
import type {
  ActionMap,
  ActionCreatorsMap,
  Selectors,
  Reducer,
  CasesBase,
} from './slice';
import { createReducer } from './reducer';

type ArgOf<Fn> = Fn extends (o: infer O, ...g: any) => any ? O : never;

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

export function reMapSelectors<
  P extends string[] & {
    length: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  },
  SelectorMap extends { [s: string]: (s: any) => any },
  State extends any,
  Obj extends NestedObject<P, 0, any>,
>(selectors: SelectorMap, ...paths: P): ReMappedSelectors<P, SelectorMap>;

export function reMapSelectors<
  P extends string[] & {
    length: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  },
  Selector extends (s: any) => any,
  State extends any,
  Obj extends NestedObject<P, 0, any>,
>(selector: Selector, ...paths: P): ReMappedSelector<P, Selector>;

export function reMapSelectors<
  P extends string[] & {
    length: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  },
  SelectorMap extends { [s: string]: (s: State) => any },
  Selector extends (s: State) => any,
  State,
>(selectors: SelectorMap | Selector, ...paths: P) {
  const mapFn = makeTypeSafeSelector<P>(...paths)<State>();

  if (typeof selectors == 'function') {
    return (state: NestedObject<P, 0, State>) =>
      selectors(mapFn(state)) as ReMappedSelector<P, Selector>;
  }
  return (Object.keys(selectors) as Array<keyof SelectorMap>).reduce<
    ReMappedSelectors<P, SelectorMap>
  >((map, key) => {
    const selector = selectors[key];
    return {
      ...map,
      [key]: (state: NestedObject<P, 0, State>) => selector(mapFn(state)),
    };
  }, {} as any);
}

export type ReMappedSelectors<
  P extends string[],
  Selects extends { [s: string]: (state: any) => any },
> = { [K in keyof Selects]: ReMappedSelector<P, Selects[K]> };

export type ReMappedSelector<
  P extends string[],
  Select extends (state: any) => any,
> = P extends ['']
  ? (state: ArgOf<Select>) => ReturnType<Select>
  : (state: NestedObject<P, 0, ArgOf<Select>>) => ReturnType<Select>;

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
  Actions extends ActionMap,
  TypeOverrides extends { [K in keyof Actions]?: string },
  SliceName extends string | '',
>(
  actionKeys: Array<Extract<keyof Actions, string>>,
  typeOverrides: TypeOverrides = {} as TypeOverrides,
  name: SliceName = '' as SliceName,
): ActionCreatorsMap<Actions, TypeOverrides> =>
  actionKeys.reduce((map, action) => {
    const type = pickType<Actions, TypeOverrides>(typeOverrides, action);
    if (isEmptyString(name)) {
      // eslint-disable-next-line no-param-reassign
      map[action] = createTypeSafeActionCreator(type)<Actions[typeof action]>();
      return map;
    }
    // eslint-disable-next-line no-param-reassign
    map[action] = createTypeSafeActionCreator(`${name}/${type}`)<
      Actions[typeof action]
    >();
    return map;
  }, {} as any);

function isEmptyString(s: '' | string): s is '' {
  return s === '';
}

export const makeReducer = <
  Cases extends CasesBase<S>,
  S,
  TyO extends { [K in keyof Cases]?: string },
  SliceName extends string | '',
>(
  initialState: S,
  casesInput: Cases,
  typeOverrides: TyO = {} as TyO,
  name: SliceName = '' as SliceName,
) => {
  const cases: Cases = (
    Object.keys(casesInput) as Array<Extract<keyof Cases, string>>
  ).reduce((map, key) => {
    const type = pickType<Cases, TyO>(typeOverrides, key);
    if (isEmptyString(name)) {
      // eslint-disable-next-line no-param-reassign
      map[type] = casesInput[key];
      return map;
    }
    // eslint-disable-next-line no-param-reassign
    map[`${name}/${type}`] = casesInput[key];
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

// export const makeNameSpacedReducer =
//   <S, A extends ActionCreatorsMap<any, any>>(
//     reducer: Reducer<S>,
//     actions: A,
//   ): CreateNameSpace<S, A> =>
//   <Sl extends string>(slice: Sl) => {
//     const initialState = reducer(undefined, { type: '^&&@@^&&^$$&**%' });
//     const sliceReducer = (state: S = initialState, action: AnyAction) => {
//       if (slice !== action.slice) {
//         return state;
//       }
//       return reducer(state, action);
//     };
//     sliceReducer.toString = (): Sl => String(slice) as Sl;
//     const sliceActions = (
//       Object.entries(actions) as Array<[keyof A, A[keyof A]]>
//     ).reduce<{ [K in keyof A]: A[K] & { slice: Sl } }>(
//       (map, [key, fn]) => ({
//         ...map,
//         [key]: createSliceAction(fn.type, slice)<
//           InferActionCreatorPayload<typeof fn>
//         >(),
//       }),
//       {} as any,
//     );

//     return { sliceReducer, sliceActions };
//   };

// type InferActionCreatorPayload<A> = A extends () => PayloadAction<infer P, any>
//   ? P
//   : never;

function pickType<
  Ax extends ActionMap,
  TyO extends { [K in keyof Ax]?: string },
>(typeOverrides: TyO, key: Extract<keyof Ax, string>) {
  const newType = typeOverrides[key];
  return typeof newType === 'string' && newType !== '' ? newType : key;
}
