export interface Action<P = any> {
  readonly type: string;
  readonly payload?: P;
}
export interface AnyAction<P = any> extends Action<P> {
  [payload: string]: any;
}
