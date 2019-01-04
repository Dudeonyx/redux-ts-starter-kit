import robodux from '../slice';
import { combineReducers } from 'redux';

describe('robodux', () => {
  describe('when slice is empty', () => {
    type State = number;
    interface Actions {
      increment: never;
      multiply: number;
    }
    const { actions, reducer, selectors } = robodux<State, Actions>({
      actions: {
        increment: (state) => state + 1,
        multiply: (state, payload) => state * payload,
      },
      initialState: 0,
    });

    it('should create increment action', () => {
      expect(actions.hasOwnProperty('increment')).toBe(true);
    });

    it('should create multiply action', () => {
      expect(actions.hasOwnProperty('multiply')).toBe(true);
    });

    it('should have the correct action for increment', () => {
      expect(actions.increment()).toEqual({
        type: 'INCREMENT',
        payload: undefined,
      });
    });

    it('should have the correct action for multiply', () => {
      expect(actions.multiply(3)).toEqual({
        type: 'MULTIPLY',
        payload: 3,
      });
    });

    describe('when using reducer', () => {
      it('should return the correct value from reducer with increment', () => {
        expect(reducer(undefined, actions.increment())).toEqual(1);
      });

      it('should return the correct value from reducer with multiply', () => {
        expect(reducer(2, actions.multiply(3))).toEqual(6);
      });
    });

    describe('when using selectors', () => {
      it('should create selector with correct name', () => {
        expect(selectors.hasOwnProperty('getSlice')).toBe(true);
      });

      it('should return the slice state data', () => {
        expect(selectors.getSlice(2)).toEqual(2);
      });
    });
  });

  describe('when passing slice', () => {
    const { actions, reducer, selectors } = robodux({
      actions: {
        increment: (state) => state + 1,
        multiply: (state: number, payload: number) => state * payload,
      },
      initialState: 0,
      slice: 'cool',
    });

    it('should create increment action', () => {
      expect(actions.hasOwnProperty('increment')).toBe(true);
    });
    it('should create multiply action', () => {
      expect(actions.hasOwnProperty('multiply')).toBe(true);
    });

    it('should have the correct action for increment', () => {
      expect(actions.increment()).toEqual({
        type: 'cool/INCREMENT',
        payload: undefined,
      });
    });
    it('should have the correct action for multiply', () => {
      expect(actions.multiply(5)).toEqual({
        type: 'cool/MULTIPLY',
        payload: 5,
      });
    });

    it('should return the correct value from reducer', () => {
      expect(reducer(undefined, actions.increment())).toEqual(1);
    });
    it('should return the correct value from reducer when multiplying', () => {
      expect(reducer(5, actions.multiply(5))).toEqual(25);
    });

    it('should create selector with correct name', () => {
      expect(selectors.hasOwnProperty('getSlice')).toBe(true);
    });

    it('should return the slice state data', () => {
      expect(selectors.getSlice({ cool: 2 })).toEqual(2);
    });
  });

  describe('robodux when initialState is an object', () => {
    const { selectors } = robodux({
      actions: {
        setName: (state, name: string) => {
          state.name = name;
        },
        setSurname: (state, surname: string) => {
          state.surname = surname;
        },
        setMiddlename: (state, middlename: string) => {
          state.middlename = middlename;
        },
      },
      slice: 'form',
      initialState: {
        name: '',
        surname: '',
        middlename: '',
      },
    });

    const state = {
      form: {
        name: 'John',
        surname: 'Doe',
        middlename: 'Wayne',
      },
    };

    it('should create selector with correct name', () => {
      expect(selectors.hasOwnProperty('getSlice')).toBe(true);
    });
    it('should create sub selector with correct name', () => {
      expect(selectors.hasOwnProperty('name')).toBe(true);
    });
    it('should create sub selector with correct name', () => {
      expect(selectors.hasOwnProperty('surname')).toBe(true);
    });
    it('should create sub selector with correct name', () => {
      expect(selectors.hasOwnProperty('middlename')).toBe(true);
    });

    it('should select the state slice', () => {
      expect(selectors.getSlice(state)).toEqual(state.form);
    });
    it('should select the state slice name field', () => {
      expect(selectors.name(state)).toEqual('John');
    });
    it('should select the state slice surname field', () => {
      expect(selectors.surname(state)).toEqual('Doe');
    });
    it('should select the state slice middlename field', () => {
      expect(selectors.middlename(state)).toEqual('Wayne');
    });
  });

  describe('when mutating state object', () => {
    const { actions, reducer } = robodux({
      actions: {
        setUserName: (state, payload: string) => {
          state.user = payload;
        },
      },
      initialState: { user: '' },
    });

    it('should set the username', () => {
      expect(reducer({ user: 'hi' }, actions.setUserName('eric'))).toEqual({
        user: 'eric',
      });
    });
  });
});

