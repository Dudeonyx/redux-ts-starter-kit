import {
  makeActionCreators,
  makeSelectors,
  reMapSelectors,
  makeComputedSelectors,
  makeReducer,
  makeReMapableSelectors,
} from '../slice-utils';
import { createType } from '../action';

describe('makeActionCreators', () => {
  const actions = makeActionCreators(['setName', 'resetName']);
  it('creates an object of action creators', () => {
    expect(Object.hasOwnProperty.call(actions, 'setName')).toBe(true);
    expect(Object.hasOwnProperty.call(actions, 'resetName')).toBe(true);
  });

  it('s action creators toString method returns the action type', () => {
    expect(actions.setName.toString()).toEqual('setName');
    expect(actions.resetName.toString()).toEqual('resetName');
  });
  it('s action creators `type` prop returns the action type', () => {
    expect(actions.setName.type).toEqual('setName');
    expect(actions.resetName.type).toEqual('resetName');
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
  describe('Action Creator types can be overridden', () => {
    const actionsWithTypeOverride = makeActionCreators(
      ['setName', 'resetName', 'doNeither'],
      { setName: 'set/Name', resetName: 'reset/Name' } as const,
    );
    it('creates an object of action creators', () => {
      expect(
        Object.hasOwnProperty.call(actionsWithTypeOverride, 'setName'),
      ).toBe(true);
      expect(
        Object.hasOwnProperty.call(actionsWithTypeOverride, 'resetName'),
      ).toBe(true);
      expect(
        Object.hasOwnProperty.call(actionsWithTypeOverride, 'doNeither'),
      ).toBe(true);
      expect(Object.keys(actionsWithTypeOverride).length).toBe(3);
    });

    it('s action creators toString method returns the action type', () => {
      expect(actionsWithTypeOverride.setName.toString()).not.toEqual('setName');
      expect(actionsWithTypeOverride.setName.toString()).toEqual('set/Name');
      expect(actionsWithTypeOverride.resetName.toString()).not.toEqual(
        'resetName',
      );
      expect(actionsWithTypeOverride.resetName.toString()).toEqual(
        'reset/Name',
      );
      expect(actionsWithTypeOverride.doNeither.toString()).toEqual('doNeither');
    });
    it('s action creators `type` prop returns the action type', () => {
      expect(actionsWithTypeOverride.setName.type).not.toEqual('setName');
      expect(actionsWithTypeOverride.setName.type).toEqual('set/Name');
      expect(actionsWithTypeOverride.resetName.type).not.toEqual('resetName');
      expect(actionsWithTypeOverride.resetName.type).toEqual('reset/Name');
      expect(actionsWithTypeOverride.doNeither.type).toEqual('doNeither');
    });

    it('s overridded actions creators work as expected', () => {
      expect(actionsWithTypeOverride.setName('Paul')).toEqual({
        type: 'set/Name',
        payload: 'Paul',
      });
      expect(actionsWithTypeOverride.resetName()).toEqual({
        type: 'reset/Name',
        payload: undefined,
      });
      expect(actionsWithTypeOverride.doNeither('doing neither')).toEqual({
        type: 'doNeither',
        payload: 'doing neither',
      });
    });
  });
});
describe('makeSelectors', () => {
  describe('with slice', () => {
    describe('initialState is not an object', () => {
      const initialState = ['Foo'];
      const state = { list: ['Foo', 'Bar', 'Baz'] };
      const selectors = makeSelectors(initialState, 'list');
      it('only creates a `selectSlice` selector', () => {
        expect(Object.hasOwnProperty.call(selectors, 'selectSlice')).toBe(true);
        expect(Object.hasOwnProperty.call(selectors, 'length')).toBe(false);
        expect(Object.keys(selectors).length).toBe(1);
      });

      it('creates a working `selectSlice` selector', () => {
        expect(selectors.selectSlice(state)).toEqual(['Foo', 'Bar', 'Baz']);
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

      const selectors = makeSelectors(initialState, 'form');

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
      const state = ['Foo', 'Bar', 'Baz'];
      const selectors = makeSelectors(state, '');
      it('only creates a `selectSlice` selector', () => {
        expect(Object.hasOwnProperty.call(selectors, 'selectSlice')).toBe(true);
        expect(Object.hasOwnProperty.call(selectors, 'length')).toBe(false);
        expect(Object.keys(selectors).length).toBe(1);
      });

      it('creates a working `selectSlice` selector', () => {
        expect(selectors.selectSlice(state)).toEqual(['Foo', 'Bar', 'Baz']);
      });
    });
    describe('state is an object', () => {
      const state = {
        name: 'Foo',
        middlename: 'Bar',
        surname: 'Baz',
      };

      const selectors = makeSelectors(state, '');

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

describe('makeComputedSelectors *could be more OCD*', () => {
  const testState = {
    a: {
      value: {
        used: {
          in: {
            calculation: 5,
          },
        },
      },
    },
    anotherValue: 9,

    onlyTheThirdIsUsed: ['', '', 3],
  };

  let calc0Called = 0;
  let calc1Called = 0;

  const computedSelectors = makeComputedSelectors({
    calc0: (state: typeof testState) => {
      // eslint-disable-next-line no-plusplus
      calc0Called++;
      return state.anotherValue * state.a.value.used.in.calculation;
    },
    calc1: (state: typeof testState) => {
      // eslint-disable-next-line no-plusplus
      calc1Called++;
      return (state.onlyTheThirdIsUsed[2] as number) * state.anotherValue;
    },
  });
  it('Works (calc0)', () => {
    expect(computedSelectors.calc0(testState)).toEqual(45);
    expect(calc0Called).toBe(1);
    expect(calc1Called).toBe(0);
    expect(
      computedSelectors.calc0({
        a: {
          value: {
            used: {
              in: {
                calculation: 5,
              },
            },
          },
        },
        anotherValue: 9,
        onlyTheThirdIsUsed: [],
      }),
    ).toEqual(45);
    expect(calc0Called).toBe(1);
    expect(
      computedSelectors.calc0({
        a: {
          value: {
            used: {
              in: {
                calculation: 10, // changed
              },
            },
          },
        },
        anotherValue: 9,
        onlyTheThirdIsUsed: [],
      }),
    ).toEqual(90);
    expect(calc0Called).toBe(2);
  });

  it('should work (calc1)', () => {
    expect(computedSelectors.calc1(testState)).toEqual(27);
    expect(calc1Called).toBe(1);
    expect(
      computedSelectors.calc1({
        a: {
          value: {
            used: {
              in: {
                calculation: 5,
              },
            },
          },
        },
        anotherValue: 9,

        onlyTheThirdIsUsed: ['', '', 3],
      }),
    ).toEqual(27);
    expect(calc1Called).toBe(1);
    expect(
      computedSelectors.calc1({
        a: {
          value: {
            used: {
              in: {
                calculation: 20, // changed
              },
            },
          },
        },
        anotherValue: 9,

        onlyTheThirdIsUsed: ['', '', 3],
      }),
    ).toEqual(27);
    expect(calc1Called).toBe(1);
    expect(
      computedSelectors.calc1({
        a: {
          value: {
            used: {
              in: {
                calculation: 20,
              },
            },
          },
        },
        anotherValue: 10, // changed

        onlyTheThirdIsUsed: ['', '', 3],
      }),
    ).toEqual(30);
    expect(calc1Called).toBe(2);
    expect(
      computedSelectors.calc1({
        a: {
          value: {
            used: {
              in: {
                calculation: 20,
              },
            },
          },
        },
        anotherValue: 10, // changed

        onlyTheThirdIsUsed: [5, '0', 3], // no relevant change
      }),
    ).toEqual(30);
    expect(calc1Called).toBe(2);
    expect(
      computedSelectors.calc1({
        a: {
          value: {
            used: {
              in: {
                calculation: 20,
              },
            },
          },
        },
        anotherValue: 10, // changed

        onlyTheThirdIsUsed: [5, '0', 4], // relevant change
      }),
    ).toEqual(40);
    expect(calc1Called).toBe(3);
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

  const selectors = makeSelectors(initialState, 'form');
  const selectors1 = makeSelectors(initialState);

  const reMappedSelectors = reMapSelectors(
    selectors,
    'data',
    'userA',
    'personalDetails',
    'updated',
  );
  const reMappedSelectors1 = reMapSelectors(
    selectors1,
    'data',
    'userA',
    'personalDetails',
    'updated',
    'form',
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
    expect(Object.hasOwnProperty.call(reMappedSelectors1, 'selectSlice')).toBe(
      true,
    );
    expect(Object.hasOwnProperty.call(reMappedSelectors1, 'name')).toBe(true);
    expect(Object.hasOwnProperty.call(reMappedSelectors1, 'middlename')).toBe(
      true,
    );
    expect(Object.hasOwnProperty.call(reMappedSelectors1, 'surname')).toBe(
      true,
    );
    expect(Object.hasOwnProperty.call(reMappedSelectors1, 'lastname')).toBe(
      false,
    );
    expect(Object.keys(reMappedSelectors1).length).toBe(4);
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
    expect(reMappedSelectors1.selectSlice(altState)).toEqual({
      name: 'Foo',
      middlename: 'Bar',
      surname: 'Baz',
    });
    expect(reMappedSelectors1.name(altState)).toEqual('Foo');
    expect(reMappedSelectors1.middlename(altState)).toEqual('Bar');
    expect(reMappedSelectors1.surname(altState)).toEqual('Baz');
  });
});

describe('makeReMappableSelectors', () => {
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

  let computedNameAndMiddleNameCalled = 0;
  let computedNameAndMiddleNameCalled1 = 0;

  const selectors = makeSelectors(initialState, 'form');
  const computedSelectors = {
    nameAndMiddleName: (state: { form: typeof initialState }) => {
      // eslint-disable-next-line no-plusplus
      computedNameAndMiddleNameCalled++;
      return `${state.form.name} ${state.form.middlename}`;
    },
    fullName(state: { form: typeof initialState }) {
      return `${this.nameAndMiddleName(state)} ${state.form.surname}`;
    },
  };
  const selectors1 = makeSelectors(initialState);
  const computedSelectors1 = {
    nameAndMiddleName: (state: typeof initialState) => {
      // eslint-disable-next-line no-plusplus
      computedNameAndMiddleNameCalled1++;
      return `${state.name} ${state.middlename}`;
    },
    fullName(state: typeof initialState) {
      return `${this.nameAndMiddleName(state)} ${state.surname}`;
    },
  };
  const mapTo = makeReMapableSelectors(selectors, computedSelectors);
  const mapTo1 = makeReMapableSelectors(selectors1, computedSelectors1);
  const mapTo2 = makeReMapableSelectors(selectors1);

  it('should create a working mapTo utility', () => {
    const reMapped = mapTo('data', 'userA', 'personalDetails', 'updated');
    const reMapped1 = mapTo1(
      'data',
      'userA',
      'personalDetails',
      'updated',
      'form',
    );
    const reMapped2 = mapTo2(
      'data',
      'userA',
      'personalDetails',
      'updated',
      'form',
    );
    expect(reMapped.selectSlice(altState)).toEqual({
      name: 'Foo',
      middlename: 'Bar',
      surname: 'Baz',
    });
    expect(reMapped.name(altState)).toEqual('Foo');
    expect(reMapped.middlename(altState)).toEqual('Bar');
    expect(reMapped.surname(altState)).toEqual('Baz');
    expect(reMapped.nameAndMiddleName(altState)).toEqual('Foo Bar');
    expect(computedNameAndMiddleNameCalled).toBe(1);
    expect(reMapped.fullName(altState)).toEqual('Foo Bar Baz');
    expect(computedNameAndMiddleNameCalled).toBe(1);
    expect(
      reMapped.fullName({
        data: {
          userA: {
            personalDetails: {
              updated: {
                form: {
                  name: 'Foo',
                  middlename: 'Bar',
                  surname: 'Bazzy', // changed
                },
              },
            },
          },
        },
      }),
    ).toEqual('Foo Bar Bazzy');
    expect(computedNameAndMiddleNameCalled).toBe(1);
    expect(reMapped1.selectSlice(altState)).toEqual({
      name: 'Foo',
      middlename: 'Bar',
      surname: 'Baz',
    });
    expect(reMapped1.name(altState)).toEqual('Foo');
    expect(reMapped1.middlename(altState)).toEqual('Bar');
    expect(reMapped1.surname(altState)).toEqual('Baz');
    expect(reMapped1.nameAndMiddleName(altState)).toEqual('Foo Bar');
    expect(computedNameAndMiddleNameCalled1).toBe(1);
    expect(reMapped1.fullName(altState)).toEqual('Foo Bar Baz');
    expect(computedNameAndMiddleNameCalled1).toBe(1);
    expect(
      reMapped1.fullName({
        data: {
          userA: {
            personalDetails: {
              updated: {
                form: {
                  name: 'Foo',
                  middlename: 'Bar',
                  surname: 'Bazzy', // changed
                },
              },
            },
          },
        },
      }),
    ).toEqual('Foo Bar Bazzy');
    expect(computedNameAndMiddleNameCalled1).toBe(1);

    expect(reMapped2.selectSlice(altState)).toEqual({
      name: 'Foo',
      middlename: 'Bar',
      surname: 'Baz',
    });
    expect(reMapped2.name(altState)).toEqual('Foo');
    expect(reMapped2.middlename(altState)).toEqual('Bar');
    expect(reMapped2.surname(altState)).toEqual('Baz');
  });
});

describe('makeReducer', () => {
  const cases = {
    increaseBy: (state: number, payload: number) => state + payload,
    increase: (state: number) => state + 1,
    decreaseBy: (state: number, payload: number) => state - payload,
    decrease: (state: number) => state - 1,
    reset: () => 0,
  };
  const typeOverrides = {
    increase: 'counter/increase' as const,
    decreaseBy: createType('counter/decreaseBy'),
    reset: createType('RESET'),
  };
  describe('with typeOverrides', () => {
    const reducer = makeReducer(0, cases, typeOverrides, '');
    it('should respond to both overidden and non-overriden types', () => {
      expect(
        reducer(undefined, {
          type: 'counter/increase',
        }),
      ).toEqual(1);
      expect(
        reducer(2, {
          type: 'increaseBy',
          payload: 5,
        }),
      ).toEqual(7);
      expect(reducer(10, { type: 'decrease' })).toEqual(9);
      expect(
        reducer(10, {
          type: 'counter/decreaseBy',
          payload: 5,
        }),
      ).toEqual(5);
      expect(reducer(10, { type: 'RESET' })).toEqual(0);
    });
  });
  describe('without typeOverrides', () => {
    const reducer = makeReducer(0, cases);
    it('should work as expected with default types', () => {
      expect(
        reducer(undefined, {
          type: 'increase',
        }),
      ).toEqual(1);
      expect(
        reducer(2, {
          type: 'increaseBy',
          payload: 5,
        }),
      ).toEqual(7);
      expect(reducer(10, { type: 'decrease' })).toEqual(9);
      expect(
        reducer(10, {
          type: 'decreaseBy',
          payload: 5,
        }),
      ).toEqual(5);
      expect(reducer(10, { type: 'reset' })).toEqual(0);
    });
  });
});
