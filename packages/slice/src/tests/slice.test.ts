import { createSlice } from '../slice';
import {
  makeActionCreators,
  makeSelectors,
  reMapSelectors,
} from '../slice-utils';
import { combineReducers } from 'redux';

describe('makeActionCreators', () => {
  const actions = makeActionCreators(['setName', 'resetName',]);
  it('creates an object of action creators', () => {
    expect(Object.hasOwnProperty.call(actions, 'setName')).toBe(true);
    expect(Object.hasOwnProperty.call(actions, 'resetName')).toBe(true);
  });

  it('s action creators toString method returns the action type', () => {
    expect(actions.setName.toString()).toEqual('setName');
    expect(actions.resetName.toString()).toEqual('resetName');
  });

  it('s actions creators work as expected', () => {
    expect(actions.setName('Paul')).toEqual({
      type: 'setName',
      payload: 'Paul',
    });
    expect(actions.resetName()).toEqual({
      type: 'resetName',
      payload: undefined,
    });
  });
});

describe('makeSelectors', () => {
  describe('with slice', () => {
    describe('initialState is not an object', () => {
      const initialState = ['Foo',];
      const state = { list: ['Foo', 'Bar', 'Baz',] };
      const selectors = makeSelectors('list', initialState);
      it('only creates a `selectSlice` selector', () => {
        expect(Object.hasOwnProperty.call(selectors, 'selectSlice')).toBe(true);
        expect(Object.hasOwnProperty.call(selectors, 'length')).toBe(false);
        expect(Object.keys(selectors).length).toBe(1);
      });

      it('creates a working `selectSlice` selector', () => {
        expect(selectors.selectSlice(state)).toEqual(['Foo', 'Bar', 'Baz',]);
      });
      it('can be called without giving the initialState', () => {
        const selectors2 = makeSelectors('list');
        expect(Object.hasOwnProperty.call(selectors2, 'selectSlice')).toBe(
          true,
        );
        expect(Object.hasOwnProperty.call(selectors2, 'length')).toBe(false);
        expect(Object.keys(selectors2).length).toBe(1);
        expect(selectors2.selectSlice(state)).toEqual(['Foo', 'Bar', 'Baz',]);
      });
    });
    describe('initialState is an object', () => {
      const initialState = {
        name: '',
        middlename: '',
        surname: '',
      };
      const state = {
        form: {
          name: 'Foo',
          middlename: 'Bar',
          surname: 'Baz',
        },
      };

      const selectors = makeSelectors('form', initialState);

      it('creates a `selectSlice` selector and additional selectors', () => {
        expect(Object.hasOwnProperty.call(selectors, 'selectSlice')).toBe(true);
        expect(Object.hasOwnProperty.call(selectors, 'name')).toBe(true);
        expect(Object.hasOwnProperty.call(selectors, 'middlename')).toBe(true);
        expect(Object.hasOwnProperty.call(selectors, 'surname')).toBe(true);
        expect(Object.hasOwnProperty.call(selectors, 'lastname')).toBe(false);
        expect(Object.keys(selectors).length).toBe(4);
      });

      it('creates working selectors', () => {
        expect(selectors.selectSlice(state)).toEqual({
          name: 'Foo',
          middlename: 'Bar',
          surname: 'Baz',
        });
        expect(selectors.name(state)).toEqual('Foo');
        expect(selectors.middlename(state)).toEqual('Bar');
        expect(selectors.surname(state)).toEqual('Baz');
      });
    });
  });
  describe('without slice', () => {
    describe('state is not an object', () => {
      const state = ['Foo', 'Bar', 'Baz',];
      const selectors = makeSelectors('');
      it('only creates a `selectSlice` selector', () => {
        expect(Object.hasOwnProperty.call(selectors, 'selectSlice')).toBe(true);
        expect(Object.hasOwnProperty.call(selectors, 'length')).toBe(false);
        expect(Object.keys(selectors).length).toBe(1);
      });

      it('creates a working `selectSlice` selector', () => {
        expect(selectors.selectSlice(state)).toEqual(['Foo', 'Bar', 'Baz',]);
      });
    });
    describe('state is an object', () => {
      const state = {
        name: 'Foo',
        middlename: 'Bar',
        surname: 'Baz',
      };

      const selectors = makeSelectors('', state);

      it('creates a `selectSlice` selector and additional selectors', () => {
        expect(Object.hasOwnProperty.call(selectors, 'selectSlice')).toBe(true);
        expect(Object.hasOwnProperty.call(selectors, 'name')).toBe(true);
        expect(Object.hasOwnProperty.call(selectors, 'middlename')).toBe(true);
        expect(Object.hasOwnProperty.call(selectors, 'surname')).toBe(true);
        expect(Object.hasOwnProperty.call(selectors, 'lastname')).toBe(false);
        expect(Object.keys(selectors).length).toBe(4);
      });

      it('creates working selectors', () => {
        expect(selectors.selectSlice(state)).toEqual({
          name: 'Foo',
          middlename: 'Bar',
          surname: 'Baz',
        });
        expect(selectors.name(state)).toEqual('Foo');
        expect(selectors.middlename(state)).toEqual('Bar');
        expect(selectors.surname(state)).toEqual('Baz');
      });
    });
  });
});

