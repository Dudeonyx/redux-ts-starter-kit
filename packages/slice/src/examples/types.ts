import { createSlice, Cases } from '../slice';
import { combineReducers, createStore, applyMiddleware, Dispatch } from 'redux';
import thunk from 'redux-thunk';
import { IordersReducerState, IDbOrders } from './types.d';
import { createReducer } from '../reducer';
import { PayloadAction } from '../types';

interface HiSliceState {
  test: string;
  wow: number;
}

interface IState {
  hi: HiSliceState;
  auth: AuthSliceState;
  ords: IordersReducerState;
}

// tslint:disable-next-line: interface-over-type-literal
type Actions = Cases<HiSliceState,{
  set: PayloadAction<HiSliceState, 'hi/set'>;
  reset: PayloadAction<never, 'hi/reset'>;
}>;

const defaultState = {
  test: '',
  wow: 0,
};

export const {
  actions: hiActions$,
  selectors: hiSelector$,
  reducer: hiReducer$,
  slice: hiSlice$,
} = createSlice({
  slice: 'hi',
  cases: {
    set: (state, action: PayloadAction<string[], 'hi/set'>) => action.payload,
    reset: () => ['defaultState', 'jhj',],
  },
  initialState: [] as string[],
});

// tslint:disable: no-unused-expression
// $ExpectType ActionCreators<{ set: string[]; reset: {}; }>
hiActions$;
// $ExpectType { (payload: string[]): PayloadAction<"set", string[]>; type: "set"; toString: () => "set"; }
hiActions$.set;
// $ExpectType { (): PayloadAction<"reset", undefined>; type: "reset"; toString: () => "reset"; }
hiActions$.reset;
// $ExpectType { getSlice: (state: { hi: string[]; }) => string[]; }
hiSelector$;
// $ExpectType (state: { hi: string[]; }) => string[]
hiSelector$.getSlice;
// $ExpectType Reducer<string[], PayloadAction<string, any>, "hi">
hiReducer$;

// tslint:enable: no-unused-expression
const hiArray = {
  hi: ['',],
  auth: { error: null, authenticating: false } as AuthSliceState,
  ords: {} as IordersReducerState,
};
hiSelector$.getSlice(hiArray);

export const {
  actions: hiActions,
  selectors: hiSelectors,
  reducer: hiReducer,
  slice: hi_slice,
} = createSlice<Actions, HiSliceState, 'hi'>({
  slice: 'hi',
  cases: {
    set: (state, payload) => payload.payload,
    reset: () => defaultState,
  },
  initialState: defaultState,
});

// tslint:disable: no-unused-expression
// $ExpectType ActionCreators<Actions>
hiActions;
// $ExpectType { (payload: HiSliceState): PayloadAction<"set", HiSliceState>; type: "set"; toString: () => "set"; }
hiActions.set;
// $ExpectType { (): PayloadAction<"reset", undefined>; type: "reset"; toString: () => "reset"; }
hiActions.reset;

// $ExpectType Reducer<HiSliceState, PayloadAction<string, any>, "hi">
hiReducer;
// $ExpectType { test: (state: { hi: HiSliceState; }) => string; wow: (state: { hi: HiSliceState; }) => number; } & { getSlice: (state: { hi: HiSliceState; }) => HiSliceState; }
hiSelectors;
// $ExpectType (state: { hi: HiSliceState; }) => HiSliceState
hiSelectors.getSlice;
// $ExpectType (state: { hi: HiSliceState; }) => string
hiSelectors.test;
// $ExpectType (state: { hi: HiSliceState; }) => number
hiSelectors.wow;
// $ExpectType "hi"
hi_slice;

// tslint:enable: no-unused-expression

const val = hiSelectors.getSlice({
  hi: defaultState,
});

hiActions.set({ test: 'ok', wow: 0 });
hiActions.reset();
const red = hiReducer;

console.log('\nHi selector: ', val, '\nHi reducer', red);

interface AuthSliceState {
  readonly idToken: string | null;
  readonly userId: string | null;
  readonly authenticating: boolean;
  readonly error: Error | null;
  readonly nestedObj: {
    key1: number;
    key2: string;
    key3: boolean;
    deeplyNestedObj: {
      keyA: number;
      keyB: string;
    };
  };
}
interface AuthSuccess {
  idToken: string | null;
  userId: string | null;
}
export interface AuthActions {
  authSuccess: AuthSuccess;
  authStart: never;
  authFail: Error;
  authLogout: never;
}

const initialState: AuthSliceState = {
  idToken: '',
  userId: '',
  authenticating: false,
  error: null,
  nestedObj: {
    key1: 1,
    key2: '1',
    key3: true,
    deeplyNestedObj: {
      keyA: 1,
      keyB: '1',
    },
  },
};


