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
  Action,
  Store,
} from 'redux';
import { composeWithDevTools, EnhancerOptions } from 'redux-devtools-extension';
import thunk, { ThunkDispatch } from 'redux-thunk';
import createSerializableStateInvariantMiddleware from './serializableStateInvariantMiddleware';

import isPlainObject from './isPlainObject';

export function getDefaultMiddleware() {
  return process.env.NODE_ENV === 'production'
    ? [thunk,]
    : [
        require('redux-immutable-state-invariant').default() as Middleware,
        thunk,
        createSerializableStateInvariantMiddleware(),
      ];
}

/**
 * An options object which [configureStore] accepts as it's sole argument.
 *
 * @interface ConfigureStoreOptions
 * @template S  The type of state to be held by the store.
 * @template A The type of actions which may be dispatched.
 */
interface ConfigureStoreDefaultOptions<S, A extends Action, Ext, StateExt> {
  /**
   * @param reducer A function or an object of functions
   *  that returns the next state tree, given the
   *  current state tree and the action to handle.
   *
   * @type {(Reducer<S> | ReducersMapObject<S>)}
   * @memberof ConfigureStoreOptions
   */
  reducer: Reducer<S, A> | ReducersMapObject<S, A>;
  /**
   * @param [preloadedState] The initial state. You may optionally specify it to
   *   hydrate the state from the server in universal apps, or to restore a
   *   previously serialized user session. If you use an object of reducers as
   *   the `reducer` param, this must be an object with the same
   *   shape as `reducer` keys.
   *
   * @type {DeepPartial<S>}
   * @memberof ConfigureStoreOptions
   */
  preloadedState?: DeepPartial<S extends any ? S : S>; // ensures preloadedState's inferred type does not overide S
  /**
   * @param [devTools] A boolean indicating if [redux-devtools] should be enabled or not
   *
   * @type {boolean}
   * @default true
   * @memberof ConfigureStoreOptions
   */
  devTools?: boolean;
  /**
   * @param [enhancer] An array of store enhancers. You may optionally specify store enhancers to
   *   enhance the store with third-party capabilities such as middleware, time
   *   travel, persistence, etc. The only store enhancer that ships with Redux
   *   is `applyMiddleware()`.
   * @type {StoreEnhancer[]}
   * @memberof ConfigureStoreOptions
   */
  enhancers?: Array<StoreEnhancer<Ext, StateExt>>;
}

interface ConfigureStoreOptions0<S, A extends Action, Ext, StateExt>
  extends ConfigureStoreDefaultOptions<S, A, Ext, StateExt> {
  /**
   * @param [middleware] An array of middlewares. A middleware is a higher-order function that
   *  composes a dispatch function
   *  to return a new dispatch function. It often turns async actions into
   *  actions.
   *
   * @type {Middleware[]}
   * @memberof ConfigureStoreOptions
   */
  middleware: [];
}
interface ConfigureStoreOptions1<
  S,
  A extends Action,
  Ext,
  StateExt,
  DispatchExt
> extends ConfigureStoreDefaultOptions<S, A, Ext, StateExt> {
  /**
   * @param [middleware] An array of middlewares. A middleware is a higher-order function that
   *  composes a dispatch function
   *  to return a new dispatch function. It often turns async actions into
   *  actions.
   *
   * @type {Middleware[]}
   * @memberof ConfigureStoreOptions
   */
  middleware: Array<Middleware<DispatchExt>>;
}

/**
 * Simplifies creation of a redux store.
 *
 * @export
 * @template S The type of state to be held by the store.
 * @template A The type of actions which may be dispatched.
 * @template Ext Store extension that is mixed in to the Store type.
 * @template StateExt State extension that is mixed into the state type.
 * @template DispatchExt Dispatch signature added by a middleware..
 * @param {ConfigureStoreDefaultOptions<S,PS>} [options={} as any]
 * @returns {Store<S & StateExt, A> & Ext} store
 */
export function configureStore<
  S,
  A extends Action = Action,
  Ext extends {} = {},
  StateExt = {}
>({
  reducer,
  devTools,
  preloadedState,
  enhancers,
  middleware,
}: ConfigureStoreOptions0<S, A, Ext, StateExt>): Store<S & StateExt, A> & Ext;
export function configureStore<
  S,
  A extends Action = Action,
  Ext extends {} = {},
  StateExt = {},
  DispatchExt = {}
>({
  reducer,
  devTools,
  preloadedState,
  enhancers,
  middleware,
}: ConfigureStoreOptions1<S, A, Ext, StateExt, DispatchExt>): Store<
  S & StateExt,
  A
> &
  Ext & { dispatch: DispatchExt };

export function configureStore<
  S,
  A extends Action = Action,
  Ext extends {} = {},
  StateExt = {}
>({
  reducer,
  devTools,
  preloadedState,
  enhancers,
}: ConfigureStoreDefaultOptions<S, A, Ext, StateExt>): Store<S & StateExt, A> &
  Ext & { dispatch: ThunkDispatch<S, any, A> };

export function configureStore(
  {
    reducer,
    middleware = getDefaultMiddleware(),
    devTools = true,
    preloadedState,
    enhancers = [],
  } = {} as any,
) {
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

  const storeEnhancers = [middlewareEnhancer, ...enhancers,];

  const finalCompose =
    devTools === true
      ? composeWithDevTools({
          // Enable capture of stack traces for dispatched Redux actions
          trace: !(process.env.NODE_ENV === 'production'),
        } as EnhancerOptions)
      : compose;

  const composedEnhancer: StoreEnhancer = finalCompose(...storeEnhancers);

  const store = createStore(rootReducer, preloadedState, composedEnhancer);
  return store;
}
