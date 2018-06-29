import test from 'ava';
import { remove } from 'fs-extra';
import readPkg from 'read-pkg';
import { create } from '../../src/commands/index';
import { fileExists } from '../../src/utils';

const parseIs = (args, cb) => create.exitProcess(false).parse(args, cb);

const NAME = 'test-directory';

test.beforeEach(() => (fileExists(NAME) ? remove(NAME) : null));
test.afterEach.always(() => (fileExists(NAME) ? remove(NAME) : null));

test('fails parse if not given a name', ({ is }) => {
  parseIs('create', ({ message }) =>
    is(message, 'Not enough non-option arguments: got 0, need at least 1')
  );
});

test('creates directory with given name', ({ truthy }) => {
  parseIs(`create ${NAME}`, () => truthy(fileExists(NAME)));
});

test('fails if directory with name exists', ({ is, throws }) => {
  const { message } = throws(() => parseIs('create test'));
  is(message, 'File already exists with that name');
});

test.skip('creates package.json in directory', ({ truthy }) => {
  parseIs(`create ${NAME}`, () => truthy(fileExists(`${NAME}/package.json`)));
});

test.skip('package.json has given name', ({ is }) => {
  parseIs(`create ${NAME}`, () =>
    is(readPkg.sync({ cwd: NAME }, 'name'), NAME)
  );
});
