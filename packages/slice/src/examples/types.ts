import createSlice from '../slice';
import { combineReducers, createStore, applyMiddleware, Dispatch } from 'redux';
import thunk from 'redux-thunk';
import { IordersReducerState, IDbOrders } from './types.d';
import createReducer from '../reducer';

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
  actions: fhjk,
  selectors: sgjfgkfl,
  reducer: rgsgsggf,
} = createSlice({
  slice: 'hi',
  cases: {
    set: (state, payload: any[]) => payload,
    reset: (state) => ['defaultState', 'jhj'],
  },
  initialState: [],
});
const { actions, selectors, reducer } = createSlice<
  Actions,
  HiSliceState,
  IState
>({
  slice: 'hi',
  cases: {
    set: (state, payload) => payload,
    reset: (state) => defaultState,
  },
  initialState: defaultState,
});

const val = selectors.getSlice({
  hi: defaultState,
  auth: {} as AuthSliceState,
  ords: {} as IordersReducerState,
});
actions.set({ test: 'ok', wow: 0 });
actions.reset();
const red = reducer;

console.log('\nHi selector: ', val, '\nHi reducer', red);

interface AuthSliceState {
  idToken: string | null;
  userId: string | null;
  authenticating: boolean;
  error: Error | null;
}
type AuthSuccess = { idToken: string | null; userId: string | null };
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
  slice: 'auth',
  initialState,
  cases: {
    authFail: (state, error: Error, _: IState) => {
      state.error = error;
      state.authenticating = false;
    },
    authLogout: (state, _n: never) => {
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

export const authReducer2 = createReducer({
  initialState,
  cases: {
    authFail: (state, error: Error) => {
      state.error = error;
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
  orders: null,
  loading: false,
  error: null,
};

const orderSlice = createSlice({
  slice: 'ords',
  initialState: initialStateOeds,
  cases: {
    setOrders: (state, orders: IDbOrders) => {
      state.error = null;
      state.orders = orders;
      state.loading = false;
    },
    setOrdersError: (state, error: Error) => {
      state.error = error;
      state.loading = false;
    },
    setOrdersLoading: (state, n: never) => {
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
  hi: reducer,
  auth: authReducer,
  ords: ordersReducer,
});

const store = createStore(rootReducer, applyMiddleware(thunk));

const thunkAuthLogout = () => (dispatch: Dispatch, getState: () => IState) => {
  setTimeout(() => {
    dispatch(authLogout());
    console.log("\n\nThunk!!!\n\n You've been logged out!");
  }, 15000);
};

console.log('\n\n[auth object]\n', auth, '\n\n');
/* 
[auth object]
 { 
   actions: { 
     authFail: { [Function: action] toString: [Function] },
     authLogout: { [Function: action] toString: [Function] },
     authStart: { [Function: action] toString: [Function] },
     authSuccess: { [Function: action] toString: [Function] } 
    },
  reducer: { [Function: reducer] toString: [Function] },
  slice: 'auth',
  selectors: { getAuth: [Function] }
 }
 */
console.log('[authLogout action creator]\n', authLogout(), '\n');
/* 
[authLogout action creator]
{ type: 'auth/authLogout', payload: undefined }
*/

console.log(
  '[authSuccess actionCreator]\n',
  authSuccess({ idToken: 'really Long Token', userId: "It's Me" }),
  '\n',
);
/* 
[authSuccess actionCreator] 
{ 
  type: 'auth/authSuccess',
  payload: { 
    idToken: 'really Long Token',
    userId: 'It's Me'
    } 
} 
  */

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
/* 
   [authStart action dispatched]

   Action: { type: 'auth/authStart', payload: undefined }
   
   New Auth State: { 
     idToken: '',
     userId: '',
     authenticating: true, <- modified by authStart action
     error: null 
    }

    authenticating selector:  true
    */

console.log(
  '\n[start: authSuccess action dispatched]\n',
  'Action: ',
  store.dispatch(
    authSuccess({ idToken: 'really Long Token', userId: "It's Me" }),
  ),
  '\nNew Auth State: ',
  getAuth(store.getState()),
  '\nAuth idToken selector: ',
  getAuthIdToken(store.getState()),
  '\nAuth userId selector: ',
  getAuthUserId(store.getState()),
  "\n*** You've logged in successfully!***\n",
);

/* 
[start: authSuccess action dispatched]
 Action:  { 
  type: 'auth/authSuccess',
  payload: {
    idToken: 'really Long Token',
    userId: 'It's Me'
  }
}

New Auth State:  {
  idToken: 'really Long Token',
  userId: 'It's Me',
  authenticating: false,
  error: null
}

Auth idToken selector:  'really Long Token'

Auth userId selector:  'It's Me'

*** You've logged in successfully!***
*/

console.log(
  '\n[Thunk dispatched]\n',
  '\nAction: ',
  store.dispatch(thunkAuthLogout() as any),
  '\nUnchanged Auth State: ',
  getAuth(store.getState()),
  '\n***************\n',
);
/* 
[Thunk dispatched]

Action:  undefined

Unchanged Auth State: {
  idToken: 'really Long Token',
  userId: 'It's Me',
  authenticating: false,
  error: null
}

***************


**AFTER A DELAY OF 15 SECONDS**


Thunk!!!

 You've been logged out!
 
  */
