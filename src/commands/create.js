import { command } from 'yargs';
import { mkdir } from 'fs';
import { promisify } from 'bluebird';
import writePkg from 'write-pkg';
import { fileExists } from '../utils';

const nameTakenError = () => {
  throw new Error('File already exists with that name');
};

const mkdirAsync = promisify(mkdir);

const initPkg = ({
  name,
  version = '0.1.0',
  license = 'MIT',
  author = 'Pi Cubed',
  engines,
  ...fields
}) =>
  writePkg(name, {
    name,
    version,
    license,
    author,
    homepage: `https://github.com/pi-cubed/${name}`,
    bugs: `https://github.com/pi-cubed/${name}/issues`,
    engines: { node: '>=8.0.0', ...engines },
    ...fields
  });

/**
 * TODO docs
 */
export const handler = fields =>
  fileExists(fields.name)
    ? nameTakenError()
    : mkdirAsync(fields.name).then(() => initPkg(fields));

/**
 * TODO docs
 */
export const create = command(
  'create <name>',
  'make a Node.js program',
  {},
  handler
);
