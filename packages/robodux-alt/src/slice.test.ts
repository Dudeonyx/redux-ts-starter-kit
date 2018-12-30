import createSlice, { createSliceAlt } from './slice';

describe('createSlice', () => {
  describe('when slice is empty', () => {
    type State = number;
    interface Actions {
      increment: null;
      multiply: number;
    }
    const { actions, reducer, selectors } = createSlice<State, Actions>({
      actions: {
        increment: (state) => state + 1,
        multiply: (state, payload) => state * payload,
      },
      initialState: 0,
    });

    it('should create increment action', () => {
      expect(actions.hasOwnProperty('increment')).toBe(true);
    });

    it('should create multiply action', () => {
      expect(actions.hasOwnProperty('multiply')).toBe(true);
    });

    it('should have the correct action for increment', () => {
      expect(actions.increment()).toEqual({
        type: 'increment',
        payload: undefined,
      });
    });

    it('should have the correct action for multiply', () => {
      expect(actions.multiply(3)).toEqual({
        type: 'multiply',
        payload: 3,
      });
    });

    describe('when using reducer', () => {
      it('should return the correct value from reducer with increment', () => {
        expect(reducer(undefined, actions.increment())).toEqual(1);
      });

      it('should return the correct value from reducer with multiply', () => {
        expect(reducer(2, actions.multiply(3))).toEqual(6);
      });
    });

    describe('when using selectors', () => {
      it('should create selector with correct name', () => {
        expect(selectors.hasOwnProperty('getState')).toBe(true);
      });

      it('should return the slice state data', () => {
        expect(selectors.getState(2)).toEqual(2);
      });
    });
  });

  describe('when passing slice', () => {
    const { actions, reducer, selectors } = createSlice({
      actions: {
        increment: (state) => state + 1,
        multiply: (state: number, payload: number) => state * payload,
      },
      initialState: 0,
      slice: 'cool',
    });

    it('should create increment action', () => {
      expect(actions.hasOwnProperty('increment')).toBe(true);
    });
    it('should create multiply action', () => {
      expect(actions.hasOwnProperty('multiply')).toBe(true);
    });

    it('should have the correct action for increment', () => {
      expect(actions.increment()).toEqual({
        type: 'cool/increment',
        payload: undefined,
      });
    });
    it('should have the correct action for multiply', () => {
      expect(actions.multiply(5)).toEqual({
        type: 'cool/multiply',
        payload: 5,
      });
    });

    it('should return the correct value from reducer', () => {
      expect(reducer(undefined, actions.increment())).toEqual(1);
    });
    it('should return the correct value from reducer when multiplying', () => {
      expect(reducer(5, actions.multiply(5))).toEqual(25);
    });

    it('should create selector with correct name', () => {
      expect(selectors.hasOwnProperty('getCool')).toBe(true);
    });

    it('should return the slice state data', () => {
      expect(selectors.getCool({ cool: 2 })).toEqual(2);
    });
  });

  describe('createSliceAlt when initialState is an object', () => {
    const { selectors } = createSliceAlt({
      actions: {
        setName: (state, name) => { state.name = name},
        setSurName: (state, surName) => { state.surName = surName},
        setMiddleName: (state, MiddleName) => { state.MiddleName = MiddleName}
      },
      slice: 'form',
      initialState:{
        name: '',
        surName: '',
        middleName: '',
      },
    })

    const state ={
      form : {
        name: 'John',
        surName: 'Doe',
        middleName: 'Wayne',
      }
    }
    const all = selectors.getForm(state)

    it('should create selector with correct name', () => {
      expect(selectors.hasOwnProperty('getForm')).toBe(true);
    });
    it('should create sub selector with correct name', () => {
      expect(selectors.hasOwnProperty('getFormName')).toBe(true);
    });
    it('should create sub selector with correct name', () => {
      expect(selectors.hasOwnProperty('getFormSurName')).toBe(true);
    });
    it('should create sub selector with correct name', () => {
      expect(selectors.hasOwnProperty('getFormMiddleName')).toBe(true);
    });

    it('should select the state slice', ()=>{
      expect(selectors.getForm(state)).toEqual(state.form)
    })
    it('should select the state slice name field', ()=>{
      expect(selectors.getFormName(state)).toEqual('John')
    })
    it('should select the state slice surName field', ()=>{
      expect(selectors.getFormSurName(state)).toEqual('Doe')
    })
    it('should select the state slice middleName field', ()=>{
      expect(selectors.getFormMiddleName(state)).toEqual('Wayne')
    })
  })
  

  describe('when mutating state object', () => {
    const { actions, reducer } = createSlice({
      actions: {
        setUserName: (state, payload) => {
          state.user = payload;
        },
      },
      initialState: { user: '' },
      slice: 'user',
    });

    it('should set the username', () => {
      expect(reducer({ user: 'hi' }, actions.setUserName('eric'))).toEqual({
        user: 'eric',
      });
    });
  });
});
