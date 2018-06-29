import { accessSync, constants } from 'fs';

export const fileExists = path => {
  try {
    accessSync(path, constants.F_OK);
    return true;
  } catch ({ code }) {
    return code !== 'ENOENT';
  }
};

export const DEV_DEPS = {
  '@pi-cubed/node-starter': 'latest'
};

export const DEPS = {};

export const SCRIPTS = {
  build: 'node-starter build',
  test: 'node-starter test',
  dev: 'node-starter dev',
  start: 'node-starter start'
};
