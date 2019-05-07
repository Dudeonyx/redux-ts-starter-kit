import { ActionsMap, Slice, Cases } from '../slice';
import { Draft } from 'immer';
import { PayloadAction } from '../types';
import { createTypeSafeAction } from '../action';

interface CRO<S, Ax, Ac, Cx> {
  state: S;
  cases: Cases<S, Ax>;
  computed: Cx;
  actionCreators?: Ac;
}

const createType = <T extends string>(type: T) => type;

type InferType<A, F extends string> = A extends { [K in F]: string } ? A[F] : F;

function crSl<
  S,
  Ax extends {},
  Ac extends { [K in keyof Ax]?: string },
  Cx extends { [s: string]: (state: S) => any }
>(
  o: CRO<S, Ax, Ac, Cx>,
): { [C in Extract<keyof Ax, string>]: PayloadAction<Ax[C], InferType<Ac, C>> };

function crSl<
  S,
  Ax extends {},
  Ac extends { [K in keyof Ax]?: string },
  Cx extends { [s: string]: (state: S) => any }
>(
  o: CRO<S, Ax, Ac, Cx>,
): {
  [C in Extract<keyof Ax, string>]: PayloadAction<Ax[C], InferType<Ac[C], C>>
};

function crSl(o: any): any {
  return null as any;
}

function makeC<C extends { [s: string]: (state: any) => any }>(c: C): C {
  return null as any;
}

const dfsdf = makeC({
  me(state) {
    return state + 5;
  },
  two(state) {
    console.log(this);
    return state + 6;
  },
});
const tsf = crSl({
  actionCreators: {
    fth: createType('TypeSafe'),
  },
  computed: {
    me(state) {
      return state + 5;
    },
    two(state) {
      console.log(this);
      return state + 6;
    },
  },
  cases: {
    fth: (state, payload: number) => payload,
    qew: (state, payload: number) => payload,
  },
  state: 5,
});

type IncreaseNum<N extends number> = N extends 0
  ? 1
  : N extends 1
  ? 2
  : N extends 2
  ? 3
  : N extends 3
  ? 4
  : N extends 4
  ? 5
  : N extends 5
  ? 6
  : N extends 6
  ? 7
  : N extends 7
  ? 8
  : never;

type Scale<
  S extends string[] | ReadonlyArray<string>,
  Start extends number,
  Max extends number,
  Fin
> = Start extends Max
  ? Fin
  : { [K in S[Start]]: Scale<S, IncreaseNum<Start>, Max, Fin> };

type GetArrayLength<S extends any[] | ReadonlyArray<any>> = S extends {
  length: infer L;
}
  ? L
  : never;

const safeGet = <O extends { [x: string]: any }, K extends string>(
  object: O,
  key: K,
): O[K] => (object ? object[key] : undefined);

type Getter<
  P extends string[],
  O extends { [s: string]: any }
> = GetArrayLength<P> extends 0
  ? O
  : GetArrayLength<P> extends 1
  ? O[P[0]]
  : GetArrayLength<P> extends 2
  ? O[P[0]][P[1]]
  : GetArrayLength<P> extends 3
  ? O[P[0]][P[1]][P[2]]
  : GetArrayLength<P> extends 4
  ? O[P[0]][P[1]][P[2]][P[3]]
  : GetArrayLength<P> extends 5
  ? O[P[0]][P[1]][P[2]][P[3]][P[4]]
  : GetArrayLength<P> extends 6
  ? O[P[0]][P[1]][P[2]][P[3]][P[4]][P[5]]
  : GetArrayLength<P> extends 7
  ? O[P[0]][P[1]][P[2]][P[3]][P[4]][P[5]][P[6]]
  : GetArrayLength<P> extends 8
  ? O[P[0]][P[1]][P[2]][P[3]][P[4]][P[5]][P[6]][P[7]]
  : never;

function makeGetter<
  P extends string[] & { length: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 }
>(...paths: P) {
  return <O extends Scale<P, 0, GetArrayLength<P>, any>>(
    object: O,
  ): Getter<P, O> => getter(paths, object);
}
function getter<
  P extends string[] & { length: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 },
  O extends Scale<P, I, GetArrayLength<P>, any>,
  I extends number = 0
>(paths: P, object: O, index: I = 0 as I): Getter<P, O> {
  const key = paths[index];
  const nextIndex = index + 1;
  if (paths.length === nextIndex) {
    return safeGet(object, key);
  }
  return getter(paths, safeGet(object, key), nextIndex);
}

const ff = makeGetter();

const newLocal = {
  hello: {
    world: 'hello',
  },
  yolo: '',
};
const gs = ff(newLocal);

