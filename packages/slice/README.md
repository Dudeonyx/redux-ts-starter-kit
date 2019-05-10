# @redux-ts-starter-kit/slice [![Build Status](https://travis-ci.org/Dudeonyx/redux-ts-starter-kit.svg?branch=master)](https://travis-ci.org/Dudeonyx/redux-ts-starter-kit)

## A simple set of tools to make using Redux easier

### Installation

`npm install @redux-ts-starter-kit/slice`

### Note

This package only includes tools for simplifying the creation of slice reducers, it does not ship with `redux` or any of the tools to automate the generation of a redux store with enhancers and middleware.

If you require such tools see [@redux-ts-starter-kit/core](https://github.com/Dudeonyx/redux-ts-starter-kit/tree/master/packages/core)

### Purpose

One of the biggest complaints developers have with redux is the amount of boilerplate and new concepts they have to learn to use it. `@redux-ts-starter-kit/slice` attempts to simplify the boilerplate by automatically configuring actions, reducers, and selectors. The way it works is `@redux-ts-starter-kit/slice` will take a list of functions that correspond to how state should be updated and then create action types, action creators, and basic selectors for the developer to use. This library tries to not make too many assumptions about how developers use redux. It does not do anything magical, simply automates the repetitive tasks with redux.

Under the hood every reducer created by `@redux-ts-starter-kit/slice` leverages immer to update the store, which means reducers are allowed to mutate the state directly.

## Features

- First-class typescript support.
- Automatically creates actions, reducer, and selector(s).
- Reducers leverage `immer` which makes updating state easy.
- When stringifying action creators they return the action type.
- Helper functions for manually creating actions and reducers.
- Reducers do not receive entire action object, only the payload which simplifies things.
- Type inferrence and generation, minimizing the need to manually define types.
- Create computed selectors that are automatically memoized using the wonderful [memoize-state](https://github.com/theKashey/memoize-state) lib.

## Inspirations

This library was heavily inspired by [autodux](https://github.com/ericelliott/autodux), [robodux](https://github.com/neurosnap/robodux) and [redux-starter-kit](https://github.com/markerikson/redux-starter-kit).

## Example

```typescript
import { createSlice } from '@redux-ts-starter-kit/slice';
import { createStore, combineReducers } from 'redux';

const counterSlice = createSlice({
  initialState: 0,
  cases: {
// the type of `state` param is automatically inferred from the initialState
    increment: state => state + 1,
    incrementBy: (state, payload: number) => state + payload,
    decrement: state => state - 1,
    decrementBy: (state,payload: number) => state - payload,
    multiply: (state, payload: number) => state * payload,
  },
});

interface User {   // state slice/initial state interface
  name: string;
}

const initialUserState: User = {
  name: '',
}

const userSlice = createSlice({
  initialState: initialUserState,
  cases: {
    setUserName: (state, payload: string) => {
      state.name = payload;
    },
  }
})

const rootReducer = combineReducers({
    counter: counterSlice.reducer,
    user: userSlice.reducer,
  })

const store = createStore(rootReducer)
// After creating the store the `mapSelectorsTo` util can be used to map the selectors to the correct path.

const counterSelectors = counterSlice.mapSelectorsTo('counter');
const userSelectors = userSlice.mapSelectorsTo('user');

store.dispatch(counterSlice.actions.increment());
// New State -> { counter: 1, user: { name: '' } }

store.dispatch(counterSlice.actions.incrementBy(10));
// New State -> { counter: 11, user: { name: '' } }

store.dispatch(counterSlice.actions.multiply(3));
// New State -> { counter: 33, user: { name: '' } }

store.dispatch(counterSlice.actions.decrement());
// New State -> { counter: 32, user: { name: '' } }

store.dispatch(counterSlice.actions.decrementBy(8));
// New State -> { counter: 26, user: { name: '' } }

console.log(`${counterSlice.actions.decrement}`);
// -> 'decrement'

store.dispatch(userSlice.actions.setUserName('eric'));
// New State -> { counter: 6, user: { name: 'eric' } }

const state = store.getState();
console.log(counterSelectors.selectSlice(state));
// -> 6
console.log(userSelectors.selectSlice(state));
// -> { name: 'eric' }

console.log(userSelectors.name(state));
// -> 'eric'
```

## createSlice API

A function that accepts an initial state and an object whose methods are case reducers, and automatically generates action creators, action types, and selectors that correspond to the reducers and state.

The reducers will be wrapped in the `createReducer()` utility, and so they can safely "mutate" the state they are given.

`createSlice` also accepts the following optional arguments:

- typeOverrides
- computed.

```typescript
function createSlice({
    // A object of function that will be used as cases for the returned reducer,
    // is used to generate action creators that trigger the corresponding case
    cases: {
      [name: string]: (state: S, payload: P) => S | void | undefined
    },
    // The initial Slice State, same as normal reducer
    initialState: S,
})
```

### General Usage

```typescript
import { createSlice } from '@redux-ts-starter-kit/slice';

  interface FormState {
    name: string;
    surname: string;
    middlename: string;
  }


  const formInitialState: FormState = {
    name: '',
    surname: '',
    middlename: ''
  };

  const formSlice = createSlice({
    initialState: formInitialState,
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
      resetForm: () => formInitialState
    },
  });
```

### Arguments

`createSlice` accepts a single argument object with the following fields:

#### `initialState` *required*

The state that the reducer is initialized with, same usage as standard reducer.

#### `cases` *required*

An object whose methods represent the cases the generated reducer handles, can be thought of as the equivalent of `switch-case` statements in a standard reducer.

- Each method is equivalent to a standard switch case statement in a standard reducer.
- Each method receives the `state` as it's first argument followed by the action payload.
- Each method can be thought of as a `caseReducer`.
- Each method can mutate the state directly as it uses `immer` behind the scenes to make it immutable.
- Each method is used to make an action creator of the same name.

_note: the second argument does not have to be called `payload` even though it is in actuality the action payload. You can name it whatever you want_

```ts
type Todo = { title: string, completed: boolean };

const todoSlice = createSlice({
  initialState: [] as Todo[],
  cases: {
    addTodo: (state, title: string) => {
      state.push({ title, completed: false })
    },
    deleteTodo: (state, index: number) => {
      state.splice(index, 1);
    },
    setCompleted: (state, index: number) => {
      state[index].completed = true;
    },
    deleteAllTodos: () => [],  // sets the state to an empty array
  }
})
```

Note:

- No need to type cast the state argument, its type is automatically inferred from the initialState field.

- The returned action creators accept only a single argument as payload, i.e a case in the form `(state,payload1,payload2)=>{}` is invalid. If you need to pass multple arguments use an object or array to pass them.

#### `typeOverrides` *not required*

Type overrides allow the user to override the `type` which case reducers respond to, which by default is simply the name of the case reducer.

i.e the `addTodo` case reducer in `cases: { addTodo: (state, payload) => {//...}, }` would by default respond to actions of type `'addTodo'` e.g. `{ type: 'addTodo', payload: 'Jog' }`.

This can be changed thanks to the `typeOverrides` option.

For example to change the type to `'ADD_A_TODO'` instead see the example below.

It should be noted that the action creators `createSlice` generates automatically account for typeOverrides

 ```ts
type Todo = { title: string, completed: boolean };

const todoSlice = createSlice({
  initialState: [] as Todo[],
  cases: {
    addTodo: (state, title: string) => {
      state.push({ title, completed: false })
    },
    deleteTodo: (state, index: number) => {
      state.splice(index,1);
    },
    setCompleted: (state, index: number ) => {
      state[index].completed = true;
    },
    deleteAllTodos: () => [],
  },
  typeOverrides: {
    addTodo: 'ADD_A_TODO',
  }
})

console.log(todoSlice.actions.addTodo('Jog in the morning!'))
// `{ type: 'ADD_A_TODO', payload: 'Jog in the morning!'}`
// the default type is overriden!

console.log(todoSlice.actions.deleteTodo(1))
// `{ type: 'deleteTodo', payload: 1 }`
// the default type is untouched

```

This feature is also useful for cases where you need to change the type due to some reason like clashes but you don't want to have to rename all your action creators and their imports.

#### computed *not required*

Computed selectors for the slice, will be memoized using `memoize-state` lib. These selectors will only be recomputed when one of the used `endpoints` of the state changes, see the github page [here](https://github.com/theKashey/memoize-state) for more details.

The computed selectors can be accessed with the `mapSelectorsTo` util alongside the regular selectors.

_note: For typescript users only, if using `this` to access other selectors, ReturnType should be explicit to prevent `typescript` from mistaking the type as being circular and giving strange errors. Javascript users have nothing to worry about_

```ts
type Todo = { title: string, completed: boolean };

const todoSlice = createSlice({
  initialState: [] as Todo[],
  computed: {
    getCompletedTodos(state) {
      return state.filter(todo => todo.completed)
    },
    getCompletedTodosLength(state): number {
      return this.getCompletedTodos(state).length;
    },
  }
  cases: {
    addTodo: (state, title: string) => {
      state.push({ title, completed: false })
    },
    deleteTodo: (state, index: number) => {
      state.splice(index,1);
    },
    setCompleted: (state, index: number ) => {
      state[index].completed = true;
    },
    deleteAllTodos: () => [],
  },
  typeOverrides: {
    addTodo: 'ADD_A_TODO',
  }
})
```

### Return value

createSlice return an object with the following fields

#### reducer

A reducer function, works exactly the same as a standard reducer

#### actions

An object of action creators with the same name as the corresponding case.
You can see this in action in the todoSlice example above, it's actions object has the following type signature

```typescript

// type signature of `todoSlice.actions`
{
  addTodo: {
    (payload: string): PayloadAction<string, 'ADD_A_TODO'>;
    type: 'ADD_A_TODO';
  };
  deleteTodo: {
    (payload: number): PayloadAction<number, 'deleteTodo'>;
    type: 'deleteTodo';
  };
  setCompleted: {
    (payload: number): PayloadAction<number, 'setCompleted'>;
    type: 'setCompleted';
  };
  deleteAllTodos: {
    (): PayloadAction<undefined, 'deleteAllTodos'>;
    type: 'deleteAllTodos';
  };
}

```

#### mapSelectorsTo

A utility function that receives a `path`(s) arg and generates selector(s) mapped to that path, always includes a selector called selectSlice that selects it's slice state from the redux state, if the initial state is an object additional selectors are generated with the same names as the corresponding initial state keys.

Includes computed selectors if present.

_note: it can receive multiple path arguments in the event of a deeply nested state slice_

E.g

```ts
import { createSlice } from '@redux-ts-starter-kit/slice';
import { createStore, combineReducers } from 'redux';


const namesInitialState = {
  firstName: '',
  LastName: '',
  middleName: '',
};

const namesSlice = createSlice({
  initialState: namesInitialState,
  computed: {
    getFullName: state =>
      `${state.firstName} ${state.middleName} ${state.LastName}`,
  }
  cases: {
    setFirstName: (state, payload: string) => {
      state.firstName = payload;
    },
    setLastname: (state, payload: string) => {
      state.lastName = payload;
    },
    setMiddlename: (state, payload: string) => {
      state.middleName = payload;
    },
    resetForm: () => namesInitialState,
  },
});

const detailsReducer = combineReducer({
  names: namesSlice.reducer,
  other: //...,
})

const rootReducer = combineReducers({
  todos: //...,
  counter: //...,
  details: detailsReducer,
});

const store = createStore(rootReducer);

const namesSelectors = formSlice.mapSelectorsTo('details', 'names');

// later...

const sampleReduxState = {
  todos: [
    { title: 'Jog in the morning!', completed: false }
  ],
  counter: 15,
  details: {
    names: {
      firstName: "John",
      LastName: "Doe",
      middleName: "Wayne",
    },
    others: {
      age: 28,
      profession: 'Programmer',
      //...
    },
  },
}

console.log(namesSelectors.selectSlice(sampleReduxState));
// {
//   firstName: "John",
//   LastName: "Doe",
//   middleName: "Wayne",
// }

// note: the `firstName`, `middleName` and `lastName` selectors where automatically created based on the initialState given for the slice.
console.log(namesSelectors.firstName(sampleReduxState));
// "John"

console.log(namesSelectors.middleName(sampleReduxState));
// "Wayne"

console.log(namesSelectors.lastName(sampleReduxState));
// "Doe"

// computed selectors are included.
console.log(namesSelectors.fullName(sampleReduxState));
// "John Wayne Doe"

// sample useage in mapStateToProps

const mapStateToProps = (state: ReduxState) =>({
  firstName: namesSelectors.firstName(state),
  middleName: namesSelectors.middleName(state),
  lastName: namesSelectors.lastName(state),
  fullName: namesSelectors.fullName(state),
})

export default connect(mapStateToProps)(NameComponent);
```

## Other Exports

### createAction/createTypeSafeAction

This is the helper function that `createSlice` uses to create an action. It is also useful to use
when not using createSlice because when stringifying the function it will return the action type.
This allows developers to not have to worry about passing around action types, instead they simply
pass around action creators for reducers, sagas, etc.

```typescript
import { createAction } from '@redux-ts-starter-kit/slice';

const increment = createAction('INCREMENT');
// or for typescript users who need strictly typed action creators
const increment = createTypeSafeAction('INCREMENT')<number>();

console.log(increment);
 ->> 'INCREMENT'
console.log(increment(2));
->> { type: 'INCREMENT', payload: 2 };

const storeDetails = createAction('STORE_DETAILS');
// or for ts users
const storeDetails = createTypeSafeAction('STORE_DETAILS')<{name: string; surname: string}>();
console.log(storeDetails);
->> 'STORE_DETAILS'
console.log(storeDetails({ name: 'John', surname: 'Doe' }));
 ->> { type: 'STORE_DETAILS', payload: {name: 'John', surname: 'Doe'} };
```

### createReducer

This is the helper function that `createSlice` uses to create a reducer. This function maps action types
to reducer functions. It will return a reducer.

```typescript
import { createReducer, createAction } from '@redux-ts-starter-kit/slice';

const multiply = createTypeSafeAction('MULTIPLY')<number>()

const counter = createReducer({
  initialState: 0,
  cases: {
    INCREMENT: (state) => state + 1,
    DECREMENT: (state) => state - 1,
    [multiply.type]: (state, payload) => state * payload,
  }
});

console.log(counter(2, { type: 'MULTIPLY': payload: 5 }));
// -> 10

// OR

console.log(counter(2, multiply(5)));
// -> 10
```