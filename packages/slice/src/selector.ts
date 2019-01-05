import { AnyState } from './slice';

export function createSelector<
  State extends AnyState = AnyState,
  SliceState = any
>(slice: ''): (state: AnyState) => SliceState;

export function createSelector<
  State extends AnyState = AnyState,
  SliceState = any
>(slice: keyof State): (state: State) => SliceState;

export function createSelector<
  State extends AnyState = AnyState,
  SliceState = any
>(slice: keyof State): (state: State) => SliceState {
  if (
    !(
      typeof slice === 'string' ||
      typeof slice === 'number' ||
      typeof slice === 'symbol'
    )
  ) {
    throw new Error('slice argument must be a string or number or symbol');
  }
  if (slice == null || slice === '') {
    return (state: State) => {
      if (state == null) {
        console.error(
          `This selector was called with a null or undefined state`,
        );
        return state;
      }
      return <any>state;
    };
  }
  return (state: State) => {
    if (state == null) {
      console.error(`This selector was called with a null or undefined state`);
      return state;
    }
    if (!state.hasOwnProperty(slice)) {
      console.error(`${String(slice)} was not found in the given State,
      This selector was either called with a bad state argument or
      an incorrect slice name was given when instantiating the parent reducer,
      check for spelling errors`);
      return undefined;
    }
    return state[slice];
  };
}
export function createSubSelector<
  State extends AnyState = AnyState,
  SliceState extends AnyState = AnyState
>(slice: keyof State | '', subSlice: ''): never;
export function createSubSelector<
  State extends AnyState = AnyState,
  SliceState extends AnyState = AnyState
>(
  slice: '',
  subSlice: keyof SliceState,
): (state: AnyState) => SliceState[keyof SliceState];
export function createSubSelector<
  State extends AnyState = AnyState,
  SliceState extends AnyState = AnyState
>(
  slice: keyof State,
  subSlice: keyof SliceState,
): (state: State) => SliceState[keyof SliceState];
export function createSubSelector<
  State extends AnyState = AnyState,
  SliceState extends AnyState = AnyState
>(
  slice: keyof State,
  subSlice: keyof SliceState,
): (state: State) => SliceState[keyof SliceState] {
  if (
    subSlice == null ||
    subSlice === '' ||
    !(
      typeof slice === 'string' ||
      typeof slice === 'number' ||
      typeof slice === 'symbol'
    ) ||
    !(
      typeof subSlice === 'string' ||
      typeof subSlice === 'number' ||
      typeof subSlice === 'symbol'
    )
  ) {
    throw new Error(
      'SubSlice must not be blank, and slice/subSlice must be a string or number or symbol',
    );
  }
  if (!slice) {
    return (state: State) => {
      if (state == null) {
        console.error(
          `This selector was called with a null or undefined state`,
        );
        return <any>state;
      }
      return state[subSlice as keyof State];
    };
  }
  return (state: State) => {
    if (state == null) {
      console.error(`This selector was called with a null or undefined state`);
      return state;
    }
    if (!state.hasOwnProperty(slice)) {
      console.error(`${String(slice)} was not found in the given State,
      This selector was either called with a bad state argument or
      an incorrect slice name was given when instantiating the parent reducer,
      check for spelling errors`);
      return undefined;
    }
    if (!state[slice].hasOwnProperty(subSlice)) {
      console.error(
        `${String(subSlice)} was not found in the given State[${String(
          slice,
        )}] slice,\nThis selector was either called with a bad state argument or\nan incorrect subSlice name was given when instantiating the parent reducer,\ncheck for spelling errors`,
      );
      return undefined;
    }
    return (<SliceState>(<unknown>state[slice]))[subSlice];
  };
}
