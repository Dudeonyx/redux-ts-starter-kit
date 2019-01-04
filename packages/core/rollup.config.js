import typescript from 'rollup-plugin-typescript2';
import pkg from './package.json';
import replace from 'rollup-plugin-replace';
export default {
  input: 'src/index.ts',
  output: [
    {
      file: pkg.main,
      format: 'cjs',
    },
    {
      file: pkg.module,
      format: 'es',
    },
  ],
  external: [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {}),
  ],
  plugins: [
    typescript(),
    replace({
      'process.env.NODE_ENV': JSON.stringify('development'),
    }),
  ],
};
