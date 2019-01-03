import isPlainObject from './isPlainObject';
import { Action } from './types';
import { AnyAction } from 'redux';

export function isPlain(
  val: any,
): val is undefined | string | boolean | number | any[] | { [x: string]: any } {
  return (
    typeof val === 'undefined' ||
    typeof val === 'string' ||
    typeof val === 'boolean' ||
    typeof val === 'number' ||
    Array.isArray(val) ||
    isPlainObject(val)
  );
}

const NON_SERIALIZABLE_STATE_MESSAGE = [
  'A non-serializable value was detected in the state, in the path: `%s`. Value: %o',
  'Take a look at the reducer(s) handling this action type: %s.',
  '(See https://redux.js.org/faq/organizing-state#can-i-put-functions-promises-or-other-non-serializable-items-in-my-store-state)',
].join('\n');

const NON_SERIALIZABLE_ACTION_MESSAGE = [
  'A non-serializable value was detected in an action, in the path: `%s`. Value: %o',
  'Take a look at the logic that dispatched this action:  %o.',
  '(See https://redux.js.org/faq/actions#why-should-type-be-a-string-or-at-least-serializable-why-should-my-action-types-be-constants)',
].join('\n');

export function findNonSerializableValue<O extends { [x: string]: any }>(
  obj: O,
  path: string[] = [],
  isSerializable = isPlain,
): false | { keyPath: string; value: O | O[keyof O] } {
  let foundNestedSerializable;

  if (!isSerializable(obj)) {
    return { keyPath: path.join('.') || '<root>', value: obj };
  }

  for (let property in obj) {
    if (obj.hasOwnProperty(property)) {
      const nestedPath = path.concat(property);
      const nestedValue = obj[property];

      if (!isSerializable(nestedValue)) {
        return { keyPath: nestedPath.join('.'), value: nestedValue };
      }

      if (typeof nestedValue === 'object') {
        foundNestedSerializable = findNonSerializableValue(
          nestedValue,
          nestedPath,
        );

        if (foundNestedSerializable) {
          return <any>foundNestedSerializable;
        }
      }
    }
  }

  return false;
}

export default function createSerializableStateInvariantMiddleware(
  options: {
    isSerializable?:
      | ((
          val: any,
        ) => val is
          | string
          | number
          | boolean
          | any[]
          | { [x: string]: any }
          | undefined)
      | undefined;
  } = {},
) {
  const { isSerializable = isPlain } = options;

  return (storeAPI: { getState: () => any }) => (
    next: (arg0: AnyAction) => AnyAction,
  ) => (action: Action) => {
    const foundActionNonSerializableValue = findNonSerializableValue(
      action,
      [],
      isSerializable,
    );

    if (foundActionNonSerializableValue) {
      const { keyPath, value } = foundActionNonSerializableValue;

      console.error(NON_SERIALIZABLE_ACTION_MESSAGE, keyPath, value, action);
    }

    const result = next(action);

    const state = storeAPI.getState();

    const foundStateNonSerializableValue = findNonSerializableValue(state);

    if (foundStateNonSerializableValue) {
      const { keyPath, value } = foundStateNonSerializableValue;

      console.error(
        NON_SERIALIZABLE_STATE_MESSAGE,
        keyPath,
        value,
        action.type,
      );
    }

    return result;
  };
}
