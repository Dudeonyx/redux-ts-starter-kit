const allCapsSnakeCase = (string: string) =>
  string.replace(/([a-z])([A-Z])/g, '$1_$2').toUpperCase();
export const actionTypeBuilder = (slice: string) => (action: string) =>
  slice ? `${slice}/${allCapsSnakeCase(action)}` : allCapsSnakeCase(action);