const auth = createSlice({
  slice: 'auth',
  initialState,
  cases: {
    authFail: (state, action: PayloadAction<Error>) => {
      state.error = action.payload;
      state.authenticating = false;
    },
    authLogout: (state) => {
      state.idToken = null;
      state.userId = null;
    },
    authStart: (state) => {
      state.authenticating = true;
    },
    authSuccess: (state, action: PayloadAction<AuthSuccess>) => {
      state.authenticating = false;
      state.idToken = action.payload.idToken;
      state.userId = action.payload.userId;
    },
  },
});
// You can destructure and export the reducer, action creators and selectors
export const {
  reducer: authReducer,
  slice: authSlice,
  actions: { authFail, authStart, authSuccess, authLogout },
  selectors: {
    getSlice: getAuth,
    authenticating: getAuthAuthenticating,
    error: getAuthError,
    idToken: getAuthIdToken,
    userId: getAuthUserId,
    nestedObj,
  },
} = auth;

// tslint:disable: no-unused-expression
// $ExpectType Reducer<AuthSliceState, PayloadAction<string, any>, "auth">
authReducer;
// $ExpectType "auth"
authSlice;
// $ExpectType { (payload: Error): PayloadAction<"authFail", Error>; type: "authFail"; toString: () => "authFail"; }
authFail;
// $ExpectType { (payload: AuthSuccess): PayloadAction<"authSuccess", AuthSuccess>; type: "authSuccess"; toString: () => "authSuccess"; }
authSuccess;
// $ExpectType { (): PayloadAction<"authStart", undefined>; type: "authStart"; toString: () => "authStart"; }
authStart;
// $ExpectType { (): PayloadAction<"authLogout", undefined>; type: "authLogout"; toString: () => "authLogout"; }
authLogout;
// $ExpectType (state: { auth: AuthSliceState; }) => AuthSliceState
getAuth;
// $ExpectType (state: { auth: AuthSliceState; }) => boolean
getAuthAuthenticating;
// $ExpectType (state: { auth: AuthSliceState; }) => Error
getAuthError;
// $ExpectType (state: { auth: AuthSliceState; }) => string
getAuthUserId;
// $ExpectType (state: { auth: AuthSliceState; }) => string
getAuthIdToken;
// tslint:enable: no-unused-expression
// tslint:disable-next-line: interface-over-type-literal
export type AuthActions$ = {
  authSuccess$: PayloadAction<AuthSuccess>;
  authStart$: PayloadAction<never>;
  authFail$: PayloadAction<Error>;
  authLogout$: PayloadAction<never>;
};

type AuthCases$ = Cases<AuthSliceState, AuthActions$>

const slice = 'auth';
const auth$ = createSlice<
  AuthCases$,
  AuthSliceState,
  typeof slice
>({
  slice,
  initialState,
  cases: {
    authFail$: (state, action) => {
      state.error = action.payload;
      state.authenticating = false;
    },
    authLogout$: (state) => {
      state.idToken = null;
      state.userId = null;
    },
    authStart$: (state) => {
      state.authenticating = true;
    },
    authSuccess$: (state, action) => {
      state.authenticating = false;
      state.idToken = action.payload.idToken;
      state.userId = action.payload.userId;
    },
  },
});
// You can destructure and export the reducer, action creators and selectors
export const {
  reducer: authReducer$,
  slice: authSlice$,
  actions: { authFail$, authStart$, authSuccess$, authLogout$ },
  selectors: {
    getSlice: getAuth$,
    authenticating: getAuthAuthenticating$,
    error: getAuthError$,
    idToken: getAuthIdToken$,
    userId: getAuthUserId$,
  },
} = auth$;
// getAuth$({auth: {} as AuthSliceState,} as IState)

// tslint:disable: no-unused-expression
// $ExpectType Reducer<AuthSliceState, PayloadAction<string, any>, "auth">
authReducer$;
// $ExpectType "auth"
authSlice$;
// $ExpectType { (payload: Error): PayloadAction<"authFail$", Error>; type: "authFail$"; toString: () => "authFail$"; }
authFail$;
// $ExpectType { (payload: AuthSuccess): PayloadAction<"authSuccess$", AuthSuccess>; type: "authSuccess$"; toString: () => "authSuccess$"; }
authSuccess$;
// $ExpectType { (): PayloadAction<"authStart$", undefined>; type: "authStart$"; toString: () => "authStart$"; }
authStart$;
// $ExpectType { (): PayloadAction<"authLogout$", undefined>; type: "authLogout$"; toString: () => "authLogout$"; }
authLogout$;
// $ExpectType (state: { auth: AuthSliceState; }) => AuthSliceState
getAuth$;
// $ExpectType (state: { auth: AuthSliceState; }) => boolean
getAuthAuthenticating$;
// $ExpectType (state: { auth: AuthSliceState; }) => Error
getAuthError$;
// $ExpectType (state: { auth: AuthSliceState; }) => string
getAuthUserId$;
// $ExpectType (state: { auth: AuthSliceState; }) => string
getAuthIdToken$;
// tslint:enable: no-unused-expression

