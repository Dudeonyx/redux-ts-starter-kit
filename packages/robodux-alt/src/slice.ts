import createAction from './action';
import createReducer from './reducer';
import { createSelector, createSelectorName, createSubSelectorName, createSubSelector } from './selector';
import { Action } from './types';

// type GetPayloadType<A> = A extends ((payload: infer P) => Action) ? P : A extends ((payload: infer P) => RAction) ? P : A;

type Reduce<State, Payload = null> = Payload extends null
  ? (state: State) => State | undefined | void
  : (state: State, payload: Payload) => State | undefined | void;

interface ReduceMap<State> {
  [key: string]: Reduce<State, any>;
}

interface ICreate<State, Actions> {
  slice?: string;
  actions: { [key in keyof Actions]: Reduce<State, Actions[key]> };
  initialState: State;
  subSelectors?: boolean;
}



const actionTypeBuilder = (slice: string) => (action: string) =>
  slice ? `${slice}/${action}` : action;


export default function create<
  SliceState,
  Actions = undefined,
  State = any
  >({ slice = '', actions, initialState, subSelectors = false }: ICreate<SliceState, Actions extends undefined ? {[s:string]:any} :Actions >) {
  type Ax = Actions extends undefined ?  {[s:string]:any} : Actions
  const actionKeys = Object.keys(actions) as (keyof Ax)[];
  const createActionType = actionTypeBuilder(slice);

  const reducerMap = actionKeys.reduce<ReduceMap<SliceState>>((map, action) => {
    map[createActionType(action as string)] = actions[action];
    return map;
  }, {});

  const reducer = createReducer<SliceState>({
    initialState,
    actions: reducerMap,
    slice,
  });

  
  const actionMap = actionKeys.reduce<
    {
      [A in keyof Ax]: Ax extends {[s:string]: {}}
      ? (payload?: Ax[A]) => Action<Ax[A]>
      :
      Ax[A] extends null
      ? 
      () => Action 
      : (payload: Ax[A]) => Action<Ax[A]>
    }
  >(
    (map, action) => {
      const type = createActionType(action as string);
      map[action] = createAction(type) as any;
      return map;
    },
    {} as any,
  );

  const selectorName = createSelectorName(slice);
  let additionalSelectors = {} as {[s:string]: (state: State) => State | SliceState}

  if(subSelectors && typeof initialState ==='object' && !Array.isArray(initialState)) {
    const initialStateKeys = Object.keys(initialState)
    additionalSelectors = initialStateKeys.reduce((map, key)=>{
      const subSelectorName = createSubSelectorName(slice,key)
      map[subSelectorName] = createSubSelector(slice,key)
      return map;
    },{} as any)
  }
  const selectors = {
    [selectorName]: createSelector<State, SliceState>(slice),
    ...additionalSelectors,
  };
  return {
    actions: actionMap,
    reducer,
    slice,
    selectors,
  };
}
