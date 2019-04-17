import { AnyState } from './slice';

// const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const hasOwn = Object.prototype.hasOwnProperty;

export function createSelector<State extends AnyState = AnyState>(
  slice: '',
): (state: State) => State;

export function createSelector<
  State extends { [key in Sn]: SliceState },
  SliceState,
  Sn extends string
>(slice: Sn): (state: State) => SliceState;

export function createSelector<
  State extends AnyState = AnyState,
  SliceState = any
>(slice: keyof State): (state: State) => SliceState | State {
  if (
    !(
      typeof slice === 'string' ||
      typeof slice === 'number' ||
      typeof slice === 'symbol'
    )
  ) {
    throw new Error(
      'slice argument must be of type: string or number or symbol',
    );
  }
  if (slice === '') {
    return (state: State) => state;
  }
  return (state: State) => {
    try {
      const stateSlice = state[slice];
      return stateSlice;
    } catch (error) {
      console.error(`${String(slice)} was not found in the given State,
    This selector was either called with a bad state argument or
    an incorrect slice name was given when instantiating the parent reducer,
    check for spelling errors`);
      throw error;
    }
  };
}
export function createSubSelector<
  State extends { [key in Sn]: SliceState },
  SliceState,
  Sn extends string
>(slice: Sn | '', subSlice: ''): never;

export function createSubSelector<
  State extends AnyState,
  SliceState extends { [x in SSn]: SliceState },
  SSn extends string
>(slice: '', subSlice: SSn): (state: SliceState) => SliceState[SSn];

export function createSubSelector<
  State extends { [key in Sn]: SliceState },
  SliceState extends { [key in SSn]: any },
  Sn extends string,
  SSn extends string
>(slice: Sn, subSlice: SSn): (state: State) => SliceState[SSn];

export function createSubSelector<
  State extends AnyState,
  SliceState extends AnyState
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
      'SubSlice must not be blank, and slice & subSlice must be of type: string or number or symbol',
    );
  }
  if (!slice) {
    return (state: State) => {
      try {
        return state[subSlice as keyof State];
      } catch (error) {
        if (!hasOwn.call(state, slice)) {
          console.error(
            String(slice) +
              ' was not found in the given State, This selector was either called with a bad state argument or an incorrect subSlice name was given when instantiating the parent reducer, check for spelling errors',
          );
        } else if (!hasOwn.call(state[slice], subSlice)) {
          console.error(
            String(subSlice) +
              ' was not found in the given State[' +
              String(slice) +
              '] slice, This selector was either called with a bad state argument or an incorrect subSlice name was given when instantiating the parent reducer, check for spelling errors',
          );
        }
        throw error;
      }
    };
  }
  return (state: State) => {
    try {
      return state[slice][subSlice];
    } catch (error) {
      console.error(`${String(slice)} was not found in the given State,
      This selector was either called with a bad state argument or
      an incorrect slice name was given when instantiating the parent reducer,
      check for spelling errors`);
      throw error;
    }
  };
}
export function createSubSubSelector<
  State extends AnyState,
  SliceState,
  Sn extends string
>(slice: Sn | '', subSlice: '', subSubSlice: any): never;

export function createSubSubSelector<
  State extends AnyState,
  SliceState,
  Sn extends string,
  SSn extends string
>(slice: Sn | '', subSlice: SSn | '', subSubSlice: ''): never;

export function createSubSubSelector<
  State extends { [key in Sn]: SliceState },
  SliceState extends { [key in SSn]: { [key2 in SSSn]: any } },
  Sn extends string,
  SSn extends string,
  SSSn extends string
>(
  slice: '',
  subSlice: SSn,
  subSubSlice: SSSn,
): (state: SliceState) => SliceState[SSn][SSSn];

export function createSubSubSelector<
  State extends { [key in Sn]: SliceState },
  SliceState extends { [key in SSn]: { [key2 in SSSn]: any } },
  Sn extends string,
  SSn extends string,
  SSSn extends string
>(
  slice: Sn,
  subSlice: SSn,
  subSubSlice: SSSn,
): (state: State) => SliceState[SSn][SSSn];

export function createSubSubSelector<
  State extends { [key in Sn]: SliceState },
  SliceState extends { [key in SSn]: { [key2 in SSSn]: any } },
  Sn extends string,
  SSn extends string,
  SSSn extends string
>(
  slice: Sn,
  subSlice: SSn,
  subSubSlice: SSSn,
): (state: State) => SliceState[SSn][SSSn] {
  if (
    subSlice == null ||
    subSlice === '' ||
    subSubSlice == null ||
    subSubSlice === '' ||
    !(
      typeof slice === 'string' ||
      typeof slice === 'number' ||
      typeof slice === 'symbol'
    ) ||
    !(
      typeof subSlice === 'string' ||
      typeof subSlice === 'number' ||
      typeof subSlice === 'symbol'
    ) ||
    !(
      typeof subSubSlice === 'string' ||
      typeof subSubSlice === 'number' ||
      typeof subSubSlice === 'symbol'
    )
  ) {
    throw new Error(
      'SubSlice or SubSubSlice must not be blank, and slice, subSlice, SubSubSlice must be of type: string or number or symbol',
    );
  }
  if (!slice) {
    return (state: State) => {
      try {
        return ((state as unknown) as SliceState)[subSlice][subSubSlice];
      } catch (error) {
        console.error(`${String(slice)} was not found in the given State,
        This selector was either called with a bad state argument (e.g null or undefined) or
        an incorrect slice name was given when instantiating the parent reducer,
        check for spelling errors`);
        throw error;
      }
    };
  }
  return (state: State) => {
    try {
      return state[slice][subSlice][subSubSlice];
    } catch (error) {
      if (!hasOwn.call(state, slice)) {
        console.error(
          String(slice) +
            ' was not found in the given State, This selector was either called with a bad state argument or an incorrect subSlice name was given when instantiating the parent reducer, check for spelling errors',
        );
      } else if (!hasOwn.call(state[slice], subSlice)) {
        console.error(
          String(subSlice) +
            ' was not found in the given State[' +
            String(slice) +
            '] slice, This selector was either called with a bad state argument or an incorrect subSlice name was given when instantiating the parent reducer, check for spelling errors',
        );
      } else if (!hasOwn.call(state[slice][subSlice], subSubSlice)) {
        console.error(
          String(subSubSlice) +
            ' was not found in the given State[' +
            String(slice) +
            '][' +
            String(subSlice) +
            '] slice, This selector was either called with a bad state argument or an incorrect subSlice name was given when instantiating the parent reducer, check for spelling errors',
        );
      }
      throw error;
    }
  };
}
