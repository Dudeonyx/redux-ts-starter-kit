import {
  getAuth,
  getAuth$,
  getAuth$2,
  ordersSelectors,
  //   hiSelector$,
  hiSelectors,
  store,
} from './types';

console.group('Selectors!!!');
console.log('getAuth: ', getAuth(store.getState()), '\n\n\n');
console.log('getAuth$: ', getAuth$(store.getState()), '\n\n\n');
console.log('getAuth$2: ', getAuth$2(store.getState()), '\n\n\n');
console.log(
  'ordersSelectors.getSlice: ',
  ordersSelectors.getSlice(store.getState()),
  '\n\n\n',
);
console.log(
  'hiSelectors.getSlice: ',
  hiSelectors.getSlice(store.getState()),
  '\n\n\n',
);
