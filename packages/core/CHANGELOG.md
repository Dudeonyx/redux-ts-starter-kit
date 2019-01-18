# CHANGES

## v1.0.1

* moved `typings-checker` to devDependencies

## v1.0.0

* merged changes from  `alpha`

* minor internal changes for better unit testing, no enduser effects

* `configureStore` returns a `store` with `ThunkDispatch` by default

* `configureStore` accepts 1~5 type params, `State` - `Action` - `Ext` - `StateExt` - `DispatchExt`

## v1.0.0-alpha.0

* `configureStore` no longer returns a tuple array, just the `store`

* Better fix for `preloadedState` edge case

## v0.1.13

* fixed `preloadedState` type inference

* added JSDoc comments

* Cleaned up typings

## v0.1.12

* fixed issues occurring when `slice` is initialised outside `createSlice` with `let`

* `createSlice` now requires three type params rather than 2 - 3. Note: It can still be used without type params

## v0.1.11

* fixed issues with exported Dispatch type
