import { serial as test } from 'ava';
import { mkdirSync } from 'fs';
import { removeSync } from 'fs-extra';
import readPkg from 'read-pkg';
import loadJsonFile from 'load-json-file';
import writeJsonFile from 'write-json-file';
import { initHandler } from '../../src/commands/index';
import {
  fileExists,
  DEPS,
  DEV_DEPS,
  SCRIPTS,
  SCOPE,
  AUTHOR,
  LICENSE,
  VERSION,
  ENGINES,
  CONFIG
} from '../../src/utils';

const NAME = 'test-directory';

const handle = (opts = {}) =>
  initHandler({ name: NAME, install: false, ...opts });

const rmdir = () => fileExists(NAME) && removeSync(NAME);

const mkConfig = () => {
  rmdir();
  mkdirSync(NAME);
  writeJsonFile.sync(`${NAME}/.noderrc`, { name: NAME, scope: SCOPE });
};

const getConfig = () => loadJsonFile.sync(`${NAME}/${CONFIG}`);

test.beforeEach(mkConfig);
test.afterEach.always(rmdir);

test('reads from .noderrc', ({ is }) => {
  writeJsonFile.sync(`${NAME}/${CONFIG}`, { name: 'test' });
  process.chdir(NAME);
  return handle()
    .then(readPkg)
    .then(({ name }) => is(name, `@${SCOPE}/test`))
    .then(() => process.chdir('..'));
});
