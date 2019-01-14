# CHANGES

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
