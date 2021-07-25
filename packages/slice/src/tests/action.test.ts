/* eslint-disable no-console */
import {
  getActionType,
  createTypeSafeAction,
  createType,
  createSliceAction,
} from '../action';

describe('createTypeSafeAction', () => {
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
describe('createSliceAction', () => {
  it('should create a slice action', () => {
    const action = createSliceAction('A_TYPE', 'slice_A')<string>();

    expect(action('something')).toEqual({
      type: 'A_TYPE',
      payload: 'something',
      slice: 'slice_A',
    });
  });

  describe('when stringifying slice action', () => {
    it('should return the action type', () => {
      const action = createSliceAction('A_TYPE', 'slice_A')<string>();
      expect(`${action}`).toEqual('A_TYPE');
      expect(action.type).toEqual('A_TYPE');
    });
  });
  describe('The `slice` prop should return the slice', () => {
    const action = createSliceAction('A_TYPE', 'slice_A')<string>();
    expect(action.slice).toEqual('slice_A');
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
    const action = createTypeSafeAction('A_TYPE')();
    expect(getActionType(action)).toEqual('A_TYPE');
  });
});
