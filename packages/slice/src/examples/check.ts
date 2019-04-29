import { ActionsMap, Slice } from '../slice';
import { Draft } from 'immer';

type CaseReducer<SS, A> = (
  state: Draft<SS>,
  payload?: A,
) => SS | void | undefined;
export type Cases<SS = any, Ax = any> = {
  [K in keyof Ax]: CaseReducer<SS, Ax[K]>
};

interface In<A = any, S = any> {
  cases: Cases<S, A>;
  state: S;
}
function test<A extends ActionsMap<unknown>, S>({
  cases,
  state,
}: In<A, S>): Slice<A, S>;
function test<A extends ActionsMap<unknown>, S>({
  cases,
  state,
}: In<A, S>): Slice<A, S>;
function test<A extends ActionsMap, S>({ cases, state }: In<A, S>) {
  return null as any;
}

const { actions } = test({
  state: [] as string[],
  cases: {
    g: (state, payload: string) => state,
    h: (state, payload) => state,
    j: (state) => state,
  },
});
