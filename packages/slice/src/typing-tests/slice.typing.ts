/* eslint-disable no-inner-declarations */
/* eslint-disable no-param-reassign */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable prefer-const */
/* eslint-disable no-void */

import type {
  PayloadAction,
  AnyAction,
  ActionCreatorsMap,
  Reducer,
} from '../index';
import { createSlice } from '../index';
import type { IsAny, IsUnknown } from '../types';

type Equals<T, U> = IsAny<
  T,
  never,
  IsAny<U, never, [T] extends [U] ? ([U] extends [T] ? any : never) : never>
>;
type IsNotAny<T> = IsAny<T, never, any>;
type EnsureUnknown<T extends any> = IsUnknown<T, any, never>;
type EnsureAny<T extends any> = IsAny<T, any, never>;

export function expectType<T>(t: T): T {
  return t;
}
export function expectExactType<T>(t: T) {
  return <U extends Equals<T, U>>(u: U) => {};
}

export function expectUnknown<T extends EnsureUnknown<T>>(t: T) {
  return t;
}

export function expectExactAny<T extends EnsureAny<T>>(t: T) {
  return t;
}

export function expectNotAny<T extends IsNotAny<T>>(t: T): T {
  return t;
}

/** Test: createSlice types */
{
  const hiSlice = createSlice({
    name: '',
    cases: {
      add: (state, payload: string) => void state.push(payload),
      // add2: (state, payload: null) => void state.push(payload),
      set: (_state, payload: string[]) => payload,
      set2: (_state, payload: string[] | undefined) => payload,
      set3: (_state, payload: string[] | null) => payload || undefined,
      set4: (_state, payload: {}) => undefined,
      set5: (_state, payload: { [s: string]: any }) => undefined,
      set6: (_state, payload: symbol) => undefined,
      set7: (_state, payload: boolean) => undefined,
      removeLast: (state) => void state.pop(),
      reset: () => ['defaultState', 'jhj'],
    },
    initialState: ['defaultState', 'jhj'],
  });

  const { actions: hiActions$, reducer: hiReducer$ } = hiSlice;

  hiActions$.set;
  hiActions$.set3(null);
  // @ts-expect-error
  hiActions$.set4(null);
  // @ts-expect-error
  hiActions$.set5(null);
  // @ts-expect-error
  hiActions$.set6(null);
  // @ts-expect-error
  hiActions$.set7(null);

  type Actions = ActionCreatorsMap<
    {
      set: string[];
      set2?: string[];
      removeLast: unknown;
      add: string;
      reset: unknown;
    },
    { set: 'set' }
  >;
  // actions.set
  type Set = {
    (payload: string[]): PayloadAction<string[], 'set'>;
    type: 'set';
    toString: () => 'set';
  };
  type Reset = {
    (): PayloadAction<undefined, 'reset'>;
    type: 'reset';
    toString: () => 'reset';
  };
  type RemoveLast = {
    (payload?: any): PayloadAction<undefined, 'removeLast'>;
    type: 'removeLast';
    toString: () => 'removeLast';
  };

  expectType<Actions>(hiActions$);
  expectType<Set>(hiActions$.set);
  expectType<Reset>(hiActions$.reset);
  expectType<RemoveLast>(hiActions$.removeLast);

  hiActions$.reset();
  // @ts-expect-error
  hiActions$.reset(['sf']);

  hiActions$.set(['hj']);
  // @ts-expect-error
  hiActions$.set();

  hiActions$.set2();
  // @ts-expect-error
  hiActions$.set2(5);

  hiActions$.add('sup');
  // @ts-expect-error
  hiActions$.add();

  hiActions$.removeLast();
  // @ts-expect-error
  hiActions$.removeLast(0);

  let select = hiSlice.selectors;

  let selectors = hiSlice.reMapSelectorsTo('hi');

  // @ts-expect-error
  select.fdf;
  // @ts-expect-error
  selectors.fdf;

  expectType<typeof selectors>({
    selectSlice: (state: { hi: string[] }) => state.hi,
  });

  expectType<typeof selectors>({
    // @ts-expect-error
    selectSlice: (state: { wow: string[] }) => state.wow,
  });

  // let reducer = hiReducer$;

  expectType<typeof hiReducer$>(
    (state: string[] = [], action: AnyAction) => state,
  );
  expectType<typeof hiReducer$>( // @ts-expect-error
    (state: number[] = [], action: AnyAction) => state,
  );
}

