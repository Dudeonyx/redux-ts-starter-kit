import { ActionsMap, Slice } from '../slice';
import { Draft } from 'immer';

type IncreaseNum<N extends number> = N extends 0
  ? 1
  : N extends 1
  ? 2
  : N extends 2
  ? 3
  : N extends 3
  ? 4
  : N extends 4
  ? 5
  : N extends 5
  ? 6
  : N extends 6
  ? 7
  : N extends 7
  ? 8
  : never;

type Scale<
  S extends string[] | ReadonlyArray<string>,
  Start extends number,
  Max extends number,
  Fin
> = Start extends Max
  ? Fin
  : { [K in S[Start]]: Scale<S, IncreaseNum<Start>, Max, Fin> };

type GetArrayLength<S extends any[] | ReadonlyArray<any>> = S extends {
  length: infer L;
}
  ? L
  : never;

const safeGet = <O extends { [x: string]: any }, K extends string>(
  object: O,
  key: K,
): O[K] => (object ? object[key] : undefined);

type Getter<
  P extends string[],
  O extends { [s: string]: any }
> = GetArrayLength<P> extends 0
  ? O
  : GetArrayLength<P> extends 1
  ? O[P[0]]
  : GetArrayLength<P> extends 2
  ? O[P[0]][P[1]]
  : GetArrayLength<P> extends 3
  ? O[P[0]][P[1]][P[2]]
  : GetArrayLength<P> extends 4
  ? O[P[0]][P[1]][P[2]][P[3]]
  : GetArrayLength<P> extends 5
  ? O[P[0]][P[1]][P[2]][P[3]][P[4]]
  : GetArrayLength<P> extends 6
  ? O[P[0]][P[1]][P[2]][P[3]][P[4]][P[5]]
  : GetArrayLength<P> extends 7
  ? O[P[0]][P[1]][P[2]][P[3]][P[4]][P[5]][P[6]]
  : GetArrayLength<P> extends 8
  ? O[P[0]][P[1]][P[2]][P[3]][P[4]][P[5]][P[6]][P[7]]
  : never;

function makeGetter<
  P extends string[] & { length: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 }
>(...paths: P) {
  return <O extends Scale<P, 0, GetArrayLength<P>, any>>(
    object: O,
  ): Getter<P, O> => getter(paths, object);
}
function getter<
  P extends string[] & { length: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 },
  O extends Scale<P, I, GetArrayLength<P>, any>,
  I extends number = 0
>(paths: P, object: O, index: I = 0 as I): Getter<P, O> {
  const key = paths[index];
  const nextIndex = index + 1;
  if (paths.length === nextIndex) {
    return safeGet(object, key);
  }
  return getter(paths, safeGet(object, key), nextIndex);
}

const ff = makeGetter();

const newLocal = {
  hello: {
    world: 'hello',
  },
  yolo: '',
};
const gs = ff(newLocal);