describe('ReMapSelectors', () => {
  const initialState = {
    name: '',
    middlename: '',
    surname: '',
  };

  const altState = {
    data: {
      userA: {
        personalDetails: {
          updated: {
            form: {
              name: 'Foo',
              middlename: 'Bar',
              surname: 'Baz',
            },
          },
        },
      },
    },
  };

  const selectors = makeSelectors('form', initialState);

  const reMappedSelectors = reMapSelectors(
    selectors,
    'data',
    'userA',
    'personalDetails',
    'updated',
  );

  it('creates a reMapped `selectSlice` selector and additional selectors', () => {
    expect(Object.hasOwnProperty.call(reMappedSelectors, 'selectSlice')).toBe(
      true,
    );
    expect(Object.hasOwnProperty.call(reMappedSelectors, 'name')).toBe(true);
    expect(Object.hasOwnProperty.call(reMappedSelectors, 'middlename')).toBe(
      true,
    );
    expect(Object.hasOwnProperty.call(reMappedSelectors, 'surname')).toBe(true);
    expect(Object.hasOwnProperty.call(reMappedSelectors, 'lastname')).toBe(
      false,
    );
    expect(Object.keys(reMappedSelectors).length).toBe(4);
  });

  it('creates working reMapped selectors', () => {
    expect(reMappedSelectors.selectSlice(altState)).toEqual({
      name: 'Foo',
      middlename: 'Bar',
      surname: 'Baz',
    });
    expect(reMappedSelectors.name(altState)).toEqual('Foo');
    expect(reMappedSelectors.middlename(altState)).toEqual('Bar');
    expect(reMappedSelectors.surname(altState)).toEqual('Baz');
  });
});

describe('createSlice', () => {
  describe('when slice is empty', () => {
    type State = number;
    interface Actions {
      increment: never;
      multiply: number;
    }
    const { actions, reducer, selectors } = createSlice<Actions, State, ''>({
      cases: {
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

  describe('when passing slice', () => {
    const { actions, reducer, selectors } = createSlice({
      cases: {
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
        type: 'increment',
        payload: undefined,
      });
    });
    it('should have the correct action for multiply', () => {
      expect(actions.multiply(5)).toEqual({
        type: 'multiply',
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
      expect(selectors.hasOwnProperty('selectSlice')).toBe(true);
    });

    it('should return the slice state data', () => {
      expect(selectors.selectSlice({ cool: 2 })).toEqual(2);
    });
  });

  // tslint:disable: no-shadowed-variable
  describe('createSlice selectors when initialState is an object, and reMapSelectors', () => {
    let nameAndSurnameCalled = 0
    let fullNameCalled = 0
    const { selectors, reMapSelectorsTo: reMapSelectors } = createSlice({
      cases: {},
      slice: 'form',
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
        fullName: (state)=> {
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

    const reMappedSelectors = reMapSelectors('users', 'userA', 'details');

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
      expect(reMappedSelectors.fullName(alternateState)).toEqual('John2 Wayne2 Doe2');
      expect(fullNameCalled).toBe(2);
    });
    it('should select the computed nameAndSurname', () => {
      expect(selectors.nameAndSurname(state)).toEqual('John Doe');
      expect(nameAndSurnameCalled).toBe(1);
      expect(reMappedSelectors.nameAndSurname(alternateState)).toEqual('John2 Doe2');
      expect(nameAndSurnameCalled).toBe(2);
    });
    it('should memoize the computed nameAndSurname', () => {
      expect(selectors.nameAndSurname(state)).toEqual('John Doe');
      expect(nameAndSurnameCalled).toBe(2);
      expect(reMappedSelectors.nameAndSurname(alternateState)).toEqual('John2 Doe2');
      expect(nameAndSurnameCalled).toBe(2);
      expect(selectors.nameAndSurname({form: {
        name: 'John',
        surname: 'Doe',
        middlename: 'Wayne has changed',
      }})).toEqual('John Doe');
      expect(nameAndSurnameCalled).toBe(2);
      expect(reMappedSelectors.nameAndSurname({
        users: {
          userA: {
            details: {
              name: 'John2',
              middlename: 'Wayne2 has changed',
              surname: 'Doe2',
            },
          },
        },
      })).toEqual('John2 Doe2');
      expect(nameAndSurnameCalled).toBe(2);
      expect(selectors.nameAndSurname({form: {
        name: 'John',
        surname: 'Doe has changed',
        middlename: 'Wayne has changed',
      }})).toEqual('John Doe has changed');
      expect(nameAndSurnameCalled).toBe(3);
      expect(reMappedSelectors.nameAndSurname({
        users: {
          userA: {
            details: {
              name: 'John2',
              middlename: 'Wayne2 has changed',
              surname: 'Doe2 has changed',
            },
          },
        },
      })).toEqual('John2 Doe2 has changed');
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
});

describe('multiple createSlice slices used to create a redux store', () => {
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

  const hiSlice = createSlice<HiActions, HiSliceState, 'hi'>({
    // interfaces supplied to createSlice
    slice: 'hi', // The key/name of the slice, it is type checked to ensure it is a key in IState
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
    slice: 'form',
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

  const authSlice = createSlice<AuthActions, AuthSliceState, 'auth'>({
    slice: 'auth',
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
        expect(formSlice.selectors.selectSlice(state)).toEqual({
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
        expect(hiSlice.selectors.selectSlice(state)).toEqual({
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
        expect(authSlice.selectors.selectSlice(state)).toEqual({
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