function intGet<O extends { [s: string]: any }>(
  object: O,
  ...paths: never[]
): O;
function intGet<O extends { [s: string]: any }, P0 extends keyof O>(
  object: O,
  p0: P0,
): O[P0];
function intGet<
  O extends { [s: string]: any },
  P0 extends keyof O,
  P1 extends keyof O[P0]
>(object: O, p0: P0, p1: P1): O[P0][P1];
function intGet<
  O extends { [s: string]: any },
  P0 extends keyof O,
  P1 extends keyof O[P0],
  P2 extends keyof O[P0][P1]
>(object: O, p0: P0, p1: P1, p2: P2): O[P0][P1][P2];
function intGet<
  O extends { [s: string]: any },
  P0 extends keyof O,
  P1 extends keyof O[P0],
  P2 extends keyof O[P0][P1],
  P3 extends keyof O[P0][P1][P2]
>(object: O, p0: P0, p1: P1, p2: P2, p3: P3): O[P0][P1][P2][P3];
function intGet<
  O extends { [s: string]: any },
  P0 extends keyof O,
  P1 extends keyof O[P0],
  P2 extends keyof O[P0][P1],
  P3 extends keyof O[P0][P1][P2],
  P4 extends keyof O[P0][P1][P2][P3]
>(object: O, p0: P0, p1: P1, p2: P2, p3: P3, p4: P4): O[P0][P1][P2][P3][P4];
function intGet<
  O extends { [s: string]: any },
  P0 extends keyof O,
  P1 extends keyof O[P0],
  P2 extends keyof O[P0][P1],
  P3 extends keyof O[P0][P1][P2],
  P4 extends keyof O[P0][P1][P2][P3],
  P5 extends keyof O[P0][P1][P2][P3][P4]
>(
  object: O,
  p0: P0,
  p1: P1,
  p2: P2,
  p3: P3,
  p4: P4,
  p5: P5,
): O[P0][P1][P2][P3][P4][P5];
function intGet(object: any, ...paths: any[]) {
  return getter(paths, object);
}

type SlMp<S, M> = { [K in keyof M]: (s: S) => any };
function reMapSelectors<
  P extends string[] & {
    length: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  },
  S extends {},
  MapS extends { [s: string]: any }
>(selectors: SlMp<S, MapS>, ...paths: P): S {
  return null as any;
}

const newLocale = {
  sel: (state: { key: number }) => state.key,
  sel1: (state: { key: number }) => state,
};
const chk = reMapSelectors(newLocale);
type Selector<S, R> = (state: S) => R;
export function createStructuredSelector<S, T>(
  selectors: { [K in keyof T]: Selector<{ [E in keyof S]: S[E] }, T[K]> },
): Selector<S, T> {
  return selectors as any;
}

const chk2 = createStructuredSelector({
  sel: (state: { key: number }) => state.key,
});
{
  type GetS<S> = S extends number ? number : S extends string ? string : S;

  type ExcludeNonMethodKeys<
    T extends {},
    K extends keyof T = keyof T
  > = K extends keyof T
    ? T[K] extends (...args: any[]) => any
      ? K
      : never
    : K;
  type OmitNonMethods<T extends {}> = { [K in ExcludeNonMethodKeys<T>]: T[K] };
  interface CRO<S, Ax, Ac, Cx> {
    state: S;
    cases: Cases<S, Ax>;
    computed: Cx;
    actionCreators?: Ac;
  }
  type InferType<A, F extends string> = A extends { [K in F]: string }
    ? A[F]
    : F;
  interface CSX<S> {
    [s: string]: (s: S) => any;
  }
  function crSl<
    S,
    Ax extends {},
    Ac extends { [K in keyof Ax]?: string },
    // Cx extends ActionsMap,
    Cx extends CSX<S>
  >(
    o: CRO<S, Ax, Ac, Cx>,
  ): {
    actions: {
      [C in Extract<keyof Ax, string>]: PayloadAction<Ax[C], InferType<Ac, C>>
    };
    computed: Cx;
  };

  function crSl<
    S,
    Ax extends {},
    Ac extends { [K in keyof Ax]?: string },
    Cx extends { [s: string]: (state: S) => any }
  >(
    o: CRO<S, Ax, Ac, Cx>,
  ): {
    [C in Extract<keyof Ax, string>]: PayloadAction<Ax[C], InferType<Ac[C], C>>
  };

  function crSl(o: any): any {
    return null as any;
  }

  const tsf = crSl({
    actionCreators: {
      fth: createType('TypeSafe'),
    },
    computed: {
      me(state) {
        return state + 5;
      },
      two(state): number {
        return this.me(state) + 10;
      },
    },
    cases: {
      fth: (state, payload: number) => payload,
      qew: (state, payload: number) => payload,
    },
    state: 5,
  });
}
