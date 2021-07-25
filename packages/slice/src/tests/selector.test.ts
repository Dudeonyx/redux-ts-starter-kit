/* eslint-disable no-console */
import { makeGetter, makeTypeSafeSelector, get } from '../selector';

describe('makeGetter/makeTypeSafeSelector', () => {
  const property = ['property', 'fdf'] as const;
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
      yoink: 'actual',
    },
    another: {
      yoink: 'actual',
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
  )<typeof property>();
  const getter1B = makeGetter('another', 'deeply', 'nested', 'property', 0);
  const getter1C = makeTypeSafeSelector(
    'another',
    'deeply',
    'nested',
    'property',
    0,
  )<string>();
  const getter1D = makeTypeSafeSelector(
    'another',
    'deeply',
    'nested',
    'property',
    0,
  ).bindToInput<typeof deepState>();
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

  it('should make working selectors', () => {
    expect(getter0(deepState)).toEqual('actual value');
    expect(getter1(deepState)).toEqual(['property', 'fdf']);
    expect(getter1A(deepState)).toEqual(['property', 'fdf']);
    expect(getter1B(deepState)).toEqual('property');
    expect(getter1C(deepState)).toEqual('property');
    expect(getter1D(deepState)).toEqual('property');
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
    expect(console.warn).toHaveBeenCalledTimes(1);
    const [message, badPath, paths] = (console.warn as any).mock.calls[0];
    expect(message).toContain(
      'There is a possible mis-match between the "paths" and "object"',
    );
    expect(badPath).toBe("['nestedd']");
    expect(paths).toBe("['another']['deeply']['nestedd']");
  });
  test('`get` works', () => {
    expect(
      get(deepState, 'some', 'very', 'really', 'deeply', 'nested', 'value1'),
    ).toBe(1);
  });
  it('should warn when called with a null or undefined value', () => {
    expect(get(null as any, 'a', 'path')).toBe(null);
    expect(console.warn).toHaveBeenCalledTimes(1);
    const [message] = (console.warn as any).mock.calls[0];
    expect(message).toContain(
      'A getter was called on an undefined or null value',
    );
  });
  it('should warn when called with non-object value', () => {
    expect(get(5 as any, 'a', 'path', 'to', 'nowhere')).toBe(undefined);
    expect(console.warn).toHaveBeenCalledTimes(2);
    const [message, object, path] = (console.warn as any).mock.calls[0];
    expect(message).toContain(
      'Warning: You attempted to call a getter on a Non-Object value, The value is',
    );
    expect(object).toBe(5);
    expect(path).toBe('');
  });
  it('should warn when encountered non-object value along the paths', () => {
    expect(get({ a: { path: 5 } as any }, 'a', 'path', 'to', 'nowhere')).toBe(
      undefined,
    );
    expect(console.warn).toHaveBeenCalledTimes(2);
    const [message, object, path] = (console.warn as any).mock.calls[0];
    expect(message).toContain(
      'Warning: You attempted to call a getter on a Non-Object value, The value is',
    );
    expect(object).toBe(5);
    expect(path).toBe("['a']['path']");
  });
});

describe('makeTypeSafeSelector when first path argument is bad', () => {
  const state = {
    path: {
      suddenly: {
        appears: true,
      },
    },
  };
  it('should ignore the first arg if it is a blank string', () => {
    const selector1 = makeTypeSafeSelector(
      '',
      'path',
      'suddenly',
      'appears',
    )<boolean>();
    const selector2 = makeTypeSafeSelector(
      '',
      'path',
      'suddenly',
      'appears',
    ).bindToInput<typeof state>();
    expect(selector1(state)).toBe(true);
    expect(selector2(state)).toBe(true);
  });
});
describe('makeTypeSafeSelector when final path argument is bad', () => {
  const state = {
    path: {
      suddenly: {
        appears: true,
      },
    },
  };
  beforeEach(() => {
    console.warn = jest.fn();
  });
  it('should warn if the last path is not valid', () => {
    const selector1 = makeTypeSafeSelector(
      '',
      'path',
      'suddenly',
      'appearssss',
    )<boolean>();
    const selector2 = makeTypeSafeSelector(
      '',
      'path',
      'suddenly',
      'appearssss',
    ).bindToInput<any>();
    expect(selector1(state as any)).not.toBeDefined();
    expect(selector2(state as any)).not.toBeDefined();
    expect(console.warn).toHaveBeenCalledTimes(2);
    const [message0, path0, paths0] = (console.warn as any).mock.calls[0];
    const [message1, path1, paths1] = (console.warn as any).mock.calls[1];
    expect(message0).toContain(
      'There is a possible mis-match between the final "path" argument and "object"',
    );
    expect(message1).toContain(
      'There is a possible mis-match between the final "path" argument and "object"',
    );
    expect(path0).toBe("['appearssss']");
    expect(path1).toBe("['appearssss']");
    expect(paths0).toBe("['path']['suddenly']['appearssss']");
    expect(paths1).toBe("['path']['suddenly']['appearssss']");
  });
});
