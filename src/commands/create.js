import { command } from 'yargs';
import { access, constants } from 'fs';

const fileExists = path =>
  new Promise(res => access(path, constants.F_OK, res));

const nameTakenError = () => {
  throw new Error('File already exists with that name');
};

/**
 * TODO docs
 */
export const create = name => fileExists(name).then(nameTakenError);

/**
 * TODO docs
 */
export const createCommand = command('create <name>', 'make a Node.js program');
