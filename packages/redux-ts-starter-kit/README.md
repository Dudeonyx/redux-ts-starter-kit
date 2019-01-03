# redux-ts-starter-kit [![Build Status](https://travis-ci.org/Dudeonyx/redux-ts-starter-kit.svg?branch=master)](https://travis-ci.org/Dudeonyx/redux-ts-starter-kit)

**A simple set of tools to make using Redux easier**

`npm install redux-starter-kit`

(Special thanks to Github user @shotak for donating to the package name.)

### Purpose

The `redux-ts-starter-kit` package is intended to help address three common complaints about Redux:

* "Configuring a Redux store is too complicated"
* "I have to add a lot of packages to get Redux to do anything useful"
* "Redux requires too much boilerplate code"
* "Using redux with typescript is boilerplate hell"

We can't solve every use case, but in the spirit of [`create-react-app`](https://github.com/facebook/create-react-app) and [`apollo-boost`](https://dev-blog.apollodata.com/zero-config-graphql-state-management-27b1f1b3c2c3), we can try to provide some tools that abstract over the setup process and handle the most common use cases, as well as include some useful utilities that will let the user simplify their application code.

This package is _not_ intended to solve every possible complaint about Redux, and is deliberately limited in scope. It does _not_ address concepts like "reusable encapsulated Redux modules", data fetching, folder or file structures, managing entity relationships in the store, and so on.

### What's Included

`redux-starter-kit` includes:

