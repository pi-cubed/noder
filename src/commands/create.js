import { command } from 'yargs';
import { accessSync, constants, mkdirSync } from 'fs';
import { promisify } from 'bluebird';

export const fileExists = path => {
  try {
    accessSync(path, constants.F_OK);
    return true;
  } catch ({ code }) {
    return code !== 'ENOENT';
  }
};

const nameTakenError = () => {
  throw new Error('File already exists with that name');
};

/**
 * TODO docs
 */
export const create = promisify(
  name => (fileExists(name) ? nameTakenError() : mkdirSync(name))
);
/**
 * TODO docs
 */
export const createCommand = command('create <name>', 'make a Node.js program');
