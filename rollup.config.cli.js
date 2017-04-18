import rollupConfig from './rollup.config';
import { resolve as resolvePath } from 'path';

export default (
  Object.assign(
    {},
    rollupConfig,
    {
      entry: './src/cli.js',
      dest: './dist/cli.js',
      banner: '#!/usr/bin/env node',
      external: [
        ...rollupConfig.external,
        resolvePath(__dirname, './src/index.js'),
        'yargs',
        'os',
      ],
    } // eslint-disable-line comma-dangle
  )
);
