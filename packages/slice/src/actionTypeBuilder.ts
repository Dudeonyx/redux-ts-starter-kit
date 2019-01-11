const allCapsSnakeCase = (string: string) =>
  string.replace(/([a-z])([A-Z])/g, '$1_$2').toUpperCase();
export const actionTypeBuilder = (slice: string | number | symbol) => {
  return (action: string | number | symbol) => {
    return slice != null && slice !== ''
      ? `${String(slice)}/${allCapsSnakeCase(String(action))}`
      : allCapsSnakeCase(String(action));
  };
};