const auth$NoInterface = createSlice({
  slice: 'auth',
  initialState,
  cases: {
    authFail$2: (state, action: PayloadAction<Error,'auth/authFail$2'>) => {
      state.error = action.payload;
      state.authenticating = false;
    },
    authLogout$2: (state) => {
      state.idToken = null;
      state.userId = null;
    },
    authStart$2: (state, payload) => {
      state.authenticating = true;
    },
    authSuccess$2: (state, action: PayloadAction<AuthSuccess>) => {
      state.authenticating = false;
      state.idToken = action.payload.idToken;
      state.userId = action.payload.userId;
    },
  },
});
// You can destructure and export the reducer, action creators and selectors
export const {
  reducer: authReducer$2,
  slice: authSlice$2,
  actions: { authFail$2, authStart$2, authSuccess$2, authLogout$2 },
  selectors: {
    getSlice: getAuth$2,
    authenticating: getAuthAuthenticating$2,
    error: getAuthError$2,
    idToken: getAuthIdToken$2,
    userId: getAuthUserId$2,
  },
} = auth$NoInterface;

export const authReducer2 = createReducer({
  initialState,
  cases: {
    authFail: (state, error: PayloadAction<Error>) => {
      state.error = error.payload;
      state.authenticating = false;
    },
    authLogout: (state) => {
      state.idToken = null;
      state.userId = null;
    },
    authStart: (state) => {
      state.authenticating = true;
    },
    authSuccess: (state, payload: PayloadAction<AuthSuccess>) => {
      state.authenticating = false;
      state.idToken = payload.payload.idToken;
      state.userId = payload.payload.userId;
    },
  },
});

const initialStateOeds: IordersReducerState = {
  orders: null,
  loading: false,
  error: null,
};

const orderSlice = createSlice({
  slice: 'ords',
  initialState: initialStateOeds,
  cases: {
    setOrders: (state, orders: PayloadAction<IDbOrders>) => {
      state.error = null;
      state.orders = orders.payload;
      state.loading = false;
    },
    setOrdersError: (state, error: PayloadAction<Error>) => {
      state.error = error.payload;
      state.loading = false;
    },
    setOrdersLoading: (state) => {
      state.loading = true;
      state.error = null;
    },
  },
});

export const {
  reducer: ordersReducer,
  actions: ordersActions,
  selectors: ordersSelectors,
} = orderSlice;

const rootReducer = combineReducers<IState>({
  hi: hiReducer,
  auth: authReducer,
  ords: ordersReducer,
});

export const store = createStore(rootReducer, applyMiddleware(thunk));

const thunkAuthLogout = async () => async (
  dispatch: Dispatch,
  getState: () => IState,
) => {
  setTimeout(() => {
    dispatch(authLogout());
    console.log('\n\nThunk!!!\n\n You\'ve been logged out!');
  }, 15000);
};

console.log('\n\n[auth object]\n', auth, '\n\n');

console.log('[authLogout action creator]\n', authLogout(), '\n');

console.log(
  '[authSuccess actionCreator]\n',
  authSuccess({ idToken: 'really Long Token', userId: 'It\'s Me' }),
  '\n',
);

console.log(
  '\n[authStart action dispatched]\n',
  'Action: ',
  store.dispatch(authStart()),
  '\nNew Auth State: ',
  getAuth(store.getState()),
  '\n',
  'authenticating selector: ',
  getAuthAuthenticating(store.getState()),
  '\n',
);

console.log(
  '\n[start: authSuccess action dispatched]\n',
  'Action: ',
  store.dispatch(
    authSuccess({ idToken: 'really Long Token', userId: 'It\'s Me' }),
  ),
  '\nNew Auth State: ',
  getAuth(store.getState()),
  '\nAuth idToken selector: ',
  getAuthIdToken(store.getState()),
  '\nAuth userId selector: ',
  getAuthUserId(store.getState()),
  '\n*** You\'ve logged in successfully!***\n',
);

console.log(
  '\n[Logout Thunk dispatched]\n',
  '\nAction: ',
  store.dispatch(thunkAuthLogout() as any),
  '\nUnchanged Auth State: ',
  getAuth(store.getState()),
  '\n***************\n',
);
