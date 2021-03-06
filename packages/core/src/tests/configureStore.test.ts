import { configureStore, getDefaultMiddleware } from '../configureStore';
import * as redux from 'redux';
import * as devtools from 'redux-devtools-extension';

import thunk from 'redux-thunk';
import { createSlice } from '@redux-ts-starter-kit/slice';

describe('getDefaultMiddleware', () => {
  const ORIGINAL_NODE_ENV = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = ORIGINAL_NODE_ENV;
  });
  it('returns an array with only redux-thunk in production', () => {
    process.env.NODE_ENV = 'production';
    expect(getDefaultMiddleware()).toEqual([thunk,]);
  });

  it('returns an array with additional middleware in development', () => {
    const middleware = getDefaultMiddleware();
    expect(middleware).toContain(thunk);
    expect(middleware.length).toBeGreaterThan(1);
  });
});

describe('configureStore', () => {
  jest.spyOn(redux, 'applyMiddleware');
  jest.spyOn(redux, 'combineReducers');
  jest.spyOn(redux, 'compose');
  jest.spyOn(redux, 'createStore');
  jest.spyOn(devtools, 'composeWithDevTools');

  // tslint:disable-next-line: no-empty
  function reducer() {}

  beforeEach(() => jest.clearAllMocks());

  describe('given a function reducer', () => {
    it('calls createStore with the reducer', () => {
      expect(configureStore({ reducer })).toBeInstanceOf(Object);
      expect(redux.applyMiddleware).toHaveBeenCalled();
      expect(devtools.composeWithDevTools).toHaveBeenCalled();
      expect(redux.createStore).toHaveBeenCalledWith(
        reducer,
        undefined,
        expect.any(Function),
      );
    });
  });

  describe('given an object of reducers', () => {
    it('calls createStore with the combined reducers', () => {
      const reducer2 = {
        reducer() {
          return true;
        },
      };
      expect(configureStore({ reducer: reducer2 })).toBeInstanceOf(Object);
      expect(redux.combineReducers).toHaveBeenCalledWith(reducer2);
      expect(redux.applyMiddleware).toHaveBeenCalled();
      expect(devtools.composeWithDevTools).toHaveBeenCalled();
      expect(redux.createStore).toHaveBeenCalledWith(
        expect.any(Function),
        undefined,
        expect.any(Function),
      );
    });
  });

  describe('given no reducer', () => {
    it('throws', () => {
      expect(configureStore).toThrow(
        'Reducer argument must be a function or an object of functions that can be passed to combineReducers',
      );
    });
  });

  describe('given no middleware', () => {
    it('calls createStore without any middleware', () => {
      expect(configureStore({ middleware: [], reducer })).toBeInstanceOf(
        Object,
      );
      expect(redux.applyMiddleware).toHaveBeenCalledWith();
      expect(devtools.composeWithDevTools).toHaveBeenCalled();
      expect(redux.createStore).toHaveBeenCalledWith(
        reducer,
        undefined,
        expect.any(Function),
      );
    });
  });

  describe('given custom middleware', () => {
    it('calls createStore with custom middleware and without default middleware', () => {
      const thank = (store: any) => (next: (arg0: any) => any) => (
        action: any,
      ) => next(action);
      expect(configureStore({ middleware: [thank,], reducer })).toBeInstanceOf(
        Object,
      );
      expect(redux.applyMiddleware).toHaveBeenCalledWith(thank);
      expect(devtools.composeWithDevTools).toHaveBeenCalled();
      expect(redux.createStore).toHaveBeenCalledWith(
        reducer,
        undefined,
        expect.any(Function),
      );
    });
  });

  describe('with devTools disabled', () => {
    it('calls createStore without devTools enhancer', () => {
      expect(configureStore({ devTools: false, reducer })).toBeInstanceOf(
        Object,
      );
      expect(redux.applyMiddleware).toHaveBeenCalled();
      expect(redux.compose).toHaveBeenCalled();
      expect(redux.createStore).toHaveBeenCalledWith(
        reducer,
        undefined,
        expect.any(Function),
      );
    });
  });

  describe('given preloadedState', () => {
    it('calls createStore with preloadedState', () => {
      expect(configureStore({ reducer })).toBeInstanceOf(Object);
      expect(redux.applyMiddleware).toHaveBeenCalled();
      expect(devtools.composeWithDevTools).toHaveBeenCalled();
      expect(redux.createStore).toHaveBeenCalledWith(
        reducer,
        undefined,
        expect.any(Function),
      );
    });
  });

  describe('given enhancers', () => {
    it('calls createStore with enhancers', () => {
      const enhancer = (next: any) => next;
      expect(configureStore({ enhancers: [enhancer,], reducer })).toBeInstanceOf(
        Object,
      );
      expect(redux.applyMiddleware).toHaveBeenCalled();
      expect(devtools.composeWithDevTools).toHaveBeenCalled();
      expect(redux.createStore).toHaveBeenCalledWith(
        reducer,
        undefined,
        expect.any(Function),
      );
    });
  });
});

