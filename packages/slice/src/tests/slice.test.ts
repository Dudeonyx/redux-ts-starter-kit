import { createSlice } from '../slice';
import { makeActionCreators, makeSelectors } from '../slice-utils';
import { combineReducers } from 'redux';
import { PayloadAction } from '../types';

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
      slice: '',
      payload: 'Paul',
    });
    expect(actions.resetName()).toEqual({
      type: 'resetName',
      slice: '',
      payload: undefined,
    });
  });
});

describe('makeSelectors', () => {
  describe('with slice', () => {
    describe('initialState is not an object', () => {
      const initialState = ['Foo',];
      const testState = { list: ['Foo', 'Bar', 'Baz',] };
      const selectors = makeSelectors('list', initialState);
      it('only creates a `getSlice` selector', () => {
        expect(Object.hasOwnProperty.call(selectors, 'getSlice')).toBe(true);
        expect(Object.hasOwnProperty.call(selectors, 'length')).toBe(false);
        expect(Object.keys(selectors).length).toBe(1);
      });

      it('creates a working `getSlice` selector', () => {
        expect(selectors.getSlice(testState)).toEqual(['Foo', 'Bar', 'Baz',]);
      });
      it('can be called without giving the initialState', () => {
        const selectors2 = makeSelectors('list');
        expect(Object.hasOwnProperty.call(selectors2, 'getSlice')).toBe(true);
        expect(Object.hasOwnProperty.call(selectors2, 'length')).toBe(false);
        expect(Object.keys(selectors2).length).toBe(1);
        expect(selectors2.getSlice(testState)).toEqual(['Foo', 'Bar', 'Baz',]);
      });
    });
    describe('initialState is an object', () => {
      const initialState = {
        name: '',
        middlename: '',
        surname: '',
      };
      const testState = {
        form: {
          name: 'Foo',
          middlename: 'Bar',
          surname: 'Baz',
        },
      };

      const selectors = makeSelectors('form', initialState);

      it('creates a `getSlice` selector and additional selectors', () => {
        expect(Object.hasOwnProperty.call(selectors, 'getSlice')).toBe(true);
        expect(Object.hasOwnProperty.call(selectors, 'name')).toBe(true);
        expect(Object.hasOwnProperty.call(selectors, 'middlename')).toBe(true);
        expect(Object.hasOwnProperty.call(selectors, 'surname')).toBe(true);
        expect(Object.hasOwnProperty.call(selectors, 'lastname')).toBe(false);
        expect(Object.keys(selectors).length).toBe(4);
      });

      it('creates working selectors', () => {
        expect(selectors.getSlice(testState)).toEqual({
          name: 'Foo',
          middlename: 'Bar',
          surname: 'Baz',
        });
        expect(selectors.name(testState)).toEqual('Foo');
        expect(selectors.middlename(testState)).toEqual('Bar');
        expect(selectors.surname(testState)).toEqual('Baz');
      });
    });
    describe('initialState is an object with nesting', () => {
      const initialState = {
        name: '',
        middlename: '',
        surname: '',
      };
      const testState = {
        form: {
          name: 'Foo',
          middlename: 'Bar',
          surname: 'Baz',
        },
      };

      const selectors = makeSelectors('form', initialState);

      it('creates a `getSlice` selector and additional selectors', () => {
        expect(Object.hasOwnProperty.call(selectors, 'getSlice')).toBe(true);
        expect(Object.hasOwnProperty.call(selectors, 'name')).toBe(true);
        expect(Object.hasOwnProperty.call(selectors, 'middlename')).toBe(true);
        expect(Object.hasOwnProperty.call(selectors, 'surname')).toBe(true);
        expect(Object.hasOwnProperty.call(selectors, 'lastname')).toBe(false);
        expect(Object.keys(selectors).length).toBe(4);
      });

      it('creates working selectors', () => {
        expect(selectors.getSlice(testState)).toEqual({
          name: 'Foo',
          middlename: 'Bar',
          surname: 'Baz',
        });
        expect(selectors.name(testState)).toEqual('Foo');
        expect(selectors.middlename(testState)).toEqual('Bar');
        expect(selectors.surname(testState)).toEqual('Baz');
      });
    });
  });
  describe('state is an object', () => {
    const testState = {
      name: 'Foo',
      middlename: 'Bar',
      surname: 'Baz',
      sizes: {
        bust: 1,
        hips: 2,
        waist: 3,
      },
    };

    const selectors = makeSelectors('', testState);

    it('creates a `getSlice` selector and additional selectors and nested selectors', () => {
      expect(Object.hasOwnProperty.call(selectors, 'getSlice')).toBe(true);
      expect(Object.hasOwnProperty.call(selectors, 'name')).toBe(true);
      expect(Object.hasOwnProperty.call(selectors, 'middlename')).toBe(true);
      expect(Object.hasOwnProperty.call(selectors, 'surname')).toBe(true);
      expect(Object.hasOwnProperty.call(selectors, 'sizes')).toBe(true);
      expect(typeof selectors.sizes === 'object').toBe(true);
      expect(Object.hasOwnProperty.call(selectors.sizes, 'getSlice')).toBe(
        true,
      );
      expect(Object.hasOwnProperty.call(selectors.sizes, 'bust')).toBe(true);
      expect(Object.hasOwnProperty.call(selectors.sizes, 'waist')).toBe(true);
      expect(Object.hasOwnProperty.call(selectors.sizes, 'hips')).toBe(true);
      expect(Object.hasOwnProperty.call(selectors, 'lastname')).toBe(false);
      expect(Object.keys(selectors).length).toBe(5);
      expect(Object.keys(selectors.sizes).length).toBe(4);
    });

    it('creates working selectors', () => {
      expect(selectors.getSlice(testState)).toEqual({
        name: 'Foo',
        middlename: 'Bar',
        surname: 'Baz',
        sizes: {
          bust: 1,
          hips: 2,
          waist: 3,
        },
      });
      expect(selectors.name(testState)).toEqual('Foo');
      expect(selectors.middlename(testState)).toEqual('Bar');
      expect(selectors.surname(testState)).toEqual('Baz');
      expect(selectors.sizes.getSlice(testState)).toEqual(testState.sizes);
      expect(selectors.sizes.bust(testState)).toEqual(1);
      expect(selectors.sizes.hips(testState)).toEqual(2);
      expect(selectors.sizes.waist(testState)).toEqual(3);
    });
  });
});

