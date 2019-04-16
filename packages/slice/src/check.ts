import { AnyAction, Action, Reducer } from 'redux'
import { Draft } from 'immer';
import { PayloadAction } from './types';

/**
 * Defines a mapping from action types to corresponding action object shapes.
 */
export type Actions<T extends keyof any = string> = Record<T, Action>

export type CaseReducer<S = any, A extends Action = AnyAction> = (
    state: Draft<S>,
    action: A,
  ) => S | void
  
  export type SliceActionCreator<P> = P extends void
  ? () => PayloadAction<void>
  : (payload: P) => PayloadAction<P>

  /**
   * A mapping from action types to case reducers for `createReducer()`.
   */
  export type CaseReducers<S, AS extends {[k in keyof AS]: Action}> = {
    [T in keyof AS]: AS[T] extends Action ? CaseReducer<S, AS[T]> : void
  }

  type CaseReducerActionPayloads<CR extends CaseReducers<any, any>> = {
    [T in keyof CR]: CR[T] extends (state: any) => any
      ? void
      : (CR[T] extends (state: any, action: PayloadAction<infer P>) => any
          ? P
          : void)
  }

  interface AuthActions$  {
    authSuccess$: PayloadAction<AuthSuccess>;
    authStart$: PayloadAction<never>;
    authFail$: PayloadAction<Error>;
    authLogout$: PayloadAction<never>;
  }

type AF = CaseReducers<any,AuthActions$>

  function test<S,CR extends CaseReducers<S,any>>({cases}:{cases:CR,state:S}) {
     return cases;
  }

  interface Test {
      h: (state: number) => any
    //   [s:string]: any
  }

  const R = test({
      cases:{
          h: (state, action: PayloadAction<string>)=> state,
      },
      state: 5,
  })