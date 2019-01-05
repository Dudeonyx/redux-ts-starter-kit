export type ActionType = string;
export interface Action<P = any> {
  readonly type: ActionType;
  readonly payload?: P;
}
export interface AnyAction<P = any> extends Action<P> {
  [payload: string]: any;
}
