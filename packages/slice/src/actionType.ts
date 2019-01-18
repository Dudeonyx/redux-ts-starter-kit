const allCapsSnakeCase = (string: string) => {
  return string.replace(/([a-z])([A-Z])/g, '$1_$2').toUpperCase();
};

export const createActionType = (
  slice: string | number | symbol,
  action: string | number | symbol,
) => {
  return slice != null && slice !== ''
    ? `${String(slice)}/${allCapsSnakeCase(String(action))}`
    : allCapsSnakeCase(String(action));
};
