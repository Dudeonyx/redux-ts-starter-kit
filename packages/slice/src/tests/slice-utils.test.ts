import {
  makeActionCreators,
  makeSelectors,
  reMapSelectors,
  makeComputedSelectors,
} from '../slice-utils';

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
      ['setName', 'resetName', 'doNeither',],
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
      const initialState = ['Foo',];
      const state = { list: ['Foo', 'Bar', 'Baz',] };
      const selectors = makeSelectors(initialState, 'list');
      it('only creates a `selectSlice` selector', () => {
        expect(Object.hasOwnProperty.call(selectors, 'selectSlice')).toBe(true);
        expect(Object.hasOwnProperty.call(selectors, 'length')).toBe(false);
        expect(Object.keys(selectors).length).toBe(1);
      });

      it('creates a working `selectSlice` selector', () => {
        expect(selectors.selectSlice(state)).toEqual(['Foo', 'Bar', 'Baz',]);
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
      const state = ['Foo', 'Bar', 'Baz',];
      const selectors = makeSelectors(state, '');
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

describe('makeComputedSelectors *incomplete*', () => {
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

    onlyTheThirdIsUsed: ['', '', 3,],
  };

  let calc0Called = 0;
  let calc1Called = 0;
  let calc2Called = 0;
  let calc3Called = 0;

  const computedSelectors = makeComputedSelectors({
    calc0: (state: typeof testState) => {
      calc0Called++;
      return state.anotherValue * state.a.value.used.in.calculation;
    },
    calc1: (state: typeof testState) => {
      calc1Called++;
      return (state.onlyTheThirdIsUsed[2] as number) * state.anotherValue;
    },
    calc2: (state: typeof testState) => {
      calc2Called++;
      return (
        state.a.value.used.in.calculation *
        (state.onlyTheThirdIsUsed[2] as number)
      );
    },
    calc3: (state: typeof testState) => {
      calc3Called++;
      return (
        state.anotherValue *
        state.a.value.used.in.calculation *
        (state.onlyTheThirdIsUsed[2] as number)
      );
    },
  });
  it('Works (calc0)', () => {
    expect(computedSelectors.calc0(testState)).toEqual(45);
    expect(calc0Called).toBe(1);
    expect(calc1Called).toBe(0);
    expect(calc2Called).toBe(0);
    expect(calc3Called).toBe(0);
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
