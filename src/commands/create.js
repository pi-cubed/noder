import { command } from 'yargs';
import { mkdir } from 'fs';
import { promisify } from 'bluebird';
import writePkg from 'write-pkg';
import { fileExists } from '../utils';

const nameTakenError = () => {
  throw new Error('File already exists with that name');
};

const mkdirAsync = promisify(mkdir);

const initPkg = name => writePkg(name, { name, version: '0.1.0' });

const handler = ({ name }) =>
  fileExists(name)
    ? nameTakenError()
    : mkdirAsync(name).then(() => initPkg(name));

/**
 * TODO docs
 */
export const create = command(
  'create <name>',
  'make a Node.js program',
  {},
  handler
);
