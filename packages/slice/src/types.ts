import { AnyState } from './slice';

export interface Action<T extends string = string> {
  readonly type: T;
}

export interface GenericAction<
  P = any,
  T extends string = string,
  Slc extends string = string
> extends Action<T> {
  readonly payload?: P;
  readonly slice?: Slc;
  readonly [s: string]: any;
}
export interface PayloadAction<
  P = any,
  T extends string = string,
  Slc extends string = string
> extends Action<T> {
  readonly payload: P;
  readonly slice?: Slc;
}
// type FD1 = TestType<void>;
// type FD2 = TestType<string>;
// type FD3 = TestType<never>;
// type FD4 = TestType<number>;
// type FD5 = TestType<{}>;
// type FD6 = TestType<[]>;
// type FD7 = TestType<Error>;
// type FD8 = TestType<Date>;
// type FD9 = TestType<WeakMap<any,any>>;
// type FD10 = TestType<WeakSet<any>>;
// type FD11 = TestType<Map<any,any>>;
// type FD12 = TestType<Set<any>>;
// type FD13 = TestType<Number>;
export type TestType<G> = unknown extends G // Hacky ternary to catch `any`
  ? 'Any'
  : G extends number
  ? 'Number'
  : G extends string
  ? 'String'
  : G extends symbol
  ? 'Symbol'
  : G extends boolean
  ? 'Boolean'
  : G extends any[] | ReadonlyArray<any>
  ? 'Array'
  : G extends Error
  ? 'Error'
  : G extends Date
  ? 'Date'
  : G extends Map<any, any>
  ? 'Map'
  : G extends WeakMap<any, any>
  ? 'WeakMap'
  : G extends Set<any>
  ? 'Set'
  : G extends WeakSet<any>
  ? 'WeakSet' // tslint:disable-next-line: ban-types
  : G extends String
  ? 'String()' // tslint:disable-next-line: ban-types
  : G extends Number
  ? 'Number()' // tslint:disable-next-line: ban-types
  : G extends Boolean
  ? 'Boolean()' // tslint:disable-next-line: ban-types
  : G extends Symbol
  ? 'Symbol()'
  : {} extends G
  ? 'EmptyObject'
  : G extends AnyState
  ? 'Object'
  : G extends object
  ? 'Non-primitive'
  : never extends G
  ? 'Never'
  : 'Unknown';
