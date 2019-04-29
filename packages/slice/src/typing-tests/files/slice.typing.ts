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
    slice: 'hi',
    cases: {
      set: (_state, action: PayloadAction<string[]>) => action.payload,
      add: (state, action: PayloadAction<string>) => [...state, action.payload,],
      removeLast: (state, action) => void state.pop(),
      reset: () => ['defaultState', 'jhj',],
    },
    initialState: ['defaultState', 'jhj',],
  });

  const {
    actions: hiActions$,
    selectors: hiSelector$,
    reducer: hiReducer$,
    slice: hiSlice$,
  } = hiSlice;

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

  let selectors = hiSelector$;

  selectors = {
    getSlice: (state: { hi: string[] }) => state.hi,
  };

  selectors = {
    // typings:expect-error
    getSlice: (state: { wow: string[] }) => state.wow,
  };

  let reducer = hiReducer$;

  reducer = Object.assign((state: string[], action: AnyAction) => state, {
    toString: () => 'hi' as const,
  });

  // typings:expect-error
  reducer = Object.assign((state: number[], action: AnyAction) => state, {
    toString: () => 'hi' as const,
  });

  // typings:expect-error
  reducer = Object.assign((state: string[], action: AnyAction) => state, {
    toString: () => 'wow' as const,
  });

  let slice = hiSlice$;

  slice = 'hi';
  // typings:expect-error
  slice = 'wow';
}

/** Test: createSlice with obj initialState */
{
  const formInitialState = {
    name: '',
    surname: '',
    middlename: '',
  };

  const formSlice = createSlice({
    slice: 'form',
    cases: {
      setName: (state, action: PayloadAction<string>) => {
        state.name = action.payload;
      },
      setSurname: (state, action: PayloadAction<string>) => {
        state.surname = action.payload;
      },
      setMiddlename: (state, action: PayloadAction<string>) => {
        state.middlename = action.payload;
      },
      resetForm: (state, _: PayloadAction<undefined>) => formInitialState,
      resetForm2: (state, _: PayloadAction<never>) => formInitialState,
      resetForm3: (state, _: PayloadAction<void>) => formInitialState,
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

  const selectors = formSlice.selectors;

  selectors.getSlice = (state) => state.form;
  // typings:expect-error
  selectors.getSlice = (state) => state.details;
  // typings:expect-error
  selectors.getSlice = (state: { form: number[] }) => state.form;

  selectors.middlename = (state) => state.form.middlename;
  selectors.surname = (state) => state.form.surname;
  selectors.name = (state) => state.form.name;

  // typings:expect-error
  selectors.lastName;

  let reducer = formSlice.reducer;

  let reducer1: Reducer<typeof formInitialState, AnyAction, 'form'>;
  let reducer2: Reducer<typeof formInitialState, AnyAction, string>;
  let reducer3: Reducer<any[], AnyAction, 'form'>;

  reducer = reducer1;
  // typings:expect-error
  reducer = reducer2;
  // typings:expect-error
  reducer = reducer3;
}