describe('multiple robodux slices used to create a redux store', () => {
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

  const hiSlice = robodux<HiSliceState, Actions, IState>({
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

  const formSlice = robodux({
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
    idToken: string | null;
    userId: string | null;
  }
  type AuthSuccess = { idToken: string | null; userId: string | null };
  interface AuthActions {
    authLogin: AuthSuccess;
    authLogout: never;
  }

  const authInitialState: AuthSliceState = {
    idToken: null,
    userId: null,
  };

  const authSlice = robodux<AuthSliceState, AuthActions, IState>({
    slice: 'auth',
    initialState: authInitialState,
    actions: {
      authLogout: (state) => {
        state.idToken = null;
        state.userId = null;
      },
      authLogin: (state, payload) => {
        state.idToken = payload.idToken;
        state.userId = payload.userId;
      },
    },
  });

  const rootReducer = combineReducers<IState>({
    auth: authSlice.reducer,
    form: formSlice.reducer,
    hi: hiSlice.reducer,
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
        idToken: null,
        userId: null,
      },
    });
  });

  describe('actions are dispatched correctly', () => {
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
            idToken: null,
            userId: null,
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
            idToken: null,
            userId: null,
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
            idToken: null,
            userId: null,
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
            idToken: null,
            userId: null,
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
            idToken: null,
            userId: null,
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
            idToken: null,
            userId: null,
          },
        });
      });
    });
  });
  describe('Selectors work as expected', () => {
    const state = {
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
    };
    describe('Selectors in formSlice', () => {
      it('selects form', () => {
        expect(formSlice.selectors.getSlice(state)).toEqual({
          name: 'John',
          surname: 'Wayne',
          middlename: 'Doe',
        });
      });
      it('selects name in form', () => {
        expect(formSlice.selectors.name(state)).toEqual('John');
      });
      it('selects surname in form', () => {
        expect(formSlice.selectors.surname(state)).toEqual('Wayne');
      });
      it('selects middlename in form', () => {
        expect(formSlice.selectors.middlename(state)).toEqual('Doe');
      });
    });

    describe('Selectors in hiSlice', () => {
      it('selects hi', () => {
        expect(hiSlice.selectors.getSlice(state)).toEqual({
          greeting: 'Kaydo!',
          waves: 5,
        });
      });
      it('selects greeting in hi', () => {
        expect(hiSlice.selectors.greeting(state)).toEqual('Kaydo!');
      });
      it('selects waves in hi', () => {
        expect(hiSlice.selectors.waves(state)).toEqual(5);
      });
    });
    describe('Selectors in authSlice', () => {
      it('selects auth', () => {
        expect(authSlice.selectors.getSlice(state)).toEqual({
          idToken: 'a random token',
          userId: 'a user id',
        });
      });
      it('selects idToken in auth', () => {
        expect(authSlice.selectors.idToken(state)).toEqual('a random token');
      });
      it('selects userId in auth', () => {
        expect(authSlice.selectors.userId(state)).toEqual('a user id');
      });
    });
  });
});
