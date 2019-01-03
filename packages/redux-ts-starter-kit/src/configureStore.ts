import {
  createStore,
  compose,
  applyMiddleware,
  combineReducers,
  Middleware,
  Reducer,
  StoreEnhancer,
  Store,
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

type ReducersObj<S = any> = { [K in keyof S]: Reducer<S[K]> };

export function configureStore<S, SE, E, PS extends Partial<S> = Partial<S>>({
  reducer,
  middleware,
  devTools,
  preloadedState,
  enhancers,
}: {
  reducer: Reducer<S> | ReducersObj<S>;
  preloadedState?: PS; // ensures PS is not inferred as an empty object
  middleware?: Middleware[];
  devTools?: boolean;
  enhancers?: StoreEnhancer<E, SE>[];
}): Store<S & SE> & E;

export function configureStore(
  options: {
    reducer: any;
    preloadedState?: any;
    middleware?: any[];
    devTools?: boolean;
    enhancers?: any[];
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

  let finalCompose = compose;

  if (devTools) {
    finalCompose = composeWithDevTools(({
      // Enable capture of stack traces for dispatched Redux actions
      trace: !IS_PRODUCTION,
    } as unknown) as EnhancerOptions);
  }

  const storeEnhancers = [middlewareEnhancer, ...enhancers];

  const composedEnhancer = finalCompose(...storeEnhancers);

  const store = createStore(rootReducer, preloadedState, <any>composedEnhancer);

  return store;
}
