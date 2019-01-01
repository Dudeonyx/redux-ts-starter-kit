import { createSelectorName, createSubSelectorName } from './selector';

describe('createSelectorName', () => {
  it('should convert to camel case', () => {
    expect(createSelectorName('some')).toEqual('getSome');
    expect(createSelectorName('someThing')).toEqual('getSomeThing');
    expect(createSelectorName('some-thing')).toEqual('getSomeThing');
  });
});
describe('createSubSelectorName', () => {
  it('should convert to camel case', () => {
    expect(createSubSelectorName('some', 'thing')).toEqual('getSomeThing');
    expect(createSubSelectorName('someThing', 'else')).toEqual(
      'getSomeThingElse',
    );
    expect(createSubSelectorName('some-thing', 'else-now')).toEqual(
      'getSomeThingElseNow',
    );
  });
});