describe('createSlice', () => {
  describe('when slice is empty', () => {
    type State = number;
    interface Actions {
      increment: PayloadAction<never>;
      multiply: PayloadAction<number>;
    }
    const { actions, reducer, selectors } = createSlice<Actions, State, ''>({
      cases: {
        increment: (state) => state + 1,
        multiply: (state, action) => state * action.payload,
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
        slice: '',
        payload: undefined,
      });
    });

    it('should have the correct action for multiply', () => {
      expect(actions.multiply(3)).toEqual({
        type: 'multiply',
        slice: '',
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
        slice: 'cool',
        payload: undefined,
      });
    });
    it('should have the correct action for multiply', () => {
      expect(actions.multiply(5)).toEqual({
        type: 'multiply',
        slice: 'cool',
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

  describe('createSlice selectors when initialState is an object', () => {
    const { selectors } = createSlice({
      cases: {
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

    const testState = {
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
      expect(selectors.getSlice(testState)).toEqual(testState.form);
    });
    it('should select the state slice name field', () => {
      expect(selectors.name(testState)).toEqual('John');
    });
    it('should select the state slice surname field', () => {
      expect(selectors.surname(testState)).toEqual('Doe');
    });
    it('should select the state slice middlename field', () => {
      expect(selectors.middlename(testState)).toEqual('Wayne');
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
      expect(reducer(undefined, actions.setUserName('eric'))).toEqual({
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
      resetHi: () => {
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
      setName: (state, name: string) => {
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
        } as IState);
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
        } as IState);
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
        } as IState);
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
        } as IState);
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
        } as IState);
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
        } as IState);
      });
    });
  });
  describe('Selectors work as expected', () => {
    const testState = {
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
        expect(formSlice.selectors.getSlice(testState)).toEqual({
          name: 'John',
          surname: 'Wayne',
          middlename: 'Doe',
        });
      });
      it('selects name in form', () => {
        expect(formSlice.selectors.name(testState)).toEqual('John');
      });
      it('selects surname in form', () => {
        expect(formSlice.selectors.surname(testState)).toEqual('Wayne');
      });
      it('selects middlename in form', () => {
        expect(formSlice.selectors.middlename(testState)).toEqual('Doe');
      });
    });

    describe('Selectors in hiSlice', () => {
      it('selects hi', () => {
        expect(hiSlice.selectors.getSlice(testState)).toEqual({
          greeting: 'Kaydo!',
          waves: 5,
        });
      });
      it('selects greeting in hi', () => {
        expect(hiSlice.selectors.greeting(testState)).toEqual('Kaydo!');
      });
      it('selects waves in hi', () => {
        expect(hiSlice.selectors.waves(testState)).toEqual(5);
      });
    });
    describe('Selectors in authSlice', () => {
      it('selects auth', () => {
        expect(authSlice.selectors.getSlice(testState)).toEqual({
          idToken: 'a random token',
          userId: 'a user id',
        });
      });
      it('selects idToken in auth', () => {
        expect(authSlice.selectors.idToken(testState)).toEqual(
          'a random token',
        );
      });
      it('selects userId in auth', () => {
        expect(authSlice.selectors.userId(testState)).toEqual('a user id');
      });
    });
  });
});

