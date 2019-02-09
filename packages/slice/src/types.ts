export interface Action<T extends string = string> {
  readonly type: T;
}

export interface PayloadAction<T extends string = string, P = any>
  extends Action<T> {
  readonly payload?: P;
}
