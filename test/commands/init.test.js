import { serial as test } from 'ava';
import readPkg from 'read-pkg';
import writePkg from 'write-pkg';
import loadJsonFile from 'load-json-file';
import writeJsonFile from 'write-json-file';
import { spawn } from 'child_process';
import del from 'del';
import mkdir from 'make-dir';
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

const { chdir } = process;

const NAME = 'test-directory';

const handle = (opts = {}) =>
  initHandler({ name: NAME, install: false, ...opts });

const rmdir = () => (fileExists(NAME) ? del(NAME) : _ => _);

const then = f => new Promise(_ => _()).then(f);

const mkConfig = () =>
  then(() => rmdir())
    .then(() => mkdir(NAME))
    .then(() => chdir(NAME))
    .then(() => writeJsonFile(CONFIG, { name: NAME }));

const rmConfig = () => then(() => chdir('..')).then(rmdir);

const getConfig = () => loadJsonFile.sync(`${NAME}/${CONFIG}`);

test.beforeEach(mkConfig);
test.afterEach.always(rmConfig);

// prompt

// TODO test prompt
// test('prompts user if .noderrc not found', ({ is }) => {
// });

// package.json

test('creates package.json with given and default fields', ({ is }) =>
  writeJsonFile(CONFIG, { name: 'test' })
    .then(handle)
    .then(readPkg)
    .then(({ name }) => is(name, `@${SCOPE}/test`)));

test('does not overwrite package.json fields not in .noderrc', ({ is }) =>
  writePkg({ a: 'b' })
    .then(handle)
    .then(readPkg)
    .then(({ a }) => is(a, 'b')));

// // lib

test('adds README.md if not present', ({ truthy }) =>
  handle().then(() => truthy(fileExists(`README.md`))));

test('adds .travis.yml if not present', ({ truthy }) =>
  handle().then(() => truthy(fileExists(`.travis.yml`))));

test('does not add .travis.yml if already present', ({ is }) =>
  writeJsonFile('.travis.yml', { a: 'b' })
    .then(handle)
    .then(() => loadJsonFile('.travis.yml'))
    .then(({ a }) => is(a, 'b')));

test('adds LICENSE if not present', ({ truthy }) =>
  handle().then(() => truthy(fileExists(`LICENSE`))));

test('does not add LICENSE if already present', ({ is }) =>
  writeJsonFile('LICENSE', { a: 'b' })
    .then(handle)
    .then(() => loadJsonFile('LICENSE'))
    .then(({ a }) => is(a, 'b')));

test('adds CONTRIBUTING.md if not present', ({ truthy }) =>
  handle().then(() => truthy(fileExists(`CONTRIBUTING.md`))));

test('does not add CONTRIBUTING.md if already present', ({ is }) =>
  writeJsonFile('CONTRIBUTING.md', { a: 'b' })
    .then(handle)
    .then(() => loadJsonFile('CONTRIBUTING.md'))
    .then(({ a }) => is(a, 'b')));

test('adds .prettierrc if not present', ({ truthy }) =>
  handle().then(() => truthy(fileExists(`.prettierrc`))));

test('does not add .prettierrc if already present', ({ is }) =>
  writeJsonFile('.prettierrc', { a: 'b' })
    .then(handle)
    .then(() => loadJsonFile('.prettierrc'))
    .then(({ a }) => is(a, 'b')));

test('adds src directory if not present', ({ truthy }) =>
  handle().then(() => truthy(fileExists(`src`))));

test('adds test directory if not present', ({ truthy }) =>
  handle().then(() => truthy(fileExists(`test`))));

test('adds index.js template if no src files exist', ({ truthy }) =>
  handle().then(() => truthy(fileExists(`src/index.js`))));

test('does not add index.js if src files exist', ({ is }) =>
  writeJsonFile('src/index.js', { a: 'b' })
    .then(handle)
    .then(() => loadJsonFile('src/index.js'))
    .then(({ a }) => is(a, 'b')));

test('adds index.test.js template if no tests exist', ({ truthy }) =>
  handle().then(() => truthy(fileExists(`test/index.test.js`))));

test('does not add index.test.js if tests exist', ({ is }) =>
  writeJsonFile('test/index.test.js', { a: 'b' })
    .then(handle)
    .then(() => loadJsonFile('test/index.test.js'))
    .then(({ a }) => is(a, 'b')));

test('adds .gitignore if not present', ({ truthy }) =>
  handle().then(() => truthy(fileExists('.gitignore'))));

test('does not add .gitignore if already present', ({ is }) =>
  writeJsonFile('.gitignore', { a: 'b' })
    .then(handle)
    .then(() => loadJsonFile('.gitignore'))
    .then(({ a }) => is(a, 'b')));

// git

test('initializes git', ({ truthy }) =>
  handle().then(() => truthy(fileExists('.git'))));

// yarn

test('initializes yarn', ({ truthy }) =>
  handle({ install: true }).then(() => truthy(fileExists('yarn.lock'))));
