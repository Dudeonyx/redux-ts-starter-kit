import memoize from 'memoize-state';
import * as reselect from 'reselect';

export * from 'reselect';
export * from './action';
export * from './reducer';
export { produce as createNextState } from 'immer';
export { default as memoize } from 'memoize-state';
export * from './slice';
export * from './types';

export const createSelector = reselect.createSelectorCreator(memoize);

// export { makeTypeSafeSelector } from './selector';
