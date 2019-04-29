export interface Action<T extends string = string> {
  readonly type: T;
}

export interface AnyAction<T extends string = string> extends Action<T> {
  [s: string]: any;
}
export interface PayloadAction<P = any, T extends string = string>
  extends Action<T> {
  readonly payload?: P;
}
