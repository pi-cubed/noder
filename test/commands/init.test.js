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
  CONFIG_PATH,
  then
} from '../../src/utils';

const { chdir } = process;

const NAME = 'test-directory';

const handle = (opts = {}) =>
  initHandler({ name: NAME, install: false, ...opts });

const rmdir = () => (fileExists(NAME) ? del(NAME) : _ => _);

const mkConfig = () =>
  then(() => rmdir())
    .then(() => mkdir(NAME))
    .then(() => chdir(NAME))
    .then(() => writeJsonFile(CONFIG_PATH, { name: NAME }));

const rmConfig = () => then(() => chdir('..')).then(rmdir);

const getConfig = () => loadJsonFile.sync(`${NAME}/${CONFIG_PATH}`);

beforeEach(mkConfig);
afterEach(rmConfig);

// prompt

// TODO test prompt
// test('prompts user if .noderrc not found', () => {
// });

// package.json

test('creates package.json with given and default fields', () =>
  expect(
    writeJsonFile(CONFIG_PATH, { name: 'test' })
      .then(() => initHandler({ install: false }))
      .then(readPkg)
      .then(({ name }) => name)
  ).resolves.toBe(`@${SCOPE}/test`));

test('does not overwrite package.json fields not in .noderrc', () =>
  expect(
    writePkg({ a: 'b' })
      .then(handle)
      .then(readPkg)
      .then(({ a }) => a)
  ).resolves.toBe('b'));

// test('package.json has given and default scripts', () =>
//   expect(
//     writePkg({ scripts: { a: 'a' } })
//       .then(handle)
//     .then(getPkg)
//     .then(({ scripts }) => scripts)
// ).resolves.toEqual({ a: 'a', ...SCRIPTS }));

// lib

test('adds README.md if not present', () =>
  expect(handle().then(() => fileExists(`README.md`))).resolves.toBeTruthy());

test('adds .travis.yml if not present', () =>
  expect(handle().then(() => fileExists(`.travis.yml`))).resolves.toBeTruthy());

test('does not add .travis.yml if already present', () =>
  expect(
    writeJsonFile('.travis.yml', { a: 'b' })
      .then(handle)
      .then(() => loadJsonFile('.travis.yml'))
      .then(({ a }) => a)
  ).resolves.toEqual('b'));

test('adds LICENSE if not present', () =>
  expect(handle().then(() => fileExists(`LICENSE`))).resolves.toBeTruthy());

test('does not add LICENSE if already present', () =>
  expect(
    writeJsonFile('LICENSE', { a: 'b' })
      .then(handle)
      .then(() => loadJsonFile('LICENSE'))
      .then(({ a }) => a)
  ).resolves.toEqual('b'));

test('adds CONTRIBUTING.md if not present', () =>
  expect(
    handle().then(() => fileExists(`CONTRIBUTING.md`))
  ).resolves.toBeTruthy());

test('does not add CONTRIBUTING.md if already present', () =>
  expect(
    writeJsonFile('CONTRIBUTING.md', { a: 'b' })
      .then(handle)
      .then(() => loadJsonFile('CONTRIBUTING.md'))
      .then(({ a }) => a)
  ).resolves.toEqual('b'));

test('adds .prettierrc if not present', () =>
  expect(handle().then(() => fileExists(`.prettierrc`))).resolves.toBeTruthy());

test('does not add .prettierrc if already present', () =>
  expect(
    writeJsonFile('.prettierrc', { a: 'b' })
      .then(handle)
      .then(() => loadJsonFile('.prettierrc'))
      .then(({ a }) => a)
  ).resolves.toEqual('b'));

test('adds src directory if not present', () =>
  expect(handle().then(() => fileExists(`src`))).resolves.toBeTruthy());

test('adds test directory if not present', () =>
  expect(handle().then(() => fileExists(`test`))).resolves.toBeTruthy());

test('adds index.js template if no src files exist', () =>
  expect(
    handle().then(() => fileExists(`src/index.js`))
  ).resolves.toBeTruthy());

test('does not add index.js if src files exist', () =>
  expect(
    writeJsonFile('src/index.js', { a: 'b' })
      .then(handle)
      .then(() => loadJsonFile('src/index.js'))
      .then(({ a }) => a)
  ).resolves.toEqual('b'));

test('adds index.test.js template if no tests exist', () =>
  expect(
    handle().then(() => fileExists(`test/index.test.js`))
  ).resolves.toBeTruthy());

test('does not add index.test.js if tests exist', () =>
  expect(
    writeJsonFile('test/index.test.js', { a: 'b' })
      .then(handle)
      .then(() => loadJsonFile('test/index.test.js'))
      .then(({ a }) => a)
  ).resolves.toEqual('b'));

test('adds .gitignore if not present', () =>
  expect(handle().then(() => fileExists('.gitignore'))).resolves.toBeTruthy());

test('does not add .gitignore if already present', () =>
  expect(
    writeJsonFile('.gitignore', { a: 'b' })
      .then(handle)
      .then(() => loadJsonFile('.gitignore'))
      .then(({ a }) => a)
  ).resolves.toEqual('b'));

// git

test('initializes git', () =>
  expect(handle().then(() => fileExists('.git'))).resolves.toBeTruthy());

// yarn

// test('initializes yarn', () =>
//   expect(
//     handle({ install: true }).then(() => fileExists('yarn.lock'))
//   ).resolves.toBeTruthy());
