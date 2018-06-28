import test from 'ava';
import { createCommand, create, fileExists } from '../../src/commands/index';
import { rmdirSync } from 'fs';

const msgAsync = cmd => (args, expected) => ({ is }) =>
  cmd(args, ({ message }) => is(message, expected));

const parseError = msgAsync((args, isCorrect) =>
  createCommand.exitProcess(false).parse(args, isCorrect)
);

const createError = msgAsync((name, isCorrect) =>
  create(name).catch(isCorrect)
);

const DIR = 'test-directory';

test.afterEach.always(() => (fileExists(DIR) ? rmdirSync(DIR) : null));

test(
  'fails parse if not given a name',
  parseError(
    'create',
    'Not enough non-option arguments: got 0, need at least 1'
  )
);

test(
  'fails if directory with name exists',
  createError('test', 'File already exists with that name')
);

test('creates directory with given name', ({ truthy }) => {
  create(DIR);
  truthy(fileExists(DIR));
});