describe('createSlice creates a working sliceReducer', () => {
  interface IState {
    // The interface of the combined state
    hi: HiSliceState;
    hi_SP: HiSliceState_SP;
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
      resetHi: () => {
        return hiInitialState;
      },
    },
    initialState: hiInitialState,
  });
  // tslint:disable-next-line: class-name
  interface HiSliceState_SP {
    // The interface of the state slice the reducer will manage
    greeting: string;
    waves: number;
  }
  // tslint:disable-next-line: class-name
  interface HiActions_SP {
    // The interface used to type the actions
    setWaves: number; // payload is number
    setGreeting: string; //  payload is string
    resetHi: never; // never indicates no payload expected
  }

  const hiInitialState_SP: HiSliceState_SP = {
    // The initial State
    greeting: '',
    waves: 0,
  };

  const hiSlice_SP = createSlice<HiActions_SP, HiSliceState_SP, 'hi_SP'>({
    // interfaces supplied to createSlice
    slice: 'hi_SP', // The key/name of the slice, it is type checked to ensure it is a key in IState
    cases: {
      setWaves: (state, payload) => {
        state.waves = payload;
      },
      setGreeting: (state, payload) => {
        state.greeting = payload;
      },
      resetHi: () => {
        return hiInitialState_SP;
      },
    },
    initialState: hiInitialState_SP,
  });

  const reducer = combineReducers<IState>({
    hi: hiSlice.reducer,
    hi_SP: hiSlice_SP.sliceReducer,
  });
  it('The SliceReducer initialises the state', () => {
    expect(hiSlice_SP.reducer(undefined, { type: 'dfdfdf' })).toEqual({
      waves: 0,
      greeting: '',
    } as HiSliceState_SP);
  });
  it('The SliceReducer ignores actions with matching type but without matching `slice` property', () => {
    expect(
      hiSlice_SP.sliceReducer(undefined, hiSlice.actions.setGreeting(
        'hello',
      ) as any),
    ).toEqual({
      waves: 0,
      greeting: '',
    } as HiSliceState_SP);
    expect(
      hiSlice_SP.sliceReducer(undefined, { type: 'setWaves', payload: 5 }),
    ).toEqual({
      waves: 0,
      greeting: '',
    } as HiSliceState_SP);
  });
  it('The SliceReducer accepts actions with matching type and matching `slice` property', () => {
    expect(
      hiSlice_SP.sliceReducer(
        undefined,
        hiSlice_SP.actions.setGreeting('hello'),
      ),
    ).toEqual({
      waves: 0,
      greeting: 'hello',
    } as HiSliceState_SP);
    expect(
      hiSlice_SP.sliceReducer(undefined, {
        type: 'setWaves',
        slice: 'hi_SP',
        payload: 5,
      }),
    ).toEqual({
      waves: 5,
      greeting: '',
    } as HiSliceState_SP);
  });
  it('The normal reducer accepts actions with matching type with or without matching `slice` property', () => {
    expect(
      hiSlice_SP.reducer(undefined, hiSlice.actions.setGreeting('hello')),
    ).toEqual({
      waves: 0,
      greeting: 'hello',
    } as HiSliceState_SP);
    expect(
      hiSlice_SP.reducer(undefined, {
        type: 'setWaves',
        slice: '',
        payload: 5,
      }),
    ).toEqual({
      waves: 5,
      greeting: '',
    } as HiSliceState_SP);
    expect(
      hiSlice_SP.reducer(undefined, hiSlice_SP.actions.setGreeting('hello')),
    ).toEqual({
      waves: 0,
      greeting: 'hello',
    } as HiSliceState_SP);
    expect(
      hiSlice_SP.reducer(undefined, {
        type: 'setWaves',
        slice: 'hi_SP',
        payload: 5,
      }),
    ).toEqual({
      waves: 5,
      greeting: '',
    } as HiSliceState_SP);
  });
  it('The combined reducer works as expected', () => {
    expect(reducer(undefined, { type: 'setWaves', payload: 5 })).toEqual({
      hi: {
        waves: 5,
        greeting: '',
      },
      hi_SP: {
        waves: 0,
        greeting: '',
      },
    } as IState);
    expect(
      reducer(undefined, { type: 'setWaves', slice: 'hi', payload: 12 }),
    ).toEqual({
      hi: {
        waves: 12,
        greeting: '',
      },
      hi_SP: {
        waves: 0,
        greeting: '',
      },
    } as IState);
    expect(
      reducer(undefined, { type: 'setWaves', slice: 'hi_SP', payload: 7 }),
    ).toEqual({
      hi: {
        waves: 7,
        greeting: '',
      },
      hi_SP: {
        waves: 7,
        greeting: '',
      },
    } as IState);
  });
});
