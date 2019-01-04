import robodux from './slice';

const cap = (t: string) => t.charAt(0).toUpperCase() + t.substr(1);

type Obj = {
  [key: string]: any;
};

function set<S = Obj>() {
  return (state: S, payload: S): S => payload;
}

function add<S = Obj>() {
  return (state: S, payload: S): S => {
    Object.keys(payload).forEach((key) => {
      state[key as keyof S] = payload[key as keyof S];
    });
    return state;
  };
}

function remove<S = Obj>() {
  return (state: S, payload: string[]): S => {
    payload.forEach((key) => {
      delete state[key as keyof S];
    });
    return state;
  };
}

export default function mapSlice<
  SS extends {} = any,
  A = any,
  S extends { [s: string]: any } = { [s: string]: any }
>(slice: string) {
  const initialState = {} as SS;
  return robodux<SS, A, S>({
    slice,
    initialState,
    actions: {
      [`add${cap(slice)}`]: add<S>(),
      [`set${cap(slice)}`]: set<S>(),
      [`remove${cap(slice)}`]: remove<S>(),
      [`reset${cap(slice)}`]: () => initialState,
    } as any,
  });
}
