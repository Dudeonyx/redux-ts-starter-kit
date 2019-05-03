import {
  createAction,
  getActionType,
  createTypeSafeAction,
  createType,
} from '../action';

describe('createAction', () => {
  it('should create an action', () => {
    const action = createAction('A_TYPE');
    expect(action('something')).toEqual({
      type: 'A_TYPE',
      payload: 'something',
    });
  });

  describe('when stringifying action', () => {
    it('should return the action type', () => {
      const action = createAction('A_TYPE');
      expect(`${action}`).toEqual('A_TYPE');
      expect(action.type).toEqual('A_TYPE');
    });
  });
});
describe('createActionTypeSafeAction', () => {
  it('should create an action', () => {
    const action = createTypeSafeAction('A_TYPE')<string>();

    expect(action('something')).toEqual({
      type: 'A_TYPE',
      payload: 'something',
    });
  });

  describe('when stringifying action', () => {
    it('should return the action type', () => {
      const action = createTypeSafeAction('A_TYPE')<string>();
      expect(`${action}`).toEqual('A_TYPE');
      expect(action.type).toEqual('A_TYPE');
    });
  });
});

describe('CreateType', () => {
  it('returns the input string', () => {
    const type = createType('A_TYPE');
    expect(type).toEqual('A_TYPE');
  });
  beforeEach(() => {
    console.error = jest.fn();
  });
  test('should warn for non string inputs', () => {
    createType(5 as any);
    expect(console.error).toHaveBeenCalledTimes(1);
  });
});

describe('getActionType', () => {
  it('should return the action type', () => {
    const action = createAction('A_TYPE');
    expect(getActionType(action)).toEqual('A_TYPE');
  });
});
