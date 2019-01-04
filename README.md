# @redux-ts-starter-kit/core [![Build Status](https://travis-ci.org/Dudeonyx/redux-ts-starter-kit.svg?branch=master)](https://travis-ci.org/Dudeonyx/redux-ts-starter-kit)

## A simple set of tools to make using Redux easier

_A typescript friendly combined fork of [react-starter-kit](https://github.com/reduxjs/redux-starter-kit) & [robodux](https://github.com/neurosnap/robodux)_

`npm install @redux-ts-starter-kit/core`

_This command installs `@redux-ts-starter-kit/core` alongside `@redux-ts-starter-kit/slice`,`redux`, `redux-thunk`, `immer`, and `reselect` as direct dependencies allowing the full use of redux with a single npm install_

### Purpose

The `redux-ts-starter-kit` like the original `redux-starter-kit` package is intended to help address three common complaints about Redux:

- "Configuring a Redux store is too complicated"
- "I have to add a lot of packages to get Redux to do anything useful"
- "Redux requires too much boilerplate code"
- "Using redux with typescript is boilerplate hell"

We can't solve every use case, but in the spirit of [`create-react-app`](https://github.com/facebook/create-react-app) and [`apollo-boost`](https://dev-blog.apollodata.com/zero-config-graphql-state-management-27b1f1b3c2c3), we can try to provide some tools that abstract over the setup process and handle the most common use cases, as well as include some useful utilities that will let the user simplify their application code.

This package is _not_ intended to solve every possible complaint about Redux, and is deliberately limited in scope. It does _not_ address concepts like "reusable encapsulated Redux modules", data fetching, folder or file structures, managing entity relationships in the store, and so on.

### What's Included

`redux-ts-starter-kit` includes:

- A `configureStore()` function with simplified configuration options. It can automatically combine your slice reducers, adds whatever Redux middleware you supply, includes `redux-thunk` by default, and enables use of the Redux DevTools Extension.
- A `createSlice()` function re-exported from `@redux-ts-starter-kit/core` that accepts a set of reducer functions, a slice name, and an initial state value, and automatically generates corresponding action creators, types, and simple selector functions.
- A `createReducer()` utility that lets you supply a lookup table of action types to case reducer functions, rather than writing switch statements. In addition, it automatically uses the [`immer` library](https://github.com/mweststrate/immer) to let you write simpler immutable updates with normal mutative code, like `state.todos[3].completed = true`.
- A `createAction()` utility that returns an action creator function for the given action type string. The function itself has `toString()` defined, so that it can be used in place of the type constant.

## Features

- typescript support
- Automatically creates actions, reducer, and selector(s) based on `slice`
- Reducers leverage `immer` which makes updating state easy
- When stringifying action creators they return the action type
- Helper functions for manually creating actions and reducers
- Reducers do not receive entire action object, only payload
- Advanced type inferrence, minimizing the need to create one-off interfaces. _Note: supplying interfaces is largely not required but highly recommended_

## Why not X

This library was heavily inspired by [autodux](https://github.com/ericelliott/autodux), [robodux](https://github.com/neurosnap/robodux) and [redux-starter-kit](https://github.com/markerikson/redux-starter-kit).

**Note: This started as fork of robodux that was supposed to merged in a PR, but the number of changes I ended up making were numerous and breaking, and I decided to incorporate the configure store feature of redux-starter-kit as well.**

## Example

```js
import { configureStore, createSlice } from '@redux-ts-starter-kit/core';


interface State { // interface representing the entire state tree
  user: User;
  counter: number;
}
// Actions interface where the keys are the action names and the values represent the payload types
interface CounterActions {
  increment: never;    // <- never indicates that no payload is expected
  incrementBy: number;
  decrement: never;
  decrementBy: number;
  multiply: number;
}

// You can destructure, rename and export the reducer, action creators and selectors

      // number is the state slice/initial state type
const counter = createSlice<CounterActions, number,  State>({
  slice: 'counter', // slice is optional could be blank '' if this will be the sole/root reducer
  initialState: 0,
  cases: {
    increment: state => state + 1,
    incrementBy: (state,payload) => state + payload, // payload is type number
    decrement: state => state - 1,
    decrementBy: (state,payload) => state - payload,
    multiply: (state, payload) => state * payload,
  },
});

interface User {   // state slice/initial state interface
  name: string;
}

interface UserActions {  // Actions interface
  setUserName: string;
}

const user = createSlice<UserActions, User, State>({
  slice: 'user',    // slice is optional could be blank '' if this will be the sole/root reducer
  initialState: { name: '' },
  cases: {
    setUserName: (state, payload) => {
      state.name = payload; // mutate the state all you want with immer
    },
  }
})


// configureStore returns an array, with the store in first index and the created rootReducer in the second,
const [store, rootReducer] = configureStore({  
    reducer: {            // <- can be a single reducer or an object of reducers
      counter: counter.reducer,  
      user: user.reducer,
    }
});

store.dispatch(counter.actions.increment());
// New State -> { counter: 1, user: { name: '' } }
store.dispatch(counter.actions.incrementBy(10));
// New State -> { counter: 11, user: { name: '' } }
store.dispatch(counter.actions.multiply(3));
// New State -> { counter: 33, user: { name: '' } }
store.dispatch(counter.actions.decrement());
// New State -> { counter: 32, user: { name: '' } }
store.dispatch(counter.actions.decrementBy(8));
// New State -> { counter: 26, user: { name: '' } }
console.log(`${counter.actions.decrement}`);
// New State -> counter/DECREMENT
store.dispatch(user.actions.setUserName('eric'));
// New State -> { counter: 6, user: { name: 'eric' } }

const state = store.getState();
console.log(counter.selectors.getSlice(state));
// -> 6
console.log(user.selectors.getSlice(state));
// -> { name: 'eric' }
console.log(user.selectors.name(state));
// -> 'eric'
```

## configureStore API

  *Plagarised with love from [redux-starter-kit.js.org](https://redux-starter-kit.js.org/api/configurestore)*

  A friendlier abstraction over the standard Redux createStore function. Takes a single configuration object parameter, with the following options:

```js
function configureStore({
    // A single reducer function that will be used as the root reducer,
    // or an object of slice reducers that will be passed to combineReducers()
    reducer: Object<string, Function> | Function,
    // An array of Redux middlewares.  If not supplied, defaults to just redux-thunk.
    middleware: Array<MiddlewareFunction>,
    // Built-in support for devtools. Defaults to true.
    devTools: boolean,
    // Same as current createStore.
    preloadedState : State,
    // Same as current createStore.
    enhancer : ReduxStoreEnhancer,
})
```

### IMPORTANT

  **Note: A key difference between `configureStore` from `redux-starter-kit` and this `configureStore` from `@redux-ts-starter-kit/core` is that while `redux-starter-kit`'s `configureStore` returns only the created `store`, `@redux-ts-starter-kit/core`'s `configureStore` returns a tuple array containing the created store and the final root reducer.**
  **This was inspired by react hooks api and enables the user to access and unit test the root reducer**
  **Index 0 (i.e the first element of the array) is the store, and the second(index 1) is the root reducer**

  ```js
  import { configureStore } from '@redux-ts-starter-kit/core'

  const [store, rootReducer] = configureStore({
    //.....
    //.....
  });

  const state = store.getState();
  ```

Much like react hooks, array destructuring means you can use any name for the store / root reducer
i.e the following is still valid

```js
  const [myStore, myRootReducer] = configureStore({
    //.....
    //.....
  });
  const [custom, name] = configureStore({
    //.....
    //.....
  });

```

You can even leave out the second element i.e the root reducer

```js
  const [store] = configureStore({
    //.....
    //.....
  });
```

Or the first element(i.e the store) *note the starting comma*

```js
  const [,rootReducer] = configureStore({
    //.....
    //.....
  });
```

### Basic Usage

```js
import { configureStore } from '@redux-ts-starter-kit/core'

import rootReducer from './reducers'

const store = configureStore({ reducer: rootReducer })
// The store now has redux-thunk added and the Redux DevTools Extension is turned on
```

### Full Example

```js
import { configureStore, getDefaultMiddleware } from '@redux-ts-starter-kit/core'

// We'll use redux-logger just as an example of adding another middleware
import logger from 'redux-logger'

// And use redux-batch as an example of adding enhancers
import { reduxBatch } from '@manaflair/redux-batch'

import todosReducer from './todos/todosReducer'
import visibilityReducer from './visibility/visibilityReducer'

const reducer = {
  todos: todosReducer,
  visibility: visibilityReducer
}

const middleware = [...getDefaultMiddleware(), logger]

const preloadedState = {
  todos: [
    {
      text: 'Eat food',
      completed: true
    },
    {
      text: 'Exercise',
      completed: false
    }
  ],
  visibilityFilter: 'SHOW_COMPLETED'
}

const [store] = configureStore({
  reducer,
  middleware,
  devTools: NODE_ENV !== 'production',
  preloadedState,
  enhancers: [reduxBatch]
})

// The store has been created with these options:
// - The slice reducers were automatically passed to combineReducers()
// - redux-thunk and redux-logger were added as middleware
// - The Redux DevTools Extension is disabled for production
// - The middleware, batch, and devtools enhancers were automatically composed together
```

## getDefaultMiddleWare API

`getDefaultMiddleware()` is useful if you need to add custom middlewares without removing `@redux-ts-starter-kit/core`'s default middleware.

Currently it returns an array with redux-thunk.

## createSlice API

A function that accepts an initial state, an object full of reducer functions, and optionally a "slice name", and automatically generates action creators, action types, and selectors that correspond to the reducers and state.

The reducers will be wrapped in the `createReducer()` utility, and so they can safely "mutate" the state they are given.

```js
function createSlice<Actions, SliceState, State>({
    // A object of function that will be used as cases for the returned reducer,
    // is used to generate action creators that trigger the corresponding case
    cases: Object<string, Function>,
    // The initial Slice State, same as normal reducer
    initialState: any,
    // The key indicating this slice in the combined state.
    slice?: string,
})
```

### General Usage

```js
import { createSlice } from '@redux-ts-starter-kit/slice';

  interface IState {
    form: FormState;
    //.....
  }

  interface FormState {
    name: string;
    surname: string;
    middlename: string;
  }

  interface FormActions {
    setName: string;
    setSurname: string;
    setMiddlename: string;
    resetForm: never;  // no payload expected
  }

  const formInitialState: FormState = {
    name: '',
    surname: '',
    middlename: ''
  };

  const formSlice = createSlice({
    cases: {
      setName: (state, name) => {
        state.name = name;
      },
      setSurname: (state, surname) => {
        state.surname = surname;
      },
      setMiddlename: (state, middlename) => {
        state.middlename = middlename;
      },
      resetForm: state => formInitialState
    },
    slice: "form",
    initialState: formInitialState
  });
```

OR leveraging it's type inferrence if you're feeling lazy. Not recommended.

```js
  import { createSlice } from '@redux-ts-starter-kit/slice';

  interface IState {
    form: FormState;
    //.....
  }

  interface FormState {
    name: string;
    surname: string;
    middlename: string;
  }

  const formInitialState = {
    name: '',
    surname: '',
    middlename: ''
  };

  const formSlice = createSlice({
    cases: {
      setName: (state, name: string) => {
        state.name = name;
      },
      setSurname: (state, surname: string) => {
        state.surname = surname;
      },
      setMiddlename: (state, middlename: string) => {
        state.middlename = middlename;
      },
      resetForm: (state, _: never) => formInitialState
    },
    slice: "form",
    initialState: formInitialState
  });
```

### Type parameters

`createSlice` accepts three generics: `Actions`, `SliceState`, `State`. None of which are required and can mostly be inferred from the arguments given.

`Actions` helps improve autocompelete and typing for the `actions` object returned from `createSlice`.
Supply an interface where the keys are the action names and the values are the payload types, which should be `never` if the action takes no payload.

`SliceState` is the state shape of the particular slice created with `createSlice`. If there is no
slice passed to the state, then this will assume that this is the entire state shape.

`State` is the entire state shape for when a slice is used with `createSlice`. This helps type the selectors we return.

### Arguments

`createSlice` accepts a single argument object with the following fields:

#### slice

*not required*
The name of the slice of state the reducer is expected to manage, should be left out completely or be '' if the reducer is going to be the root reducer.
Should be a string or number.

Note: if a combined State interface is provided, the slice is type checked to ensure that it is a key in the State.

#### initialState

*required*
The state that the reducer is initialized with, same usage as standard reducer.

#### cases

*required*
An object containing all the actions the reducer can perform on its state slice. Each function is equivalent to a standard switch case statement in a standard reducer.
Each function can mutate the state directly as it uses `immer` behind the scenes to make it immutable.
Each function is used to make an action creator of the same name.

If an Actions interface is not supplied, you can type cast the payload arguments directly and it will infer an Actions interface from it.

Note:

- Do not type cast the state argument, its type is automatically inferred from the initialState field if not interface is given

- The returned action creators accept only a single argument as payload, i.e a case in the form `(state,payload1,payload2)=>{}` is invalid. If you need to pass multple arguments use an object or array to pass them.

```js
const hiSlice = createSlice({
    slice: 'hi',
    initialState: hiInitialState,
    cases: {
      // state type is automatically inferred as typeof hiInitialState
      setGreeting: (state, payload: string) => {
        state.greeting = payload;
      },
      setWaves: (state, payload: number) => {
        state.waves = payload;
      },
      resetHi: (state, payload: never) => hiInitialState
    },
  });

  // Gives the following action creators

  console.log(hiSlice.actions.setGreeting('hello'))
  ->> {type: 'hi/SET_GREETING', payload: 'hello' }

  console.log(hiSlice.actions.setWaves(5))
  ->> {type: 'hi/SET_WAVES', payload: 5 }

  console.log(hiSlice.actions.resetHi())
  ->> {type: 'hi/RESET_HI', payload: undefined }

  // again note that you can destructure the returned actions object

```

### Return value

createSlice return an object with the following fields

#### reducer

A reducer function, works exactly the same as a standard reducer

#### actions

An object of action creators with the same name as the corresponding case.
You can see this in action in the hiSlice example above, it's actions object has the following type signature

```js

  {
    setGreeting: (payload: string) => ({type: 'hi/SET_GREETING', payload: string})

    setWaves: (payload: number) => ({type: 'hi/SET_GREETING', payload: number})

    resetHi: ()=> ({type: 'hi/RESET_HI', payload: undefined})
  }

```

#### selectors

An object containing the generated selector(s), always includes a selector called getSlice that selects it's slice state from the state, if the initial state is an object additional selectors are generated with the same names as the corresponding initial state keys

```js
import { createSlice } from '@redux-ts-starter-kit/core';
import { SliceState, Actions, State } from './types';

const formSlice = createSlice<SliceState, Actions, State>({
      cases: {
        setName: (state, name) => { state.name = name},
        setSurname: (state, surname) => { state.surName = surname},
        setMiddlename: (state, middlename) => { state.Middlename = middlename}
      },
      slice: 'form',
      initialState: {
        name: '',
        surname: '',
        middlename: '',
      },
    })

     const state = {
      counter: 5,
      random: 'random',
      auth: {
        idToken: "a random token",
        userId: "a user id"
      }
      form: {
        name: "John",
        surname: "Doe",
        middlename: "Wayne"
      }
    };

 console.log(formSlice.selectors.getSlice(state))
 ->> {
    name: "John",
    surname: "Doe",
    middlename: "Wayne"
  }

 console.log(formSlice.selectors.name(state))
->> 'John'

 console.log(formSlice.selectors.middlename(state))
->> 'Wayne'

 console.log(formSlice.selectors.surname(state))
->> 'Doe'

```

## Other Exports

### createAction

This is the helper function that `createSlice` uses to create an action. It is also useful to use
when not using createSlice because when stringifying the function it will return the action type.
This allows developers to not have to worry about passing around action types, instead they simply
pass around action creators for reducers, sagas, etc.

```js
import { createAction } from '@redux-ts-starter-kit/core';

const increment = createAction('INCREMENT');
console.log(increment);
 ->> 'INCREMENT'
console.log(increment(2));
->> { type: 'INCREMENT', payload: 2 };

const storeDetails = createAction('STORE_DETAILS');
console.log(storeDetails);
->> 'STORE_DETAILS'
console.log(storeDetails({ name: 'John', surname: 'Doe' }));
 ->> { type: 'INCREMENT', payload: {name: 'John', surname: 'Doe'} };
```

### createReducer

This is the helper function that `createSlice` uses to create a reducer. This function maps action types
to reducer functions. It will return a reducer.

```js
import { createReducer } from '@redux-ts-starter-kit/core';

const counter = createReducer({
  initialState: 0,
  cases: {
    INCREMENT: (state) => state + 1,
    DECREMENT: (state) => state - 1,
    MULTIPLY: (state, payload) => state * payload,
  }
});

console.log(counter(2, { type: 'MULTIPLY': payload: 5 }));
// -> 10
```
