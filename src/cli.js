import yargs from 'yargs';
import { resolve as resolvePath, extname, dirname } from 'path';
import { homedir } from 'os';
import glob from 'glob';
import { promisify } from 'bluebird';
import { watch as watchFiles } from 'chokidar';
import sketchExpander from './index';

const globAsync = promisify(glob);

const {
  argv: {
    input,
    output,
    watch,
    root,
  } = {},
} = yargs
.usage('$0 [options]')
.options({
  input: {
    alias: 'i',
    default: [],
    describe: 'Sketch files to be expanded; can be\na globs.\n',
    type: 'array',
  },
  output: {
    alias: 'o',
    default: './',
    describe: 'Output directory for Sketch files\nto be expanded to.\n',
    type: 'string',
  },
  watch: {
    alias: 'w',
    default: [],
    describe: 'Directories to watch for changes in\nSketch files; can be a globs.\n',
    type: 'array',
  },
  root: {
    alias: 'r',
    default: null,
    describe: 'Directory to use as a root. Copies\ndirectory structure beneath root to\noutput.\n',
    type: 'string',
  },
}).help('help', 'Show help.\n');

const getRelativePath = path => (
  resolvePath(
    process.cwd(),
    path.replace(/^~/, homedir()),
  )
);

const getGlobbedPaths = globs => globs.reduce(
  async (allPromises, nextGlob) => {
    const allPaths = await Promise.resolve(allPromises);
    const newPaths = await globAsync(getRelativePath(nextGlob));
    return [...allPaths, ...newPaths];
  },
  [],
);

const unzipPaths = async paths => {
  const allGlobbedPaths = await getGlobbedPaths(paths);
  allGlobbedPaths.forEach(
    path => {
      let outputPath = getRelativePath(output);
      if (root) {
        const newRelativePath = dirname(path).replace(getRelativePath(root), '.');
        outputPath = getRelativePath(resolvePath(getRelativePath(output), newRelativePath));
      }

      console.log(`Expanding ${path} to ${outputPath}.`); // eslint-disable-line no-console

      sketchExpander(path, outputPath);
    },
  );
};

(async () => {
  if (input.length > 0) {
    await unzipPaths(input);
  }

  if (watch.length > 0) {
    watchFiles(
      await getGlobbedPaths(watch),
      {
        ignored: (path, stats) => {
          if (stats && stats.isFile() && extname(path) !== '.sketch') return true;
          return false;
        },
        ignoreInitial: true,
      },
    )
    .on('add', path => unzipPaths([path]))
    .on('change', path => unzipPaths([path]));
    // TODO: Delete directory after file is deleted
  }
})().catch(
  err => console.error(err), // eslint-disable-line no-console
);