/** Test: createSlice with obj initialState */
{
  const formInitialState = {
    name: '',
    surname: '',
    middlename: '',
  };

  const formSlice = createSlice({
    name: 'form',
    cases: {
      setName: (state, payload: string) => {
        state.name = payload;
      },
      setSurname: (state, payload: string) => {
        state.surname = payload;
      },
      setMiddlename: (state, payload: string) => {
        state.middlename = payload;
      },
      resetForm: (state, _: undefined) => formInitialState,
      resetForm3: (state, _: void) => formInitialState,
      resetForm4: (state) => formInitialState,
      resetForm5: () => formInitialState,
    },
    initialState: formInitialState,
  });

  formSlice.actions.resetForm();
  formSlice.actions.resetForm3();
  formSlice.actions.resetForm4();
  formSlice.actions.resetForm5();
  // @ts-expect-error
  formSlice.actions.resetForm(5);
  // @ts-expect-error
  formSlice.actions.resetForm2(5);
  // @ts-expect-error
  formSlice.actions.resetForm3({});
  // @ts-expect-error
  formSlice.actions.resetForm4('jk');
  // @ts-expect-error
  formSlice.actions.resetForm5(true);

  // const selectors = formSlice.reMapSelectorsTo('form');
  const { selectors } = formSlice;

  expectType<typeof selectors.selectSlice>((state) => state.form);
  // @ts-expect-error
  expectType<typeof selectors.selectSlice>((state) => state.details);
  expectType<typeof selectors.selectSlice>(
    // @ts-expect-error
    (state: { form: number[] }) => state.form,
  );

  expectType<typeof selectors.middlename>((state) => state.form.middlename);
  expectType<typeof selectors.surname>((state) => state.form.surname);
  expectType<typeof selectors.name>((state) => state.form.name);

  // @ts-expect-error
  selectors.lastName;

  let reducer1: Reducer<typeof formInitialState, AnyAction>;
  let reducer3: Reducer<any[], AnyAction>;

  expectType<typeof reducer1>(formSlice.reducer);
  // @ts-expect-error
  expectType<typeof reducer3>(formSlice.reducer);
}

/** Test: TypeOverrides */
{
  const { actions } = createSlice({
    name: '',
    initialState: 0,
    typeOverrides: {
      increase: 'counter/increase',
      decrease: 'counter/decrease',
      reset: 'RESET',
      // decreaseBy: 5,
    },
    cases: {
      increaseBy: (state, payload: number) => state + payload,
      increase: (state) => state + 1,
      decreaseBy: (state, payload: number) => state - payload,
      decrease: (state) => state - 1,
      reset: () => 0,
    },
  });

  let { type: increase } = actions.increase;
  let { type: decrease } = actions.decrease;
  let increaseBy = actions.increaseBy.type;
  let decreaseBy = actions.decreaseBy.type;
  let { type: reset } = actions.reset;

  increase = 'counter/increase';
  decrease = 'counter/decrease';
  increaseBy = 'increaseBy';
  decreaseBy = 'decreaseBy';
  reset = 'RESET';
  // @ts-expect-error
  expectType<typeof increase>('increase');
  // @ts-expect-error
  expectType<typeof decrease>('decrease');
  // @ts-expect-error
  expectType<typeof increaseBy>('counter/increaseBy');
  // @ts-expect-error
  expectType<typeof decreaseBy>('counter/decreaseBy');
  // @ts-expect-error
  expectType<typeof reset>('reset');
}

/* Test: Computed */
{
  const formInitialState = {
    name: '',
    surname: '',
    middlename: '',
  };

  const formSlice = createSlice({
    name: '',
    cases: {
      setName: (state, payload: string) => {
        state.name = payload;
      },
    },
    computed: {
      fullname: (state) => `${state.surname} ${state.name} ${state.middlename}`,
      introduceSelf(state): string {
        return `Hello, my name is ${this.fullname(state)}`;
      },
      introduceSelf2(state): string {
        return `Hello, my name is ${this.fullname(state)}`;
      },
    },
    initialState: formInitialState,
  });

  const selectors = formSlice.reMapSelectorsTo('form');
  // @ts-expect-error
  selectors.introduceSelfj;

  const fullname = selectors.fullname({ form: formInitialState });
  const intro1 = selectors.introduceSelf({ form: formInitialState });
  const intro2 = selectors.introduceSelf2({ form: formInitialState });

  expectType<string>(fullname);
  expectType<string>(intro1);
  expectType<string>(intro2);
}
