import type { Dispatch } from 'redux';
import {
  auth,
  store,
  authLogout,
  authSuccess,
  authStart,
  getAuth,
  getAuthAuthenticating,
  getAuthIdToken,
  getAuthUserId,
} from './types';

const thunkAuthLogout = () => (dispatch: Dispatch) => {
  setTimeout(() => {
    dispatch(authLogout());
    console.log("\n\nThunk!!!\n\n You've been logged out!");
  }, 5000);
};
console.log('\n\n[auth object]\n', auth, '\n\n');

console.log('[authLogout action creator]\n', authLogout(), '\n');

console.log(
  '[authSuccess actionCreator]\n',
  authSuccess({ idToken: 'really Long Token', userId: "It's Me" }),
  '\n',
);

console.log(
  '\n[authStart action dispatched]\n',
  'Action: ',
  store.dispatch(authStart()),
  '\nNew Auth State: ',
  getAuth(store.getState()),
  '\n',
  'authenticating selector: ',
  getAuthAuthenticating(store.getState()),
  '\n',
);

console.log(
  '\n[start: authSuccess action dispatched]\n',
  'Action: ',
  store.dispatch(
    authSuccess({ idToken: 'really Long Token', userId: "It's Me" }),
  ),
  '\nNew Auth State: ',
  getAuth(store.getState()),
  '\nAuth idToken selector: ',
  getAuthIdToken(store.getState()),
  '\nAuth userId selector: ',
  getAuthUserId(store.getState()),
  "\n*** You've logged in successfully!***\n",
);

console.log('\n[full State]\n', store.getState());

console.log(
  '\n[Thunk dispatched]\n',
  '\nAction: ',
  store.dispatch(thunkAuthLogout() as any),
  '\nUnchanged Auth State: ',
  getAuth(store.getState()),
  '\n***************\n',
);

// console.log(
//   '\n\n\nrootReducer Check: ',
//   store.rootReducer(store.getState(), { type: 'dfdf' }),
// );
