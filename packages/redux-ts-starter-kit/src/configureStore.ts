import {
  createStore,
  compose,
  applyMiddleware,
  combineReducers,
  Middleware,
  Reducer,
  StoreEnhancer,
  DeepPartial,
  ReducersMapObject,
} from 'redux';
import { composeWithDevTools, EnhancerOptions } from 'redux-devtools-extension';
import thunk from 'redux-thunk';
import createImmutableStateInvariantMiddleware from 'redux-immutable-state-invariant';
import createSerializableStateInvariantMiddleware from './serializableStateInvariantMiddleware';

import isPlainObject from './isPlainObject';

const IS_PRODUCTION = process.env.NODE_ENV === 'production';

export function getDefaultMiddleware(isProduction = IS_PRODUCTION) {
  let middlewareArray = [thunk];
  let middlewareArrayPlus;

  if (!isProduction) {
    middlewareArrayPlus = [
      createImmutableStateInvariantMiddleware(),
      thunk,
      createSerializableStateInvariantMiddleware(),
    ];
  }

  return middlewareArrayPlus === undefined
    ? middlewareArray
    : middlewareArrayPlus;
}

export function configureStore<S, DP extends DeepPartial<S> = DeepPartial<S>>(
  options: {
    reducer: Reducer<S> | ReducersMapObject<S>;
    preloadedState?: DP; // ensures preloadedState's inferred type does not overide S
    middleware?: Middleware[];
    devTools?: boolean;
    enhancers?: StoreEnhancer[];
  } = <any>{},
) {
  const {
    reducer,
    middleware = getDefaultMiddleware(),
    devTools = true,
    preloadedState,
    enhancers = [],
  } = options;
  let rootReducer;

  if (typeof reducer === 'function') {
    rootReducer = reducer;
  } else if (isPlainObject(reducer)) {
    rootReducer = combineReducers(reducer);
  } else {
    throw new Error(
      'Reducer argument must be a function or an object of functions that can be passed to combineReducers',
    );
  }

  const middlewareEnhancer = applyMiddleware(...middleware);

  const storeEnhancers = [middlewareEnhancer, ...enhancers];

  let finalCompose: (...funcs: Function[]) => StoreEnhancer =
    devTools !== false
      ? composeWithDevTools({
          // Enable capture of stack traces for dispatched Redux actions
          trace: !IS_PRODUCTION,
        } as EnhancerOptions)
      : compose;

  const composedEnhancer = finalCompose(...storeEnhancers);

  const store = preloadedState
    ? createStore(rootReducer, preloadedState, composedEnhancer)
    : createStore(rootReducer, composedEnhancer);

  return [store, rootReducer] as [typeof store, typeof rootReducer];
}
