import yauzl from 'yauzl';
import fs from 'fs-extra';
import { dirname, resolve as resolvePath, extname } from 'path';
import { promisifyAll } from 'bluebird';
import stringify from 'json-stable-stringify';

const { openAsync } = promisifyAll(yauzl);
const { mkdirpAsync } = promisifyAll(fs);

export default async (pathToSketchFile, outputDirectory) => {
  // Check that Sketch file is good
  if (extname(pathToSketchFile) !== '.sketch') {
    console.warn(`${pathToSketchFile} might not be a sketch file!`); // eslint-disable-line no-console
    return;
  }
  try {
    await fs.accessAsync(pathToSketchFile, fs.constants.R_OK);
  } catch (err) {
    console.warn(`No read access to ${pathToSketchFile}!`); // eslint-disable-line no-console
    return;
  }

  // Check that output path is good
  try {
    const stats = await fs.statAsync(outputDirectory);
    if (stats.isFile()) {
      console.warn(`Output directory ${outputDirectory} is a file!`); // eslint-disable-line no-console
      return;
    }
    try {
      await fs.accessAsync(
        outputDirectory,
        fs.constants.W_OK | fs.constants.X_OK, // eslint-disable-line no-bitwise
      );
    } catch (err) {
      console.warn(`No write or executable permissions to ${outputDirectory}!`); // eslint-disable-line no-console
      return;
    }
  } catch (err) {
    // Do nothing if it doesn't exist. We'll create that directory.
  }

  // We're all good to go! Start unzipping!
  const zipfileAsync = promisifyAll(
    await openAsync(pathToSketchFile, { lazyEntries: true }),
  );

  zipfileAsync.readEntry();

  zipfileAsync.on('entry', async entry => {
    const filePath = resolvePath(outputDirectory, entry.fileName);

    // directory file names end with '/'
    if (entry.fileName[entry.fileName.length - 1] === '/') {
      await mkdirpAsync(filePath);
      zipfileAsync.readEntry();
      return;
    }

    // file entry
    await mkdirpAsync(dirname(filePath));
    const readStream = await zipfileAsync.openReadStreamAsync(entry);

    if (extname(filePath) === '.json') {
      let allData = '';
      readStream.on('data', data => {
        allData += data;
      });
      readStream.on('end', async () => {
        await fs.writeFileAsync(
          filePath,
          stringify(
            JSON.parse(allData),
            { space: 2 },
          ),
        );
        zipfileAsync.readEntry();
      });
      return;
    }

    readStream.pipe(fs.createWriteStream(filePath));
    readStream.on('end', () => zipfileAsync.readEntry());
  });
};
