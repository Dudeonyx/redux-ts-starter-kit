export const PROXY_REST: symbol;
export function collectShallows(lines: any): any;
export function collectValuables(lines: any): any;
export function deproxify(object: any): any;
export function drainDifference(): any;
export function get(target: any, path: any): any;
export function getProxyKey(object: any): any;
export function isProxyfied(object: any): any;
export function proxyArrayRest(state: any, fromIndex: any): any;
export function proxyCompare(a: any, b: any, locations: any): any;
export function proxyEqual(a: any, b: any, affected: any): any;
export function proxyObjectRest(state: any, excludingKeys: any): any;
export function proxyShallow(a: any, b: any, affected: any): any;
export function proxyShallowEqual(a: any, b: any, locations: any): any;
export function proxyState<S>(
  state: S,
): {
  state: S;
  affected: string[];
  seal: () => void;
  unseal: () => void;
  replaceState: (newState: S) => S;
  reset: () => void;
};
export function sourceMutationsEnabled(flag: any): any;
export function spreadGuardsEnabled(flag: any): any;
export function withProxiesDisabled(fn: any): any;
