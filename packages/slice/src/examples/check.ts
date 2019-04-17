// @ts-nocheck
import { AnyAction, Action, Reducer } from 'redux';
import { Draft } from 'immer';
import { PayloadAction } from '../types';

/**
 * Defines a mapping from action types to corresponding action object shapes.
 */
export type Actions<T extends keyof any = string> = Record<T, Action>;

export type CaseReducer<S = any, A extends PayloadAction = PayloadAction> = (
  state: Draft<S>,
  action: A extends PayloadAction<infer P, infer T>
    ? {} extends P
      ? PayloadAction<any, any>
      : PayloadAction<P, T>
    : never,
) => S | void;

// tslint:disable-next-line: interface-over-type-literal
type Test = {
  h: (state: number, action: PayloadAction<number, 'hi'>) => void;
  //   [s:string]: any
};
type ASF = CaseReducer<number, PayloadAction<symbol, 'ffdf'>>;

const asf: ASF = (state, action) => {
  action.payload;
};
const R = test<number, Test>({
  cases: {
    h: (state, action) => {
      state = action.payload;
    },
  },
  state: 5,
});
const R3 = test({
  cases: {
    h: (state, action: PayloadAction<string, 'helo'>) => state,
  },
  state: 5,
});
const R4 = test({
  cases: {
    h: (state, action: PayloadAction<number, 'hi/set'>) => state,
    h3: () => 5,
  },
  state: 5,
});
const R5 = test({
  cases: {
    h: (state, action: PayloadAction<number, 'hi/set'>) => state,
    h3: (state, action: number) => 5,
  },
  state: 5,
});

/**
 * A mapping from action types to case reducers for `createReducer()`.
 */
export type CaseReducers<
  S,
  AS extends { [x: string]: PayloadAction<any, any> }
> = { [T in keyof AS]: CaseReducer<S, AS[T]> };
// type TypeErrorMessage = 'ERROR: `action` arg must be of type `PayloadAction`'
type CaseReducerActionPayloads<CR extends CaseReducers<any, any>> = {
  [T in keyof CR]: CR[T] extends (state: any) => any
    ? void
    : (CR[T] extends (state: any, action: PayloadAction<infer P>) => any
        ? P
        : void)
};

interface AuthActions$ {
  authSuccess$: PayloadAction<string>;
  authStart$: PayloadAction<never>;
  authFail$: PayloadAction<Error>;
  authLogout$: PayloadAction<never>;
}

type AF = CaseReducers<any, AuthActions$>;

function test<S, CR extends CaseReducers<S, any>>({
  cases,
}: {
  cases: CR;
  state: S;
}): {
  [K in keyof CR]: CR[K] extends (state: any) => any
    ? PayloadAction<void>
    : CR[K] extends (
        state: any,
        action: PayloadAction<infer P, infer T, infer Sl>,
      ) => any
    ? PayloadAction<P, T, Sl>
    : void
} {
  return cases as any;
}

type CaseReducer2<SS, A extends PayloadAction<any, any>> = (
  state: Draft<SS>,
  action: A,
) => SS | void | undefined;

type Cases1<SS, Ax extends ActionsMap> = {
  [K in keyof Ax]: CaseReducer2<SS, Ax[K]>
};
interface ActionsMap {
  [s: string]: any;
}
type ActionsMap2<A> = { [s in keyof A]: PayloadAction<any, any> };
interface ActionsMap3<A = any> {
  [s: string]: A[keyof A] extends PayloadAction<any, any>
    ? PayloadAction<any, any>
    : void;
}
function test2<S, CR extends ActionsMap>({
  cases,
}: {
  cases: CaseReducers<S, CR>;
  state: S;
}) {
  return cases;
}

interface Test2 {
  h: PayloadAction<string, 'ty'>;
  g: string;
  //   [s:string]: any
}

const R1 = test2<number, Test2>({
  cases: {
    h: (state, action) => state,
    g: (state, action) => state,
  },
  state: 5,
});
const R2 = test2({
  cases: {
    h: (state, action: PayloadAction<string>) => state,
    hf: (state, action: PayloadAction<string>) => state,
    hfg: (state) => state,
  },
  state: 5,
});
const RR = test2({
  cases: {
    h: (state: any, action: string) => state,
  },
  state: 5,
});
