import { createSlice } from '../slice';

export const {
  actions: hiActions$,
  selectors: hiSelector$,
  reducer: hiReducer$,
  slice: hiSlice$,
} = createSlice({
  slice: 'hi',
  cases: {
    set: (state, payload: any[]) => payload,
    reset: () => ['defaultState', 'jhj',],
  },
  initialState: [] as string[],
});

// $ExpectType ActionCreators<{ set: any[]; reset: {}; }>
hiActions$; // tslint:disable-line: no-unused-expression

// $ExpectType
