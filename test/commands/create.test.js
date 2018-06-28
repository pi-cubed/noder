import test from 'ava';
import { create } from '../../src/commands/index';

test('fails if not given a name', ({ is }) =>
  create
    .exitProcess(false)
    .parse('create', ({ message }) =>
      is(message, 'Not enough non-option arguments: got 0, need at least 1')
    ));

test('does not fail if given a name', ({ is }) => {
  const expected = 'test';
  create
    .exitProcess(false)
    .parse(`create ${expected}`, (_, { name }) => is(name, expected));
});
