import { accessSync, constants } from 'fs';

export const fileExists = path => {
  try {
    accessSync(path, constants.F_OK);
    return true;
  } catch ({ code }) {
    return code !== 'ENOENT';
  }
};