describe('multiple createSlice reducers used to create a redux store', () => {
  interface IState {
    hi: HiSliceState;
    auth: AuthSliceState;
    form: FormState;
  }

  interface HiSliceState {
    greeting: string;
    waves: number;
  }
  interface Actions {
    setGreeting: string;
    setWaves: number;
    resetHi: never;
  }

  const hiInitialState: HiSliceState = {
    greeting: '',
    waves: 0,
  };

  const hiSlice = createSlice<Actions, HiSliceState, {}, {}>({
    cases: {
      setGreeting: (state, payload) => {
        state.greeting = payload;
      },
      setWaves: (state, payload) => {
        state.waves = payload;
      },
      resetHi: () => hiInitialState,
    },
    initialState: hiInitialState,
  });

  interface FormState {
    name: string;
    surname: string;
    middlename: string;
  }

  const formInitialState: FormState = {
    name: '',
    surname: '',
    middlename: '',
  };

  const formSlice = createSlice({
    cases: {
      setName: (state, payload: string) => {
        state.name = payload;
      },
      setSurname: (state, payload: string) => {
        state.surname = payload;
      },
      setMiddlename: (state, payload: string) => {
        state.middlename = payload;
      },
      resetForm: (state, _: never) => formInitialState,
    },
    initialState: formInitialState,
  });

  interface AuthSliceState {
    idToken: string;
    userId: string;
  }
  interface AuthSuccess {
    idToken: string;
    userId: string;
  }
  interface AuthActions {
    authLogin: AuthSuccess;
    authLogout: never;
  }

  const authInitialState: AuthSliceState = {
    idToken: '',
    userId: '',
  };

  const authSlice = createSlice<AuthActions, AuthSliceState, {}, {}>({
    initialState: authInitialState,
    cases: {
      authLogout: (state) => {
        state.idToken = '';
        state.userId = '';
      },
      authLogin: (state, payload) => {
        state.idToken = payload.idToken;
        state.userId = payload.userId;
      },
    },
  });

  const store = configureStore<IState>({
    reducer: {
      auth: authSlice.reducer,
      form: formSlice.reducer,
      hi: hiSlice.reducer,
    },
  });

  describe('store dispatches actions correctly', () => {
    describe('Actions in hiSlice', () => {
      it('sets greeting in hi', () => {
        store.dispatch(hiSlice.actions.setGreeting('Kaydo!')),
          expect(store.getState()).toEqual({
            form: {
              name: '',
              surname: '',
              middlename: '',
            },
            hi: {
              greeting: 'Kaydo!',
              waves: 0,
            },
            auth: {
              idToken: '',
              userId: '',
            },
          });
      });
      it('sets waves in hi', () => {
        store.dispatch(hiSlice.actions.setWaves(5));
        expect(store.getState()).toEqual({
          form: {
            name: '',
            surname: '',
            middlename: '',
          },
          hi: {
            greeting: 'Kaydo!',
            waves: 5,
          },
          auth: {
            idToken: '',
            userId: '',
          },
        });
      });
      it('resets hi', () => {
        store.dispatch(hiSlice.actions.resetHi()),
          expect(store.getState()).toEqual({
            form: {
              name: '',
              surname: '',
              middlename: '',
            },
            hi: {
              greeting: '',
              waves: 0,
            },
            auth: {
              idToken: '',
              userId: '',
            },
          });
      });
    });
    describe('Actions in formSlice', () => {
      it('sets name in form', () => {
        store.dispatch(formSlice.actions.setName('John')),
          expect(store.getState()).toEqual({
            form: {
              name: 'John',
              surname: '',
              middlename: '',
            },
            hi: {
              greeting: '',
              waves: 0,
            },
            auth: {
              idToken: '',
              userId: '',
            },
          });
      });
      it('sets surname in form', () => {
        store.dispatch(formSlice.actions.setSurname('Wayne'));
        expect(store.getState()).toEqual({
          form: {
            name: 'John',
            surname: 'Wayne',
            middlename: '',
          },
          hi: {
            greeting: '',
            waves: 0,
          },
          auth: {
            idToken: '',
            userId: '',
          },
        });
      });
      it('sets middlename in form', () => {
        store.dispatch(formSlice.actions.setMiddlename('Doe')),
          expect(store.getState()).toEqual({
            form: {
              name: 'John',
              surname: 'Wayne',
              middlename: 'Doe',
            },
            hi: {
              greeting: '',
              waves: 0,
            },
            auth: {
              idToken: '',
              userId: '',
            },
          });
      });
      it('resets form', () => {
        store.dispatch(formSlice.actions.resetForm());
        expect(store.getState()).toEqual({
          form: {
            name: '',
            surname: '',
            middlename: '',
          },
          hi: {
            greeting: '',
            waves: 0,
          },
          auth: {
            idToken: '',
            userId: '',
          },
        });
      });
    });
    describe('Actions in authSlice', () => {
      it('sets userId and idToken in auth', () => {
        store.dispatch(
          authSlice.actions.authLogin({
            idToken: 'a random token',
            userId: 'a user id',
          }),
        ),
          expect(store.getState()).toEqual({
            form: {
              name: '',
              surname: '',
              middlename: '',
            },
            hi: {
              greeting: '',
              waves: 0,
            },
            auth: {
              idToken: 'a random token',
              userId: 'a user id',
            },
          });
      });
      it('resets userId and idToken in auth', () => {
        store.dispatch(authSlice.actions.authLogout()),
          expect(store.getState()).toEqual({
            form: {
              name: '',
              surname: '',
              middlename: '',
            },
            hi: {
              greeting: '',
              waves: 0,
            },
            auth: {
              idToken: '',
              userId: '',
            },
          });
      });
    });
  });
});
