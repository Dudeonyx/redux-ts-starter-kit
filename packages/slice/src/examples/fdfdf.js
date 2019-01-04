import robodux, { createSliceAlt } from '../src/';

const { selectors, actions } = robodux({
  actions: {
    setName: (state, name) => {
      state.name = name;
    },
    setSurname: (state, surname) => {
      state.surname = surname;
    },
    setMiddlename: (state, middlename) => {
      state.middlename = middlename;
    },
  },
  slice: 'form',
  initialState: {
    name: '',
    surname: '',
    middlename: '',
  },
});

const state = {
  form: {
    name: 'John',
    surname: 'Doe',
    middlename: 'Wayne',
  },
};
const all = selectors.getForm(state);
