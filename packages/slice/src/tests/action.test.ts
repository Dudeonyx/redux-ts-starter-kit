import { createAction, getActionType } from '../action';

describe('createAction', () => {
  it('should create an action', () => {
    const action = createAction('A_TYPE');
    expect(action('something')).toEqual({
      type: 'A_TYPE',
      slice: '',
      payload: 'something',
    });
  });
  it('should create a slicespaced action', () => {
    const action = createAction('A_TYPE', 'A_SLICE');
    expect(action('something')).toEqual({
      type: 'A_TYPE',
      slice: 'A_SLICE',
      payload: 'something',
    });
  });

  describe('when stringifying action', () => {
    it('should return the action type', () => {
      const action = createAction('A_TYPE');
      expect(`${action}`).toEqual('A_TYPE');
    });
  });
});

describe('getActionType', () => {
  it('should return the action type', () => {
    const action = createAction('A_TYPE');
    expect(getActionType(action)).toEqual('A_TYPE');
  });
});
