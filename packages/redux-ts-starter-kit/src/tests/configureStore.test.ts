import { configureStore, getDefaultMiddleware } from '../configureStore';
import * as redux from 'redux';
import * as devtools from 'redux-devtools-extension';

import thunk from 'redux-thunk';
import createSlice from 'robodux-alt';
// import immutableStateInvariant from 'redux-immutable-state-invariant'

describe('getDefaultMiddleware', () => {
  it('returns an array with only redux-thunk in production', () => {
    expect(getDefaultMiddleware(true)).toEqual([thunk]);
  });

  it('returns an array with additional middleware in development', () => {
    const middleware = getDefaultMiddleware(false);
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
      const reducer = {
        reducer() {
          return true;
        },
      };
      expect(configureStore({ reducer })).toBeInstanceOf(Object);
      expect(redux.combineReducers).toHaveBeenCalledWith(reducer);
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
      expect(configureStore({ middleware: [thank], reducer })).toBeInstanceOf(
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
      expect(configureStore({ enhancers: [enhancer], reducer })).toBeInstanceOf(
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

  const hiSlice = createSlice<HiSliceState, Actions, IState>({
    slice: 'hi',
    actions: {
      setGreeting: (state, payload) => {
        state.greeting = payload;
      },
      setWaves: (state, payload) => {
        state.waves = payload;
      },
      resetHi: (_state) => hiInitialState,
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
    actions: {
      setName: (state, name: string, _: IState) => {
        state.name = name;
      },
      setSurname: (state, surname: string) => {
        state.surname = surname;
      },
      setMiddlename: (state, middlename: string) => {
        state.middlename = middlename;
      },
      resetForm: (state, _: never) => formInitialState,
    },
    slice: 'form',
    initialState: formInitialState,
  });

  interface AuthSliceState {
    idToken: string;
    userId: string;
  }
  type AuthSuccess = { idToken: string; userId: string };
  interface AuthActions {
    authLogin: AuthSuccess;
    authLogout: never;
  }

  const authInitialState: AuthSliceState = {
    idToken: '',
    userId: '',
  };

  const authSlice = createSlice<AuthSliceState, AuthActions, IState>({
    slice: 'auth',
    initialState: authInitialState,
    actions: {
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

  const [store, rootReducer] = configureStore({
    reducer: {
      auth: authSlice.reducer,
      form: formSlice.reducer,
      hi: hiSlice.reducer,
    },
  });

  it('returns the combined initial states', () => {
    expect(rootReducer(undefined, { type: '@@invalid@@' })).toEqual({
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

  describe('rootReducer consumes actions correctly', () => {
    describe('Actions in hiSlice', () => {
      it('sets greeting in hi', () => {
        expect(
          rootReducer(undefined, hiSlice.actions.setGreeting('Kaydo!')),
        ).toEqual({
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
        expect(rootReducer(undefined, hiSlice.actions.setWaves(5))).toEqual({
          form: {
            name: '',
            surname: '',
            middlename: '',
          },
          hi: {
            greeting: '',
            waves: 5,
          },
          auth: {
            idToken: '',
            userId: '',
          },
        });
      });
      it('resets hi', () => {
        expect(
          rootReducer(
            {
              form: {
                name: 'John',
                surname: 'Doe',
                middlename: 'Wayne',
              },
              hi: {
                greeting: 'Kaydo!',
                waves: 5,
              },
              auth: {
                idToken: 'a random token',
                userId: 'a user id',
              },
            },
            hiSlice.actions.resetHi(),
          ),
        ).toEqual({
          form: {
            name: 'John',
            surname: 'Doe',
            middlename: 'Wayne',
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
    });
    describe('Actions in formSlice', () => {
      it('sets name in form', () => {
        expect(
          rootReducer(undefined, formSlice.actions.setName('John')),
        ).toEqual({
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
        expect(
          rootReducer(undefined, formSlice.actions.setSurname('Wayne')),
        ).toEqual({
          form: {
            name: '',
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
      it('sets name in form', () => {
        expect(
          rootReducer(undefined, formSlice.actions.setMiddlename('Doe')),
        ).toEqual({
          form: {
            name: '',
            surname: '',
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
        expect(
          rootReducer(
            {
              form: {
                name: 'John',
                surname: 'Wayne',
                middlename: 'Doe',
              },
              hi: {
                greeting: `S'up`,
                waves: 5,
              },
              auth: {
                idToken: 'a random token',
                userId: 'a user id',
              },
            },
            formSlice.actions.resetForm(),
          ),
        ).toEqual({
          form: {
            name: '',
            surname: '',
            middlename: '',
          },
          hi: {
            greeting: `S'up`,
            waves: 5,
          },
          auth: {
            idToken: 'a random token',
            userId: 'a user id',
          },
        });
      });
    });
    describe('Actions in authSlice', () => {
      it('sets userId and idToken in auth', () => {
        expect(
          rootReducer(
            undefined,
            authSlice.actions.authLogin({
              idToken: 'a random token',
              userId: 'a user id',
            }),
          ),
        ).toEqual({
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
        expect(
          rootReducer(
            {
              form: {
                name: 'John',
                surname: 'Wayne',
                middlename: 'Doe',
              },
              hi: {
                greeting: 'Kaydo!',
                waves: 5,
              },
              auth: {
                idToken: 'a random token',
                userId: 'a user id',
              },
            },
            authSlice.actions.authLogout(),
          ),
        ).toEqual({
          form: {
            name: 'John',
            surname: 'Wayne',
            middlename: 'Doe',
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
    });
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
  describe('Selectors work as expected', () => {
    describe('Selectors in formSlice', () => {
      it('selects form', () => {
        store.dispatch(formSlice.actions.setName('John'));
        store.dispatch(formSlice.actions.setSurname('Wayne'));
        store.dispatch(formSlice.actions.setMiddlename('Doe'));
        expect(formSlice.selectors.getSlice(store.getState())).toEqual({
          name: 'John',
          surname: 'Wayne',
          middlename: 'Doe',
        });
      });
      it('selects name in form', () => {
        expect(formSlice.selectors.name(store.getState())).toEqual('John');
      });
      it('selects surname in form', () => {
        expect(formSlice.selectors.surname(store.getState())).toEqual('Wayne');
      });
      it('selects middlename in form', () => {
        expect(formSlice.selectors.middlename(store.getState())).toEqual('Doe');
      });
    });

    describe('Selectors in hiSlice', () => {
      it('selects hi', () => {
        store.dispatch(hiSlice.actions.setWaves(5));
        store.dispatch(hiSlice.actions.setGreeting('Kaydo!'));
        expect(hiSlice.selectors.getSlice(store.getState())).toEqual({
          greeting: 'Kaydo!',
          waves: 5,
        });
      });
      it('selects greeting in hi', () => {
        expect(hiSlice.selectors.greeting(store.getState())).toEqual('Kaydo!');
      });
      it('selects waves in hi', () => {
        expect(hiSlice.selectors.waves(store.getState())).toEqual(5);
      });
    });
    describe('Selectors in authSlice', () => {
      it('selects auth', () => {
        store.dispatch(
          authSlice.actions.authLogin({
            idToken: 'a random token',
            userId: 'a user id',
          }),
        );
        expect(authSlice.selectors.getSlice(store.getState())).toEqual({
          idToken: 'a random token',
          userId: 'a user id',
        });
      });
      it('selects idToken in auth', () => {
        expect(authSlice.selectors.idToken(store.getState())).toEqual(
          'a random token',
        );
      });
      it('selects userId in auth', () => {
        expect(authSlice.selectors.userId(store.getState())).toEqual(
          'a user id',
        );
      });
    });
  });
});
