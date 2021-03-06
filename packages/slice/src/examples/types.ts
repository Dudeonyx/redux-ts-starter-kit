import { createSlice, Selectors } from '../slice';
import { combineReducers, createStore, applyMiddleware, Dispatch } from 'redux';
import thunk from 'redux-thunk';
import { IordersReducerState, IDbOrders } from './types.d';
import { createReducer } from '../reducer';
import { ReMappedSelectors } from '../slice-utils';

export type Filters = 'ALL' | 'COMPLETE' | 'PENDING';
const visibilitySlice = createSlice({
  initialState: 'ALL' as Filters,
  cases: {
    setVisibilityFilter: (state, payload: Filters) => payload,
  },
});

export const selectr = visibilitySlice.mapSelectorsTo().selectSlice('ALL');

type SFDF = Selectors<Filters>;

export type ADs = ReMappedSelectors<[], SFDF>;
interface HiSliceState {
  test: string;
  wow: number;
}

interface IState {
  hi: HiSliceState;
  auth: AuthSliceState;
  ords: IordersReducerState;
}

interface Actions {
  set: HiSliceState;
  reset: never;
}

const defaultState = {
  test: '',
  wow: 0,
};

export const {
  actions: hiActions$,
  reducer: hiReducer$,
  mapSelectorsTo,
  // ...hiSlice
  // slice: hiSlice$,
} = createSlice({
  cases: {
    set: (state, payload: string[]) => payload,
    reset: () => [],
  },
  computed: {
    getLength: (state) => state.length,
  },
  initialState: [] as string[],
});
// hiSelector$
const hiSelector$ = mapSelectorsTo('hi');

const hiArray = {
  hi: ['',],
  auth: { error: null, authenticating: false } as AuthSliceState,
  ords: {} as IordersReducerState,
};
hiSelector$.selectSlice(hiArray);

export const {
  actions: hiActions,
  reducer: hiReducer,
  mapSelectorsTo: reMapSelectorsTo,
} = createSlice<Actions, HiSliceState, {}, { reset: 'RESET' }>({
  cases: {
    set: (state, payload) => payload,
    reset: () => defaultState,
  },
  typeOverrides: {
    reset: 'RESET',
  },
  initialState: defaultState,
});

const hiSelectors = reMapSelectorsTo('hi');

const val = hiSelectors.selectSlice({
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
};

const auth = createSlice({
  initialState,
  typeOverrides: {
    authFail: 'AUTH_FAIL',
    // authLogout: 5,
  },
  cases: {
    authFail: (state, payload: Error) => {
      state.error = payload;
      state.authenticating = false;
    },
    authLogout: (state) => {
      state.idToken = null;
      state.userId = null;
    },
    authStart: (state, payload) => {
      state.authenticating = true;
    },
    authSuccess: (state, payload: AuthSuccess) => {
      state.authenticating = false;
      state.idToken = payload.idToken;
      state.userId = payload.userId;
    },
  },
});
// You can destructure and export the reducer, action creators and selectors
export const {
  reducer: authReducer,
  actions: { authFail, authStart, authSuccess, authLogout },
  mapSelectorsTo: reMapAuthSelectors,
} = auth;

export const {
  selectSlice: getAuth,
  authenticating: getAuthAuthenticating,
  error: getAuthError,
  idToken: getAuthIdToken,
  userId: getAuthUserId,
} = reMapAuthSelectors('auth');

export interface AuthActions$ {
  auth_Success$: AuthSuccess;
  auth_Start$: never;
  auth_Fail$: Error;
  auth_Logout$: never;
}

const auth$ = createSlice<AuthActions$, AuthSliceState, {}, {}>({
  initialState,
  cases: {
    auth_Fail$: (state, payload) => {
      state.error = payload;
      state.authenticating = false;
    },
    auth_Logout$: (state) => {
      state.idToken = null;
      state.userId = null;
    },
    auth_Start$: (state) => {
      state.authenticating = true;
    },
    auth_Success$: (state, payload) => {
      state.authenticating = false;
      state.idToken = payload.idToken;
      state.userId = payload.userId;
    },
  },
});
// You can destructure and export the reducer, action creators and selectors
export const {
  reducer: authReducer$,
  actions: { auth_Fail$, auth_Start$, auth_Success$, auth_Logout$ },
} = auth$;

export const {
  selectSlice: getAuth$,
  authenticating: getAuthAuthenticating$,
  error: getAuthError$,
  idToken: getAuthIdToken$,
  userId: getAuthUserId$,
} = auth.mapSelectorsTo('auth');

getAuth$({ auth: {} as AuthSliceState });

const auth$NoInterface = createSlice({
  initialState,
  computed: {
    authenticated(state) {
      return !!state.idToken;
    },
    getAuthlist(state): boolean {
      return this.authenticated(state);
    },
  },
  cases: {
    auth_Fail$2: (state, payload: Error, type) => {
      state.error = payload;
      state.authenticating = false;
    },
    auth_Logout$2: (state, _n: never, type) => {
      state.idToken = null;
      state.userId = null;
    },
    auth_Start$2: (state, payload, type) => {
      state.authenticating = true;
    },
    auth_Success$2: (state, payload: AuthSuccess) => {
      state.authenticating = false;
      state.idToken = payload.idToken;
      state.userId = payload.userId;
    },
  },
  typeOverrides: {
    auth_Fail$2: 'AUTH/FAIL',
    auth_Start$2: 'AUTH/START',
    // auth_Logout$2: 5,
  },
});
// You can destructure and export the reducer, action creators and selectors
export const {
  reducer: authReducer$2,
  actions: { auth_Fail$2, auth_Start$2, auth_Success$2, auth_Logout$2 },
} = auth$NoInterface;

export const {
  selectSlice: getAuth$2,
  authenticating: getAuthAuthenticating$2,
  error: getAuthError$2,
  idToken: getAuthIdToken$2,
  userId: getAuthUserId$2,
  authenticated: getAuthenticated,
} = auth$NoInterface.mapSelectorsTo('');
export const authReducer2 = createReducer({
  initialState,
  cases: {
    authFail: (state, payload: Error) => {
      state.error = payload;
      state.authenticating = false;
    },
    authLogout: (state) => {
      state.idToken = null;
      state.userId = null;
    },
    authStart: (state) => {
      state.authenticating = true;
    },
    authSuccess: (state, payload: AuthSuccess) => {
      state.authenticating = false;
      state.idToken = payload.idToken;
      state.userId = payload.userId;
    },
  },
});

const initialStateOeds: IordersReducerState = {
  orders: null,
  loading: false,
  error: null,
};

const orderSlice = createSlice({
  initialState: initialStateOeds,
  cases: {
    setOrders: (state, payload: IDbOrders) => {
      state.error = null;
      state.orders = payload;
      state.loading = false;
    },
    setOrdersError: (state, payload: Error) => {
      state.error = payload;
      state.loading = false;
    },
    setOrdersLoading: (state, n: undefined) => {
      state.loading = true;
      state.error = null;
    },
  },
});

export const {
  reducer: ordersReducer,
  actions: ordersActions,
  mapSelectorsTo: mapOrdersSelectorsTo,
} = orderSlice;
ordersActions.setOrdersLoading();
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
