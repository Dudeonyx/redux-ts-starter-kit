export interface Action<T extends string = string> {
  readonly type: T;
}

export interface PayloadAction<T extends string = string, P = any, Slc extends string = string>
  extends Action<T> {
  readonly payload?: P;
  readonly slice?: Slc;
}
