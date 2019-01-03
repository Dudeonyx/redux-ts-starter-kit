import { configureStore, getDefaultMiddleware } from '../configureStore';
import * as redux from 'redux';
import * as devtools from 'redux-devtools-extension';

import thunk from 'redux-thunk';
// import immutableStateInvariant from 'redux-immutable-state-invariant'

describe('getDefaultMiddleware', () => {
  it('returns an array with only redux-thunk in production', () => {
    expect(getDefaultMiddleware(true)).toEqual([thunk]);
  });

  it('returns an array with additional middleware in development', () => {
    const middleware = getDefaultMiddleware(false);
    expect(middleware).toContain(thunk);
    expect(middleware.length).toBeGreaterThan(1);
  });
});

describe('configureStore', () => {
  jest.spyOn(redux, 'applyMiddleware');
  jest.spyOn(redux, 'combineReducers');
  jest.spyOn(redux, 'compose');
  jest.spyOn(redux, 'createStore');
  jest.spyOn(devtools, 'composeWithDevTools');

  function reducer() {}

  beforeEach(() => jest.clearAllMocks());

  describe('given a function reducer', () => {
    it('calls createStore with the reducer', () => {
      expect(configureStore({ reducer })).toBeInstanceOf(Object);
      expect(redux.applyMiddleware).toHaveBeenCalled();
      expect(devtools.composeWithDevTools).toHaveBeenCalled();
      expect(redux.createStore).toHaveBeenCalledWith(
        reducer,
        undefined,
        expect.any(Function),
      );
    });
  });

  describe('given an object of reducers', () => {
    it('calls createStore with the combined reducers', () => {
      const reducer = {
        reducer() {
          return true;
        },
      };
      expect(configureStore({ reducer })).toBeInstanceOf(Object);
      expect(redux.combineReducers).toHaveBeenCalledWith(reducer);
      expect(redux.applyMiddleware).toHaveBeenCalled();
      expect(devtools.composeWithDevTools).toHaveBeenCalled();
      expect(redux.createStore).toHaveBeenCalledWith(
        expect.any(Function),
        undefined,
        expect.any(Function),
      );
    });
  });

  describe('given no reducer', () => {
    it('throws', () => {
      expect(configureStore).toThrow(
        'Reducer argument must be a function or an object of functions that can be passed to combineReducers',
      );
    });
  });

  describe('given no middleware', () => {
    it('calls createStore without any middleware', () => {
      expect(configureStore({ middleware: [], reducer })).toBeInstanceOf(
        Object,
      );
      expect(redux.applyMiddleware).toHaveBeenCalledWith();
      expect(devtools.composeWithDevTools).toHaveBeenCalled();
      expect(redux.createStore).toHaveBeenCalledWith(
        reducer,
        undefined,
        expect.any(Function),
      );
    });
  });

  describe('given custom middleware', () => {
    it('calls createStore with custom middleware and without default middleware', () => {
      const thank = (store: any) => (next: (arg0: any) => any) => (
        action: any,
      ) => next(action);
      expect(configureStore({ middleware: [thank], reducer })).toBeInstanceOf(
        Object,
      );
      expect(redux.applyMiddleware).toHaveBeenCalledWith(thank);
      expect(devtools.composeWithDevTools).toHaveBeenCalled();
      expect(redux.createStore).toHaveBeenCalledWith(
        reducer,
        undefined,
        expect.any(Function),
      );
    });
  });

  describe('with devTools disabled', () => {
    it('calls createStore without devTools enhancer', () => {
      expect(configureStore({ devTools: false, reducer })).toBeInstanceOf(
        Object,
      );
      expect(redux.applyMiddleware).toHaveBeenCalled();
      expect(redux.compose).toHaveBeenCalled();
      expect(redux.createStore).toHaveBeenCalledWith(
        reducer,
        undefined,
        expect.any(Function),
      );
    });
  });

  describe('given preloadedState', () => {
    it('calls createStore with preloadedState', () => {
      expect(configureStore({ reducer })).toBeInstanceOf(Object);
      expect(redux.applyMiddleware).toHaveBeenCalled();
      expect(devtools.composeWithDevTools).toHaveBeenCalled();
      expect(redux.createStore).toHaveBeenCalledWith(
        reducer,
        undefined,
        expect.any(Function),
      );
    });
  });

  describe('given enhancers', () => {
    it('calls createStore with enhancers', () => {
      const enhancer = (next: any) => next;
      expect(configureStore({ enhancers: [enhancer], reducer })).toBeInstanceOf(
        Object,
      );
      expect(redux.applyMiddleware).toHaveBeenCalled();
      expect(devtools.composeWithDevTools).toHaveBeenCalled();
      expect(redux.createStore).toHaveBeenCalledWith(
        reducer,
        undefined,
        expect.any(Function),
      );
    });
  });
});
