// const allCapsSnakeCase = (string: string) => {
//   return string.replace(/([a-z])([A-Z])/g, '$1_$2').toUpperCase();
// };

export const createActionType = <S extends string|number|symbol,A extends string|number|symbol>(
  slice: S,
  action: A,
) => {
  return slice != null && slice !== ''
    ? `${String(slice)}/${String(action)}`
    : String(action);
};
