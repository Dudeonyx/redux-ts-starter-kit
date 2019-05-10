# @redux-ts-starter-kit/core [![Build Status](https://travis-ci.org/Dudeonyx/redux-ts-starter-kit.svg?branch=master)](https://travis-ci.org/Dudeonyx/redux-ts-starter-kit)

## A simple set of tools to make using Redux easier

### Installation

`npm install @redux-ts-starter-kit/core`

### Purpose

The `@redux-ts-starter-kit/core` package like the original `redux-starter-kit` package is intended to help address three common complaints about Redux:

- "Configuring a Redux store is too complicated"
- "I have to add a lot of packages to get Redux to do anything useful"
- "Redux requires too much boilerplate code"
- "Using redux with typescript is boilerplate hell"

We can't solve every use case, but in the spirit of [`create-react-app`](https://github.com/facebook/create-react-app) and [`apollo-boost`](https://dev-blog.apollodata.com/zero-config-graphql-state-management-27b1f1b3c2c3), we can try to provide some tools that abstract over the setup process and handle the most common use cases, as well as include some useful utilities that will let the user simplify their application code.

This package is _not_ intended to solve every possible complaint about Redux, and is deliberately limited in scope. It does _not_ address concepts like "reusable encapsulated Redux modules", data fetching, folder or file structures, managing entity relationships in the store, and so on.

### What's Included

`@redux-ts-starter-kit/core` includes:

- A `configureStore()` function with simplified configuration options. It can automatically combine your slice reducers, adds whatever Redux middleware you supply, includes `redux-thunk` by default, and enables use of the Redux DevTools Extension.

## Inspiration

This library was heavily inspired by [autodux](https://github.com/ericelliott/autodux), [robodux](https://github.com/neurosnap/robodux) and [redux-starter-kit](https://github.com/markerikson/redux-starter-kit).

## Example

```typescript
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


const store = configureStore({  
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
console.log(counter.selectors.selectSlice(state));
// -> 6
console.log(user.selectors.selectSlice(state));
// -> { name: 'eric' }
console.log(user.selectors.name(state));
// -> 'eric'
```

## configureStore API

  *Plagarised with love from [redux-starter-kit.js.org](https://redux-starter-kit.js.org/api/configurestore)*

  A friendlier abstraction over the standard Redux createStore function. Takes a single configuration object parameter, with the following options:

```typescript
function configureStore({
    // A single reducer function that will be used as the root reducer,
    // or an object of slice reducers that will be passed to combineReducers()
    reducer: Object<string, Function> | Function,
    // An array of Redux middlewares.  If not supplied, defaults to just redux-thunk.
    middleware: Array<MiddlewareFunction>,
    // Built-in support for devtools. Defaults to true.
    devTools: boolean,
    // Same as current createStore.
    preloadedState: State,
    // Same as current createStore.
    enhancer: ReduxStoreEnhancer,
})
```

### Basic Usage

```typescript
import { configureStore } from '@redux-ts-starter-kit/core'

import rootReducer from './reducers'

const store = configureStore({ reducer: rootReducer })
// The store now has redux-thunk added and the Redux DevTools Extension is turned on
```

### Full Example

```typescript
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

const store = configureStore({
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