import typescript from 'rollup-plugin-typescript2';
import resolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import replace from 'rollup-plugin-replace';
import { terser } from 'rollup-plugin-terser';
export default function generateConfig({
  input = './src/index.ts',
  pkg = require('./package.json'),
  name = '',
} = {}) {
  const cjsEs = {
    input,
    output: [
      {
        file: pkg.main,
        format: 'cjs',
        sourcemap: true,
      },
      {
        file: pkg.module,
        format: 'es',
        sourcemap: true,
      },
    ],
    external: [...Object.keys(pkg.dependencies || {}), ...Object.keys(pkg.peerDependencies || {})],
    plugins: [
      typescript({
        typescript: require('typescript'),
      }),
      terser(),
    ],
  };
  if (!name) {
    return [cjsEs];
  }
  const umd = {
    input,
    output: {
      name,
      file: pkg.browser,
      format: 'umd',
      sourcemap: true,
    },
    plugins: [
      resolve(),
      commonjs({
        namedExports: {
          'node_modules/curriable/dist/curriable.js': ['curry', '__'],
        },
      }),
      typescript({
        typescript: require('typescript'),
        rollupCommonJSResolveHack: true,
      }),
      babel({
        exclude: 'node_modules/**',
      }),
      replace({
        'process.env.NODE_ENV': JSON.stringify('development'),
      }),
      terser(),
    ],
  };
  return [umd, cjsEs];
}
