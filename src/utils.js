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
  '@pi-cubed/node-starter': '0.1.0-alpha.2'
};

export const DEPS = {};

export const SCRIPTS = {
  build: 'node-starter build',
  test: 'node-starter test',
  dev: 'node-starter dev',
  start: 'node-starter start'
};

export const SCOPE = 'pi-cubed';

export const VERSION = '0.1.0';

export const AUTHOR = 'Pi Cubed';

export const LICENSE = 'MIT';

export const ENGINES = { node: '>=8.0.0' };

export const CONFIG_PATH = '.noderrc';

export const CONFIG_FIELDS = [
  'name',
  'description',
  'scope',
  'author',
  'version',
  'license'
];

export const then = f => new Promise(_ => _()).then(f);
