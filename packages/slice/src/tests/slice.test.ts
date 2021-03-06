import { createSlice } from '../slice';
import { combineReducers } from 'redux';
import { createType } from '../action';

describe('createSlice', () => {
  describe('General useage', () => {
    type State = number;
    interface Actions {
      increment: never;
      multiply: number;
    }
    const { actions, reducer, mapSelectorsTo } = createSlice<
      Actions,
      State,
      {},
      {}
    >({
      cases: {
        increment: (state) => state + 1,
        multiply: (state, payload) => state * payload,
      },
      initialState: 0,
    });
    const selectors = mapSelectorsTo();
    it('should create increment action', () => {
      expect(actions.hasOwnProperty('increment')).toBe(true);
    });

    it('should create multiply action', () => {
      expect(actions.hasOwnProperty('multiply')).toBe(true);
    });

    it('should have the correct action for increment', () => {
      expect(actions.increment()).toEqual({
        type: 'increment',
        payload: undefined,
      });
    });

    it('should have the correct action for multiply', () => {
      expect(actions.multiply(3)).toEqual({
        type: 'multiply',
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
        expect(selectors.hasOwnProperty('selectSlice')).toBe(true);
      });

      it('should return the slice state data', () => {
        expect(selectors.selectSlice(2)).toEqual(2);
      });
    });
  });

  // tslint:disable: no-shadowed-variable
  describe('createSlice mapSelectorsTo when initialState is an object, and reMapSelectors', () => {
    let nameAndSurnameCalled = 0;
    let fullNameCalled = 0;
    const { mapSelectorsTo } = createSlice({
      cases: {},
      initialState: {
        name: '',
        surname: '',
        middlename: '',
      },
      computed: {
        nameAndSurname: (state) => {
          nameAndSurnameCalled++;
          return state.name + ' ' + state.surname;
        },
        fullName: (state) => {
          fullNameCalled++;
          return state.name + ' ' + state.middlename + ' ' + state.surname;
        },
      },
    });

    const state = {
      form: {
        name: 'John',
        middlename: 'Wayne',
        surname: 'Doe',
      },
    };
    const alternateState = {
      users: {
        userA: {
          details: {
            name: 'John2',
            middlename: 'Wayne2',
            surname: 'Doe2',
          },
        },
      },
    };
    const selectors = mapSelectorsTo('form');
    const reMappedSelectors = mapSelectorsTo('users', 'userA', 'details');

    it('should create selector with correct name', () => {
      expect(selectors.hasOwnProperty('selectSlice')).toBe(true);
      expect(reMappedSelectors.hasOwnProperty('selectSlice')).toBe(true);
    });
    it('should create sub selector with correct name', () => {
      expect(selectors.hasOwnProperty('name')).toBe(true);
      expect(reMappedSelectors.hasOwnProperty('name')).toBe(true);
    });
    it('should create sub selector with correct name', () => {
      expect(selectors.hasOwnProperty('surname')).toBe(true);
      expect(reMappedSelectors.hasOwnProperty('surname')).toBe(true);
    });
    it('should create sub selector with correct name', () => {
      expect(selectors.hasOwnProperty('middlename')).toBe(true);
      expect(reMappedSelectors.hasOwnProperty('middlename')).toBe(true);
    });
    it('should create computed selector with correct name', () => {
      expect(selectors.hasOwnProperty('fullName')).toBe(true);
      expect(selectors.hasOwnProperty('nameAndSurname')).toBe(true);
      expect(reMappedSelectors.hasOwnProperty('fullName')).toBe(true);
      expect(reMappedSelectors.hasOwnProperty('nameAndSurname')).toBe(true);
    });

    it('should select the state slice', () => {
      expect(selectors.selectSlice(state)).toEqual({
        name: 'John',
        surname: 'Doe',
        middlename: 'Wayne',
      });
      expect(reMappedSelectors.selectSlice(alternateState)).toEqual({
        name: 'John2',
        surname: 'Doe2',
        middlename: 'Wayne2',
      });
    });
    it('should select the state slice name field', () => {
      expect(selectors.name(state)).toEqual('John');
      expect(reMappedSelectors.name(alternateState)).toEqual('John2');
    });
    it('should select the state slice surname field', () => {
      expect(selectors.surname(state)).toEqual('Doe');
      expect(reMappedSelectors.surname(alternateState)).toEqual('Doe2');
    });
    it('should select the state slice middlename field', () => {
      expect(selectors.middlename(state)).toEqual('Wayne');
      expect(reMappedSelectors.middlename(alternateState)).toEqual('Wayne2');
    });
    it('should select the computed fullName', () => {
      expect(selectors.fullName(state)).toEqual('John Wayne Doe');
      expect(fullNameCalled).toBe(1);
      expect(reMappedSelectors.fullName(alternateState)).toEqual(
        'John2 Wayne2 Doe2',
      );
      expect(fullNameCalled).toBe(2);
    });
    it('should select the computed nameAndSurname', () => {
      expect(selectors.nameAndSurname(state)).toEqual('John Doe');
      expect(nameAndSurnameCalled).toBe(1);
      expect(reMappedSelectors.nameAndSurname(alternateState)).toEqual(
        'John2 Doe2',
      );
      expect(nameAndSurnameCalled).toBe(2);
    });
    it('should memoize the computed nameAndSurname', () => {
      expect(selectors.nameAndSurname(state)).toEqual('John Doe');
      expect(nameAndSurnameCalled).toBe(2);
      expect(reMappedSelectors.nameAndSurname(alternateState)).toEqual(
        'John2 Doe2',
      );
      expect(nameAndSurnameCalled).toBe(2);
      expect(
        selectors.nameAndSurname({
          form: {
            name: 'John',
            surname: 'Doe',
            middlename: 'Wayne has changed',
          },
        }),
      ).toEqual('John Doe');
      expect(nameAndSurnameCalled).toBe(2);
      expect(
        reMappedSelectors.nameAndSurname({
          users: {
            userA: {
              details: {
                name: 'John2',
                middlename: 'Wayne2 has changed',
                surname: 'Doe2',
              },
            },
          },
        }),
      ).toEqual('John2 Doe2');
      expect(nameAndSurnameCalled).toBe(2);
      expect(
        selectors.nameAndSurname({
          form: {
            name: 'John',
            surname: 'Doe has changed',
            middlename: 'Wayne has changed',
          },
        }),
      ).toEqual('John Doe has changed');
      expect(nameAndSurnameCalled).toBe(3);
      expect(
        reMappedSelectors.nameAndSurname({
          users: {
            userA: {
              details: {
                name: 'John2',
                middlename: 'Wayne2 has changed',
                surname: 'Doe2 has changed',
              },
            },
          },
        }),
      ).toEqual('John2 Doe2 has changed');
      expect(nameAndSurnameCalled).toBe(4);
    });
  });

  describe('when mutating state object', () => {
    const { actions, reducer } = createSlice({
      cases: {
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

  describe('When overridding types', () => {
    const { actions, reducer } = createSlice({
      initialState: 0,
      cases: {
        increaseBy: (state, payload: number) => state + payload,
        increase: (state) => state + 1,
        decreaseBy: (state, payload: number) => state - payload,
        decrease: (state) => state - 1,
        reset: () => 0,
      },
      typeOverrides: {
        increase: 'counter/increase' as const,
        decreaseBy: createType('counter/decreaseBy'),
        reset: createType('RESET'),
      },
    });

    test('should leave unspecified actions types untouched', () => {
      expect(actions.decrease.type).toEqual('decrease');
      expect(actions.increaseBy.type).toEqual('increaseBy');
      expect(actions.decrease()).toEqual({
        type: 'decrease',
        payload: undefined,
      });
      expect(actions.increaseBy(5)).toEqual({ type: 'increaseBy', payload: 5 });
    });

    test('should override specified actions types', () => {
      expect(actions.reset.type).toEqual('RESET');
      expect(actions.increase.type).toEqual('counter/increase');
      expect(actions.decreaseBy.type).toEqual('counter/decreaseBy');
      expect(actions.reset()).toEqual({ type: 'RESET', payload: undefined });
      expect(actions.increase()).toEqual({
        type: 'counter/increase',
        payload: undefined,
      });
      expect(actions.decreaseBy(3)).toEqual({
        type: 'counter/decreaseBy',
        payload: 3,
      });
    });
    it('should respond to non-overridden types in its reducer', () => {
      expect(reducer(11, actions.decrease())).toEqual(10);
      expect(reducer(10, actions.increaseBy(5))).toEqual(15);
    });
    it('should respond to overridden types in its reducer', () => {
      expect(reducer(0, actions.increase())).toEqual(1);
      expect(reducer(10, actions.decreaseBy(5))).toEqual(5);
      expect(reducer(25, actions.reset())).toEqual(0);
    });
  });

  describe('createNameSpacedReducer', () => {
    const { createNameSpace: createNameSpacedReducer, actions } = createSlice({
      initialState: 0,
      cases: {
        increaseBy: (state, payload: number) => state + payload,
        increase: (state) => state + 1,
        decreaseBy: (state, payload: number) => state - payload,
        decrease: (state) => state - 1,
        reset: () => 0,
      },
      typeOverrides: {
        increase: 'counter/increase' as const,
        decreaseBy: createType('counter/decreaseBy'),
        reset: createType('RESET'),
      },
    });
    const counter_A = createNameSpacedReducer('counter_A');
    const counter_B = createNameSpacedReducer('counter_B');

    describe('sliceActions', () => {
      it('should create slice actions', () => {
        expect(counter_A.sliceActions.decrease()).toEqual({
          type: 'decrease',
          payload: undefined,
          slice: 'counter_A',
        });
        expect(counter_B.sliceActions.decrease()).toEqual({
          type: 'decrease',
          payload: undefined,
          slice: 'counter_B',
        });
        expect(counter_A.sliceActions.decreaseBy(3)).toEqual({
          type: 'counter/decreaseBy',
          payload: 3,
          slice: 'counter_A',
        });
        expect(counter_B.sliceActions.decreaseBy(3)).toEqual({
          type: 'counter/decreaseBy',
          payload: 3,
          slice: 'counter_B',
        });
      });
    });

    describe('sliceReducers', () => {
      it('should initialize correctly', () => {
        expect(counter_A.sliceReducer(undefined, { type: '@@init@@' })).toEqual(
          0,
        );
        expect(counter_B.sliceReducer(undefined, { type: '@@init@@' })).toEqual(
          0,
        );
      });
      it('should ignore actions without matching `slice` prop', () => {
        expect(
          counter_A.sliceReducer(undefined, { type: actions.increase.type }),
        ).toEqual(0);
        expect(
          counter_B.sliceReducer(undefined, { type: actions.increase.type }),
        ).toEqual(0);
        expect(
          counter_A.sliceReducer(2, { type: 'increaseBy', payload: 5 }),
        ).toEqual(2);
        expect(
          counter_B.sliceReducer(2, { type: 'increaseBy', payload: 5 }),
        ).toEqual(2);
        expect(
          counter_A.sliceReducer(10, {
            type: 'counter/decreaseBy',
            payload: 5,
            slice: 'counter_B',
          }),
        ).toEqual(10);
        expect(
          counter_B.sliceReducer(10, {
            type: 'counter/decreaseBy',
            payload: 5,
            slice: 'counter_A',
          }),
        ).toEqual(10);
        expect(
          counter_A.sliceReducer(10, { type: 'RESET', slice: 'counter_B' }),
        ).toEqual(10);
        expect(
          counter_B.sliceReducer(10, { type: 'RESET', slice: 'counter_A' }),
        ).toEqual(10);
        expect(
          counter_A.sliceReducer(10, counter_B.sliceActions.decrease()),
        ).toEqual(10);
        expect(
          counter_B.sliceReducer(10, counter_A.sliceActions.decrease()),
        ).toEqual(10);
      });

      it('should respond to actions with a matching slice prop', () => {
        expect(
          counter_A.sliceReducer(undefined, {
            type: actions.increase.type,
            slice: 'counter_A',
          }),
        ).toEqual(1);
        expect(
          counter_B.sliceReducer(undefined, {
            type: actions.increase.type,
            slice: 'counter_B',
          }),
        ).toEqual(1);
        expect(
          counter_A.sliceReducer(2, {
            type: 'increaseBy',
            payload: 5,
            slice: 'counter_A',
          }),
        ).toEqual(7);
        expect(
          counter_B.sliceReducer(2, {
            type: 'increaseBy',
            payload: 5,
            slice: 'counter_B',
          }),
        ).toEqual(7);
        expect(
          counter_A.sliceReducer(10, { type: 'decrease', slice: 'counter_A' }),
        ).toEqual(9);
        expect(
          counter_B.sliceReducer(10, { type: 'decrease', slice: 'counter_B' }),
        ).toEqual(9);
        expect(
          counter_A.sliceReducer(10, {
            type: 'counter/decreaseBy',
            payload: 5,
            slice: 'counter_A',
          }),
        ).toEqual(5);
        expect(
          counter_B.sliceReducer(10, {
            type: 'counter/decreaseBy',
            payload: 5,
            slice: 'counter_B',
          }),
        ).toEqual(5);
        expect(
          counter_A.sliceReducer(10, { type: 'RESET', slice: 'counter_A' }),
        ).toEqual(0);
        expect(
          counter_B.sliceReducer(10, { type: 'RESET', slice: 'counter_B' }),
        ).toEqual(0);
      });
      it('should create action creators that create actions with matching slice prop', () => {
        expect(
          counter_A.sliceReducer(undefined, counter_A.sliceActions.increase()),
        ).toEqual(1);
        expect(
          counter_B.sliceReducer(undefined, counter_B.sliceActions.increase()),
        ).toEqual(1);
        expect(
          counter_A.sliceReducer(2, counter_A.sliceActions.increaseBy(5)),
        ).toEqual(7);
        expect(
          counter_B.sliceReducer(2, counter_B.sliceActions.increaseBy(5)),
        ).toEqual(7);
        expect(
          counter_A.sliceReducer(10, counter_A.sliceActions.decrease()),
        ).toEqual(9);
        expect(
          counter_B.sliceReducer(10, counter_B.sliceActions.decrease()),
        ).toEqual(9);
        expect(
          counter_A.sliceReducer(10, counter_A.sliceActions.decreaseBy(5)),
        ).toEqual(5);
        expect(
          counter_B.sliceReducer(10, counter_B.sliceActions.decreaseBy(5)),
        ).toEqual(5);
        expect(
          counter_A.sliceReducer(10, counter_A.sliceActions.reset()),
        ).toEqual(0);
        expect(
          counter_B.sliceReducer(10, counter_B.sliceActions.reset()),
        ).toEqual(0);
      });
    });
  });
});

describe('multiple createSlice slices combined with `combineReducers`', () => {
  interface IState {
    // The interface of the combined state
    hi: HiSliceState;
    auth: AuthSliceState;
    form: FormState;
  }

  interface HiSliceState {
    // The interface of the state slice the reducer will manage
    greeting: string;
    waves: number;
  }
  interface HiActions {
    // The interface used to type the actions
    setWaves: number; // payload is number
    setGreeting: string; //  payload is string
    resetHi: never; // never indicates no payload expected
  }

  const hiInitialState: HiSliceState = {
    // The initial State
    greeting: '',
    waves: 0,
  };

  const hiSlice = createSlice<HiActions, HiSliceState, {}, {}>({
    cases: {
      setWaves: (state, payload) => {
        state.waves = payload;
      },
      setGreeting: (state, payload) => {
        state.greeting = payload;
      },
      resetHi: (state) => {
        return hiInitialState;
      },
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
    idToken: string | null;
    userId: string | null;
  }
  interface AuthSuccess {
    idToken: string | null;
    userId: string | null;
  }
  interface AuthActions {
    authLogin: AuthSuccess;
    authLogout: never;
  }

  const authInitialState: AuthSliceState = {
    idToken: null,
    userId: null,
  };

  const authSlice = createSlice<AuthActions, AuthSliceState, {}, {}>({
    initialState: authInitialState,
    cases: {
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

  const authSelectors = authSlice.mapSelectorsTo('auth');
  const formSelectors = formSlice.mapSelectorsTo('form');
  const hiSelectors = hiSlice.mapSelectorsTo('hi');

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
        expect(formSelectors.selectSlice(state)).toEqual({
          name: 'John',
          surname: 'Wayne',
          middlename: 'Doe',
        });
      });
      it('selects name in form', () => {
        expect(formSelectors.name(state)).toEqual('John');
      });
      it('selects surname in form', () => {
        expect(formSelectors.surname(state)).toEqual('Wayne');
      });
      it('selects middlename in form', () => {
        expect(formSelectors.middlename(state)).toEqual('Doe');
      });
    });

    describe('Selectors in hiSlice', () => {
      it('selects hi', () => {
        expect(hiSelectors.selectSlice(state)).toEqual({
          greeting: 'Kaydo!',
          waves: 5,
        });
      });
      it('selects greeting in hi', () => {
        expect(hiSelectors.greeting(state)).toEqual('Kaydo!');
      });
      it('selects waves in hi', () => {
        expect(hiSelectors.waves(state)).toEqual(5);
      });
    });
    describe('Selectors in authSlice', () => {
      it('selects auth', () => {
        expect(authSelectors.selectSlice(state)).toEqual({
          idToken: 'a random token',
          userId: 'a user id',
        });
      });
      it('selects idToken in auth', () => {
        expect(authSelectors.idToken(state)).toEqual('a random token');
      });
      it('selects userId in auth', () => {
        expect(authSelectors.userId(state)).toEqual('a user id');
      });
    });
  });
});
