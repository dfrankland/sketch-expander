import babel from 'rollup-plugin-babel';

export default {
  entry: './src/index.js',
  format: 'cjs',
  external: [
    'bluebird',
    'chokidar',
    'fs-extra',
    'glob',
    'yauzl',
    'path',
    'json-stable-stringify',
  ],
  plugins: [
    babel({
      babelrc: false,
      presets: [
        [
          'env',
          {
            modules: false,
            targets: {
              node: 6,
            },
          },
        ],
        'stage-0',
      ],
    }),
  ],
  dest: './dist/index.js',
};
