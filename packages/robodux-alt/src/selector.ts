interface Hash {
  [key: string]: any;
}

export function createSelector<State extends Hash>(
): (state: State) =>  State {
    
  return (state: State) => state;

}
export function createSliceSelector<State extends Hash, SliceState>(
  slice: keyof State,
): (state: State) => SliceState {

  return (state: State) => state[slice];
}
export function createSubSelector<State extends Hash, K extends keyof State= keyof State>(
  subSlice: K,
): (state: State) => State[K]   {

    return (state: State) => state[subSlice];
}
export function createSliceSubSelector<State extends Hash, SliceState, K extends keyof State = keyof State, L extends keyof SliceState = keyof SliceState>(
  slice: K,
  subSlice: L,
): (state: State) => SliceState[L]  {

  return (state: State) => (state[slice] as SliceState)[subSlice];
}

export function createSelectorName(slice: string) {
  if (!slice) {
    return 'getState';
  }

  return camelize(`get ${slice}`);
}
export function createSubSelectorName(slice: string, subSlice:string) {
  if (!slice) {
    return camelize(`get ${subSlice}`);
  }

  return camelize(`get ${slice} ${subSlice}`);
}

// https://stackoverflow.com/a/2970667/1713216
function camelize(str: string) {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (letter, index) => {
      return index == 0 ? letter.toLowerCase() : letter.toUpperCase();
    })
    .replace(/\s+/g, '')
    .replace(/[-_]/g, '');
}
