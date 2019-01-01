import { AnyAction } from 'redux';

// export type Reducer<S = any, A extends Action = AnyAction> = (
//   state: S | undefined,
//   action: A,
// ) => S | undefined;

// export type ReducersMapObject<S = any, A extends Action = Action> = {
//   [K in keyof S]: Reducer<S[K], A>
// };

export type CReducer<S = any, A = any> = (
  state: S | undefined,
  payload: A,
) => S | void | undefined;
export type CReducer2<S = any> = (state: S) => S;

type Actions<S = any, Ax = any> = { [K in keyof Ax]: CReducer<S, Ax[K]> };

type IActions<P = any> = {
  [K: string]: P;
};

type Result<A = any, S = any, SS = S> = {
  slice: string;
  reducer: CReducer<S, AnyAction>;
  selectors: { [x: string]: (state: SS) => S };
  actions: {
    [key in keyof A]: Object extends A[key]
      ? (payload?: A[key]) => A[key]
      : (payload: A[key]) => A[key]
  };
};

// export function test<Ax extends IActions = IActions>(
//   initState: S,
//   actions: Actions<S>,
//   slice: string,
// ): Result<any>;
export function tests<S = any, Ax extends IActions = IActions, SS = S>({
  initState,
  actions,
  slice = '',
}: {
  initState: S;
  actions: Actions<S, Ax>;
  slice: string;
}): Result<Ax, S, SS> {
  return '' as any;
}

const fdf = tests<{ sd: number }>({
  initState: { sd: 5 },
  actions: {
    set: (state, payload: number) => {
      state.sd = payload;
    },
    reset: (state) => state,
  },
  slice: 'hello',
});

fdf.actions.set;
fdf.actions.reset;
fdf.reducer(undefined, { type: 'dfdf' });
