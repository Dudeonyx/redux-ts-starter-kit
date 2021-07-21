import * as vm from 'vm';
import isPlainObject from '../isPlainObject';

describe('isPlainObject', () => {
  it('returns true only if plain object', () => {
    function Test(this: { prop: number }) {
      this.prop = 1;
    }

    const sandbox = { fromAnotherRealm: false };
    vm.runInNewContext('fromAnotherRealm = {}', sandbox);

    expect(isPlainObject(sandbox.fromAnotherRealm)).toBe(true);
    expect(isPlainObject(new (Test as any)())).toBe(false);
    expect(isPlainObject(new Date())).toBe(false);
    expect(isPlainObject([1, 2, 3,])).toBe(false);
    expect(isPlainObject(null)).toBe(false);
    expect(isPlainObject()).toBe(false);
    expect(isPlainObject({ x: 1, y: 2 })).toBe(true);
  });
});
