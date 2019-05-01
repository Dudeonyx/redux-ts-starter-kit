import {
  A,
  makeGetter,
  makeTypeSafeSelector,
  get,
  makeMemoSelector,
} from '../selector';

describe('makeGetter', () => {
  const property = A('property', 'fdf');
  const deepState = {
    some: {
      very: {
        really: {
          deeply: {
            nested: {
              value: 'actual value',
              value1: 1,
            },
          },
        },
      },
    },
    another: {
      deeply: {
        nested: {
          property,
        },
      },
    },
  };

  const deepState2 = {
    another: {
      deeply: {
        nested: {
          property,
        },
      },
    },
  };

  const getter0 = makeGetter(
    'some',
    'very',
    'really',
    'deeply',
    'nested',
    'value',
  );
  const getter1 = makeGetter('another', 'deeply', 'nested', 'property');
  const getter1A = makeTypeSafeSelector(
    'another',
    'deeply',
    'nested',
    'property',
  )<string[]>();
  const getter1B = makeGetter('another', 'deeply', 'nested', 'property', '0');
  const getter1C = makeTypeSafeSelector(
    'another',
    'deeply',
    'nested',
    'property',
    '0',
  )<string>();
  const getter2 = makeGetter(
    'anotherdf',
    'deeplyf',
    'nestefdfdd',
    'propfdferty',
  );
  const getter2B = makeGetter('another', 'deeply', 'nestedd', 'property');
  const getter3 = makeTypeSafeSelector(
    'some',
    'very',
    'really',
    'deeply',
    'nested',
    'value1',
  )<number>();
  let called = 0;
  let called2 = 0;

  it('should memo', () => {
    const memoGetter1A = makeMemoSelector(
      (state: {
        another: {
          deeply: {
            nested: {
              property: string[];
            };
          };
        };
      }) => {
        called++;
        return getter1A(state).length;
      },
    );

    expect(memoGetter1A(deepState2)).toEqual(2);
    expect(called).toBe(1);
    expect(
      memoGetter1A({
        another: {
          deeply: {
            nested: {
              property,
            },
          },
        },
      }),
    ).toEqual(2);
    expect(called).toBe(1);
    expect(
      memoGetter1A({
        another: {
          deeply: {
            nested: {
              property: ['property', 'fdf',],
              otherProperty: 'fdfj',
            },
          },
        },
      } as any),
    ).toEqual(2);
    expect(called).toBe(1);
    expect(
      memoGetter1A({
        another: {
          deeply: {
            nested: {
              property: ['property', 'fdf', 'hello',],
            },
          },
        },
      }),
    ).toEqual(3);
    expect(called).toBe(2);
    expect(
      memoGetter1A({
        another: {
          deeply: {
            nested: {
              property: ['property', 'fdf', 'hello',],
              meToo: 'asWell',
            },
          },
        },
      } as any),
    ).toEqual(3);
    expect(called).toBe(2);
    expect(
      memoGetter1A({
        another: {
          deeply: {
            nested: {
              property: ['prty', 'fd', 'hell',],
              meToo: 'asWellds',
            },
          },
        },
      } as any),
    ).toEqual(3);
    expect(called).toBe(2);
  });

  it('should memo2', () => {
    const deepState3 = {
      some: {
        very: {
          really: {
            deeply: {
              nested: {
                value: 'actual value',
                value1: 1,
                value2: 'irrelevant',
              },
            },
          },
        },
      },
    };
    const memoGetter = makeMemoSelector((state: typeof deepState3) => {
      called2++;
      const nested = state.some.very.really.deeply.nested;
      return nested.value + ' ' + nested.value1;
    });

    expect(memoGetter(deepState3)).toEqual('actual value 1');
    expect(called2).toBe(1);
    expect(
      memoGetter({
        some: {
          very: {
            really: {
              deeply: {
                nested: {
                  value: 'actual value',
                  value1: 1,
                  value2: 'irrelevant',
                },
              },
            },
          },
        },
      }),
    ).toEqual('actual value 1');
    expect(called2).toBe(1);
    expect(
      memoGetter({
        some: {
          very: {
            really: {
              deeply: {
                nested: {
                  value: 'actual value',
                  value1: 1,
                  value2: 'irrelevant and unknown',
                },
              },
            },
          },
        },
      }),
    ).toEqual('actual value 1');
    expect(called2).toBe(1);
    expect(
      memoGetter({
        some: {
          very: {
            really: {
              deeply: {
                nested: {
                  value: 'actual value',
                  value1: 2,
                  value2: 'irrelevant and unknown',
                },
              },
            },
          },
        },
      }),
    ).toEqual('actual value 2');
    expect(called2).toBe(2);
  });

  it('should make working selectors', () => {
    expect(getter0(deepState)).toEqual('actual value');
    expect(getter1(deepState)).toEqual(['property', 'fdf',]);
    expect(getter1A(deepState)).toEqual(['property', 'fdf',]);
    expect(getter1B(deepState)).toEqual('property');
    expect(getter1C(deepState)).toEqual('property');
    expect(getter3(deepState)).toEqual(1);
  });

  it('should not throw but return `undefined` for bad paths', () => {
    expect(getter2(deepState as any)).toEqual(undefined);
  });
  beforeEach(() => {
    console.warn = jest.fn();
  });
  it('should warn for bad paths', () => {
    expect(getter2B(deepState as any)).toEqual(undefined);
    expect(console.warn).toHaveBeenCalled();
    const [message, badPath, paths,] = (console.warn as any).mock.calls[0];
    expect(message).toContain(
      'There is a possible mis-match between the "paths" and "object"',
    );
    expect(badPath).toBe('[\'nestedd\']');
    expect(paths).toBe('[\'another\'][\'deeply\'][\'nestedd\']');
  });
  test('`get` works', () => {
    expect(
      get(deepState, 'some', 'very', 'really', 'deeply', 'nested', 'value1'),
    ).toBe(1);
  });
});
