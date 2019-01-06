import { Action, AnyAction, Reducer } from 'redux';

/**
 * A *dispatching function* (or simply *dispatch function*) is a function that
 * accepts an action or an async action; it then may or may not dispatch one
 * or more actions to the store.
 *
 * We must distinguish between dispatching functions in general and the base
 * `dispatch` function provided by the store instance without any middleware.
 *
 * The base dispatch function *always* synchronously sends an action to the
 * store's reducer, along with the previous state returned by the store, to
 * calculate a new state. It expects actions to be plain objects ready to be
 * consumed by the reducer.
 *
 * Middleware wraps the base dispatch function. It allows the dispatch
 * function to handle async actions in addition to actions. Middleware may
 * transform, delay, ignore, or otherwise interpret actions or async actions
 * before passing them to the next middleware.
 *
 * @template A The type of things (actions or otherwise) which may be
 *   dispatched.
 */
export interface Dispatch<A extends Action = AnyAction> {
  // tslint:disable-next-line: callable-types
  <T extends A>(action: T): T;
}

/**
 * Object whose values correspond to different reducer functions.
 *
 * @template A The type of actions the reducers can potentially respond to.
 */
export type ReducersMapObject<S = any, A extends Action = Action> = {
  [K in keyof S]: Reducer<S[K], A>
};
