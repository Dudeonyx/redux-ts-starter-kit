import {
  PayloadAction,
  AnyAction,
  createSlice,
  ActionCreators,
  Reducer,
} from '../../index';

/** Test: createSlice types */
{
  const hiSlice = createSlice({
    cases: {
      add: (state, payload: string, type) => void state.push(payload),
      set: (_state, payload: string[], type) => payload,
      removeLast: (state, payload, type) => void state.pop(),
      reset: () => ['defaultState', 'jhj',],
    },
    initialState: ['defaultState', 'jhj',],
  });

  const { actions: hiActions$, reducer: hiReducer$ } = hiSlice;

  let actions: ActionCreators<{
    set: string[];
    removeLast: unknown;
    add: string;
    reset: {};
  }>;

  let set: {
    (payload: string[]): PayloadAction<string[], 'set'>;
    type: 'set';
    toString: () => 'set';
  };
  let reset: {
    (): PayloadAction<undefined, 'reset'>;
    type: 'reset';
    toString: () => 'reset';
  };
  let removeLast: {
    (payload?: any): PayloadAction<string[], 'removeLast'>;
    type: 'removeLast';
    toString: () => 'removeLast';
  };

  actions = hiActions$;
  set = hiActions$.set;
  reset = hiActions$.reset;
  removeLast = hiActions$.removeLast;

  hiActions$.reset();
  // typings:expect-error
  hiActions$.reset(['sf',]);

  hiActions$.set(['hj',]);
  // typings:expect-error
  hiActions$.set();

  hiActions$.add('sup');
  // typings:expect-error
  hiActions$.add();

  hiActions$.removeLast();
  hiActions$.removeLast(0);

  let selectors = hiSlice.mapSelectorsTo('hi');

  selectors = {
    selectSlice: (state: { hi: string[] }) => state.hi,
  };

  selectors = {
    // typings:expect-error
    selectSlice: (state: { wow: string[] }) => state.wow,
  };

  let reducer = hiReducer$;

  reducer = (state: string[] = [], action: AnyAction) => state;

  // typings:expect-error
  reducer = (state: number[] = [], action: AnyAction) => state;
}

/** Test: createSlice with obj initialState */
{
  const formInitialState = {
    name: '',
    surname: '',
    middlename: '',
  };

  const formSlice = createSlice({
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
      resetForm2: (state, _: never) => formInitialState,
      resetForm3: (state, _: void) => formInitialState,
      resetForm4: (state) => formInitialState,
      resetForm5: () => formInitialState,
    },
    initialState: formInitialState,
  });

  formSlice.actions.resetForm();
  formSlice.actions.resetForm2();
  formSlice.actions.resetForm3();
  formSlice.actions.resetForm4();
  formSlice.actions.resetForm5();
  // typings:expect-error
  formSlice.actions.resetForm(5);
  // typings:expect-error
  formSlice.actions.resetForm2([]);
  // typings:expect-error
  formSlice.actions.resetForm3({});
  // typings:expect-error
  formSlice.actions.resetForm4('jk');
  // typings:expect-error
  formSlice.actions.resetForm5(true);

  const selectors = formSlice.mapSelectorsTo('form');

  selectors.selectSlice = (state) => state.form;
  // typings:expect-error
  selectors.selectSlice = (state) => state.details;
  // typings:expect-error
  selectors.selectSlice = (state: { form: number[] }) => state.form;

  selectors.middlename = (state) => state.form.middlename;
  selectors.surname = (state) => state.form.surname;
  selectors.name = (state) => state.form.name;

  // typings:expect-error
  selectors.lastName;

  let reducer1: Reducer<typeof formInitialState, AnyAction>;
  let reducer3: Reducer<any[], AnyAction>;

  reducer1 = formSlice.reducer;
  // typings:expect-error
  reducer3 = formSlice.reducer;
}

/** Test: TypeOverrides */
{
  const { actions } = createSlice({
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
      decreaseBy: (state, payload: number, type) => state - payload,
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

  // typings:expect-error
  increase = 'increase';
  // typings:expect-error
  decrease = 'decrease';
  // typings:expect-error
  increaseBy = 'counter/increaseBy';
  // typings:expect-error
  decreaseBy = 'counter/decreaseBy';
  // typings:expect-error
  reset = 'reset';
}
