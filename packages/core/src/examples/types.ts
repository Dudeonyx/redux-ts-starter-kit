import { createSlice } from '@redux-ts-starter-kit/slice';
import { IordersReducerState, IDbOrders } from './types.d';
import { configureStore } from '../configureStore';
// import { Action } from 'redux';
// import {} from '../index';

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
  setHi: HiSliceState;
  resetHi: never;
}

const defaultState = {
  test: '',
  wow: 0,
};

export const {
  actions: { resetHi, setHi },
  selectors: { getSlice: getHi, test: getTest, wow: getWow },
  reducer: hiReducer,
} = createSlice<Actions, HiSliceState, IState>({
  slice: 'hi',
  cases: {
    setHi: (state, payload) => payload,
    resetHi: (state) => defaultState,
  },
  initialState: defaultState,
});

const val = getHi({
  hi: defaultState,
  auth: {} as AuthSliceState,
  ords: {} as IordersReducerState,
});
setHi({ test: 'ok', wow: 0 });
resetHi();

console.log('\nHi selector: ', val);

interface AuthSliceState {
  idToken: string;
  userId: string;
  authenticating: boolean;
  error: Error | false;
  nullk: null;
}
interface AuthSuccess {
  idToken: string;
  userId: string;
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
  error: false,
  nullk: null,
};

export const auth = createSlice({
  slice: 'auth',
  initialState,
  cases: {
    authFail: (state, error: Error) => {
      state.error = error;
      state.authenticating = false;
    },
    authLogout: (state, _n: never) => {
      state.idToken = '';
      state.userId = '';
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
  },
} = auth;

const initialStateOeds: IordersReducerState = {
  orders: {},
  loading: false,
  error: false,
};

const ordersRobodux = createSlice({
  slice: 'ords',
  initialState: initialStateOeds,
  cases: {
    setOrders: (state, orders: IDbOrders) => {
      state.error = false;
      state.orders = orders;
      state.loading = false;
    },
    setOrdersError: (state, error: Error) => {
      state.error = error;
      state.loading = false;
    },
    setOrdersLoading: (state, _n: never) => {
      state.loading = true;
      state.error = false;
    },
  },
});

export const {
  reducer: ordersReducer,
  actions: { setOrders, setOrdersError, setOrdersLoading },
  selectors: {
    getSlice: getOrdersSlice,
    error: getOrdersError,
    loading: getOrdersLoading,
    orders: getOrders,
  },
} = ordersRobodux;

export const store = configureStore({
  reducer: {
    hi: hiReducer,
    auth: authReducer,
    ords: ordersReducer,
  },
  // enhancers:[],
  preloadedState: {
    auth: {},
    hi: {},
    ords: {},
  },
});

store.getState();
// const {} = store;