* A `configureStore()` function with simplified configuration options. It can automatically combine your slice reducers, adds whatever Redux middleware you supply, includes `redux-thunk` by default, and enables use of the Redux DevTools Extension.
* A `createReducer()` utility that lets you supply a lookup table of action types to case reducer functions, rather than writing switch statements. In addition, it automatically uses the [`immer` library](https://github.com/mweststrate/immer) to let you write simpler immutable updates with normal mutative code, like `state.todos[3].completed = true`.
* A `createAction()` utility that returns an action creator function for the given action type string. The function itself has `toString()` defined, so that it can be used in place of the type constant.
* A `createSlice()` function that accepts a set of reducer functions, a slice name, and an initial state value, and automatically generates corresponding action creators, types, and simple selector functions.


One of the biggest complaints developers have with redux is the amount of
boilerplate and new concepts they have to learn to use it.  `robodux` attempts
to simplify the boilerplate by automatically configuring actions, reducers, and
selectors.  The way it works is `robodux` will take a list of functions that
correspond to how state should be updated and then create action types, action
creators, and basic selectors for the developer to use.  This library tries to
not make too many assumptions about how developers use redux.  It does not
do anything magical, simply automates the repetitive tasks with redux.

Under the hood every reducer created by `createSlice` leverages [immer](https://github.com/mweststrate/immer) to update the store,
which means reducers are allowed to mutate the state directly.

## Features

* Automatically creates actions, reducer, and selector based on `slice`
* Reducers leverage `immer` which makes updating state easy
* When stringifying action creators they return the action type
* Helper functions for manually creating actions and reducers
* Reducers do not receive entire action object, only payload

## Why not X?

This library was heavily inspired by [autodux](https://github.com/ericelliott/autodux) and [redux-starter-kit](https://github.com/markerikson/redux-starter-kit).
Note: This is an alternate branch of
The reason why I decided to create a separate library was primarily for:

* typescript support
* creating reducers with `immer`
* no external dependencies besides `immer`
* create action helper
* create reducer helper

This is an alternate branch of robodux updated to use typescript 3.2.2 and uses simpler actions interfaces for better typechecks, and also includes an experimental createSliceAlt function that does the same thing as robodux except that it creates multiple selectors when the initial state is an object

## Usage

```js
import robodux from 'robodux-alt';
import { createStore, combineReducers } from 'redux';

interface User {
  name: string;
}

interface State {
  user: User;
  counter: number;
}

interface CounterActions {
  increment: number;
  decrement: number;
  multiply: number;
}

// You can destructure and export the reducer, action creators and selectors

const counter = robodux<number, CounterActions, State>({
  slice: 'counter', // slice is optional could be blank ''
  initialState: 0,
  actions: {
    increment: (state) => state + 1,
    decrement: (state) => state - 1,
    multiply: (state, payload) => state * payload,
  },
});

interface UserActions {
  setUserName: string;
}

const user = robodux<User, UserActions, State>({
  slice: 'user', // slice is optional could be blank ''
  initialState: { name: '' },
  actions: {
    setUserName: (state, payload) => {
      state.name = payload; // mutate the state all you want with immer
    },
  }
})

const reducer = combineReducers({
  counter: counter.reducer,
  user: user.reducer,
});

const store = createStore(reducer);

store.dispatch(counter.actions.increment());
// -> { counter: 1, user: { name: '' } }
store.dispatch(counter.actions.increment());
// -> { counter: 2, user: { name: '' } }
store.dispatch(counter.actions.multiply(3));
// -> { counter: 6, user: { name: '' } }
console.log(`${counter.actions.decrement}`);
// -> counter/decrement
store.dispatch(user.actions.setUserName('eric'));
// -> { counter: 6, user: { name: 'eric' } }
const state = store.getState();
console.log(counter.selectors.getCounter(state));
// -> 6
console.log(user.selectors.getUser(state));
// -> { name: 'eric' }
```

## Types

`robodux` accepts three generics: `SliceState`, `Actions`, `State`.

`SliceState` is the state shape of the particular slice created with `robodux`.  If there is no
slice passed to the state, then this will assume that this is the entire state shape.

`Actions` helps improve autocompelete and typing for the `actions` object returned from `robodux`.
Supply an interface where they keys are the action names and the values are the payload types, which should be null if the action takes no payload.

`State` is the entire state shape for when a slice is used with `robodux`.  This helps type the selectors we
return which requires the entire state as the parameter and not simply the slice state.

```js
import robodux from 'robodux-alt';
import { Action } from 'redux';

interface SliceState {
  test: string;
  wow: number;
}

interface State {
  hi: SliceState;
  other: boolean;
}

interface Actions {
  set: SliceState;
  reset: null;
}

const defaultState = {
  test: '',
  wow: 0,
};

const { actions, selectors, reducer } = robodux<SliceState, Actions, State>({
  slice: 'hi',
  actions: {
    set: (state: SliceState, payload: SliceState) => payload,
    reset: () => defaultState,
  },
  initialState: defaultState,
});

const val = selectors.getHi({ hi: defaultState, other: true }); // typechecks param as State
actions.set({ test: 'ok', wow: 0 }); // autocomplete and type helping for payload, typeerror if called without payload
actions.reset(); // typechecks to ensure action is called without params
```

## CREATESLICE-ALT

Behaves exactly like the default robodux export except that when the initial state is an object it generates additional selectors for each key in the state object.

The additional selectors are name like: `get${slice}${key}`

So if you have an intial state object in a slice called `auth` and with keys `userId` and `idToken`, the selectors created would be: `getAuth`, `getAuthUserId` and `getAuthIdToken`

Note: this feature is kept seperate because the it hasn't undergone rigorous testing and the selectors type inference is not yet satisfactory to me

### Usage

```js
import { createSliceAlt } from 'robodux-alt';
import { createStore } from 'redux';

interface SliceState {
  name: string;
  surname: string;
  middleName: string;
}

interface Actions {
  setName: string;
  setSurname:string;
  setMiddlename: string;
}

interface State {
  form: SliceState;
}

const { reducer, actions, selectors } = createSliceAlt<SliceState, Actions, State>({
      actions: {
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

const state ={
  form : {
    name: 'John',
    surname: 'Doe',
    middlename: 'Wayne',
  }
}

console.log(selectors.getForm(state))
// -> {
//      name: 'John',
//      surname: 'Doe',
//      middlename: 'Wayne',
//    }

console.log(selectors.getFormName(state))
// -> 'John'

console.log(selectors.getFormSurname(state))
// -> 'Doe'

console.log(selectors.getFormMiddlename(state))
// -> 'Wayne'


```

## Slice Helpers

There are some common slices that I find myself creating over and over again.
These helpers will further help reduce the amount of repetitive code written for
redux.

### map slice (v1.2.0)

These are common operations when dealing with a slice that is a hash map.

```js
interface State {
  [key: string]: string;
}

interface Actions {
  addTest: (p: State) => Action<State>;
  setTest: (p: State) => Action<State>;
  removeTest: (p: string[]) => Action<string[]>;
  resetTest: () => Action;
}

const slice = 'test';
const { reducer, actions } = mapSlice<State, Actions>({ slice });
const state = { 3: 'three' };

store.dispatch(
  actions.addTest({
    1: 'one',
    2: 'two',
  })
);
/* {
  1: 'one',
  2: 'two',
  3: 'three,
} */

store.dispatch(
  actions.setTest({ 4: 'four', 5: 'five', 6: 'six' })
)
/* {
  4: 'four',
  5: 'five',
  6: 'six',
} */

store.dispatch(
  actions.removeTest(['5', '6'])
)
/* {
  4: 'four'
} */

store.dispatch(
  actions.resetTest()
)
// {}

```

## API

### robodux

This is the default export for robodux and will automatically create actions, reducer, and selectors
for you.

### createAction

This is the helper function that `robodux` uses to create an action.  It is also useful to use
when not using robodux because when stringifying the function it will return the action type.
This allows developers to not have to worry about passing around action types, instead they simply
pass around action creators for reducers, sagas, etc.

```js
import { createAction } from 'robodux-alt';

const increment = createAction('INCREMENT');
console.log(increment);
// -> 'INCREMENT'
console.log(increment(2));
// { type: 'INCREMENT', payload: 2 };
const storeDetails = createAction('STORE_DETAILS');
console.log(storeDetails);
// -> 'STORE_DETAILS'
console.log(storeDetails({name: 'John', surname: 'Doe'}));
// { type: 'INCREMENT', payload: {name: 'John', surname: 'Doe'} };
```

### createReducer

This is the helper function that `robodux` uses to create a reducer.  This function maps action types
to reducer functions.  It will return a reducer.

```js
import { createReducer } from 'robodux-alt';

const counter = createReducer({
  initialState: 0,
  actions: {
    INCREMENT: (state) => state + 1,
    DECREMENT: (state) => state - 1,
    MULTIPLY: (state, payload) => state * payload,
  }
});

console.log(counter(2, { type: 'MULTIPLY': payload: 5 }));
// -> 10
```
