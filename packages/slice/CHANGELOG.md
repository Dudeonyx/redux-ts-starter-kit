# CHANGES

## > @v1.0.1

* changed re-exports to fix commonjs issue

* Independent versioning

* Action types in createSlice are no longer automatically namespaced, This is to ensure better type safety because Typescript currently cannot concatenate string literal types, and this is a Typescript focused lib.

* Removed dependence on redux state tree type param for better reusabilty

* Replaced redux state type param with SliceName string literal param.

* Tweaked type `ActionCreators`  to detect `any` and work well with makeActionCreators.

* Added `type` property to action creators which returns a string literal

* Renamed type `ActionsAny` to a less confusing `ActionsMap`

## v1.0.1

* moved `typings-checker` to devDependencies

## v1.0.0

* merged changes from  `alpha`

* minor internal changes for better unit testing

## v1.0.0-alpha.0

* Experimental `State` type inference

* removed `NoEmptyArray` type

## v0.1.13

* added JSDoc comments

* Cleaned up typings

## v0.1.12

* fixed issues occurring when `slice` is initialised outside `createSlice` with `let`

* `createSlice` now requires three type params rather than 2 - 3. Note: It can still be used without type params

## v0.1.11

* fixed issues with exported Dispatch type
