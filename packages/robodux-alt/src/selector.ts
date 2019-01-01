interface Hash {
  [key: string]: any;
}

export function createSelector<State extends Hash, SliceState>(
  slice: string,
): (state: State) => SliceState {
  if (!slice) {
    return (state: State) => state as any;
  }
  return (state: State) => state[slice];
}
export function createSelectorAlt<State extends Hash, SliceState>(
  slice: string,
): (state: State) => SliceState | State | SliceState[keyof SliceState] | State[keyof State] {
  if (!slice) {
    return (state: State) => state;
  }
  return (state: State) => state[slice];
}
export function createSubSelector<State extends Hash, SliceState>(
  slice: keyof State,
  subSlice: keyof SliceState,
): (state: State) => SliceState | State |SliceState[keyof SliceState] | State[keyof State]  {
  if (!slice) {
    return (state: State) => state[subSlice as keyof State];
  }
  return (state: State) => (state[slice]as unknown as SliceState)[subSlice];
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
