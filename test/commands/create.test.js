import { remove } from 'fs-extra';
import readPkg from 'read-pkg';
import { create, createHandler } from '../../src/commands/index';
import {
  fileExists,
  DEPS,
  DEV_DEPS,
  SCRIPTS,
  SCOPE,
  AUTHOR,
  LICENSE,
  VERSION,
  ENGINES
} from '../../src/utils';

const NAME = 'test-directory';

const parseCreate = (...args) => create.exitProcess(false).parse(...args);

const handle = (opts = {}) =>
  createHandler({ name: NAME, install: false, ...opts });

const rmdir = () => fileExists(NAME) && remove(NAME);

const getPkg = () => readPkg.sync({ cwd: NAME });

beforeEach(rmdir);
afterEach(rmdir);

// parsing

// test('fails parse if not given a name', () =>
//   expect(parseCreate('create').catch(({ message }) => message)).resolves.toBe(
//     'Not enough non-option arguments: got 0, need at least 1'
//   ));

// directory

// test('fails if directory with name exists', () => {
//   expect.assertions(1);
//   return handle({ name: 'src' }).catch(e =>
//     expect(e).toBe('File already exists with that name')
//   );
// });

test('creates directory with given name', () =>
  expect(handle().then(() => fileExists(NAME))).resolves.toBeTruthy());

// // package.json

test('creates package.json in directory', () =>
  expect(
    handle().then(() => fileExists(`${NAME}/package.json`))
  ).resolves.toBeTruthy());

test('package.json does not have yarg impl fields', () =>
  expect(
    handle()
      .then(getPkg)
      .then(({ $0, h, _ }) => $0 || h || _)
  ).resolves.toBeFalsy());

test('package.json has given name with default scope', () =>
  expect(
    handle()
      .then(getPkg)
      .then(({ name }) => name)
  ).resolves.toBe(`@${SCOPE}/${NAME}`));

test('package.json has given name with given scope', () =>
  expect(
    handle({ scope: 'test' })
      .then(getPkg)
      .then(({ name }) => name)
  ).resolves.toBe(`@test/${NAME}`));

test('package.json has no dependencies', () =>
  expect(
    handle()
      .then(getPkg)
      .then(({ dependencies }) => dependencies)
  ).resolves.toBeUndefined());

test('package.json has given and default dependencies', () =>
  expect(
    handle({ dependencies: { '@pi-cubed/typed-ui': 'latest' } })
      .then(getPkg)
      .then(({ dependencies }) => dependencies)
  ).resolves.toEqual({
    '@pi-cubed/typed-ui': 'latest',
    ...DEPS
  }));

test('package.json has default devDependencies', () =>
  expect(
    handle()
      .then(getPkg)
      .then(({ devDependencies }) => devDependencies)
  ).resolves.toEqual(DEV_DEPS));

test('package.json has given and default devDependencies', () =>
  expect(
    handle({ devDependencies: { '@pi-cubed/typed-ui': 'latest' } })
      .then(getPkg)
      .then(({ devDependencies }) => devDependencies)
  ).resolves.toEqual({
    '@pi-cubed/typed-ui': 'latest',
    ...DEV_DEPS
  }));

test('package.json has default scripts', () =>
  expect(
    handle()
      .then(getPkg)
      .then(({ scripts }) => scripts)
  ).resolves.toEqual(SCRIPTS));

test('package.json has given and default scripts', () =>
  expect(
    handle({ scripts: { a: 'a' } })
      .then(getPkg)
      .then(({ scripts }) => scripts)
  ).resolves.toEqual({ a: 'a', ...SCRIPTS }));

test('package.json has default version', () =>
  expect(
    handle()
      .then(getPkg)
      .then(({ version }) => version)
  ).resolves.toBe(VERSION));

test('package.json has given version', () =>
  expect(
    handle({ version: '1.0.0' })
      .then(getPkg)
      .then(({ version }) => version)
  ).resolves.toBe('1.0.0'));

test('package.json has default license', () =>
  expect(
    handle()
      .then(getPkg)
      .then(({ license }) => license)
  ).resolves.toBe(LICENSE));

test('package.json has given license', () =>
  expect(
    handle({ license: 'ISC' })
      .then(getPkg)
      .then(({ license }) => license)
  ).resolves.toBe('ISC'));

test('package.json has default author', () =>
  expect(
    handle()
      .then(getPkg)
      .then(({ author }) => author)
  ).resolves.toEqual({ name: AUTHOR }));

test('package.json has given author', () =>
  expect(
    handle({ author: 'test' })
      .then(getPkg)
      .then(({ author }) => author)
  ).resolves.toEqual({ name: 'test' }));

test('package.json has given repo url', () =>
  expect(
    handle({ scope: 'a' })
      .then(getPkg)
      .then(({ repository }) => repository)
  ).resolves.toEqual({
    type: 'git',
    url: `git+ssh://git@github.com/a/${NAME}.git`
  }));

test('package.json has default homepage', () =>
  expect(
    handle()
      .then(getPkg)
      .then(({ homepage }) => homepage)
  ).resolves.toBe(`https://github.com/${SCOPE}/${NAME}`));

test('package.json has given homepage', () =>
  expect(
    handle({ homepage: 'https://test.com' })
      .then(getPkg)
      .then(({ homepage }) => homepage)
  ).resolves.toBe('https://test.com'));

test('package.json has default bugs url', () =>
  expect(
    handle()
      .then(getPkg)
      .then(({ bugs }) => bugs)
  ).resolves.toEqual({
    url: `https://github.com/${SCOPE}/${NAME}/issues`
  }));

test('package.json has given bugs url', () =>
  expect(
    handle({ bugs: 'https://test.com' })
      .then(getPkg)
      .then(({ bugs }) => bugs)
  ).resolves.toEqual({ url: 'https://test.com' }));

test('package.json has default engine', () =>
  expect(
    handle()
      .then(getPkg)
      .then(({ engines }) => engines)
  ).resolves.toEqual(ENGINES));

test('package.json has given and default engines', () =>
  expect(
    handle({ engines: { python: '>=3.5.0' } })
      .then(getPkg)
      .then(({ engines }) => engines)
  ).resolves.toEqual({ ...ENGINES, python: '>=3.5.0' }));

test('package.json has given engine', () =>
  expect(
    handle({ engines: { node: '>=10.0.0' } })
      .then(getPkg)
      .then(({ engines }) => engines)
  ).resolves.toEqual({ node: '>=10.0.0' }));

test('package.json has given description', () =>
  expect(
    handle({ description: 'test' })
      .then(getPkg)
      .then(({ description }) => description)
  ).resolves.toBe('test'));

test('package.json has given custom fields', () =>
  expect(
    handle({ test: 'test' })
      .then(getPkg)
      .then(({ test }) => test)
  ).resolves.toBe('test'));

// git

test('initializes git', () =>
  expect(
    handle().then(() => fileExists(`${NAME}/.git`))
  ).resolves.toBeTruthy());

test('adds gitignore from github', () =>
  expect(
    handle().then(() => fileExists(`${NAME}/.gitignore`))
  ).resolves.toBeTruthy());

// lib

test('adds README.md', () =>
  expect(
    handle().then(() => fileExists(`${NAME}/README.md`))
  ).resolves.toBeTruthy());

test('adds .travis.yml', () =>
  expect(
    handle().then(() => fileExists(`${NAME}/.travis.yml`))
  ).resolves.toBeTruthy());

test('adds LICENSE', () =>
  expect(
    handle().then(() => fileExists(`${NAME}/LICENSE`))
  ).resolves.toBeTruthy());

test('adds CONTRIBUTING.md', () =>
  expect(
    handle().then(() => fileExists(`${NAME}/CONTRIBUTING.md`))
  ).resolves.toBeTruthy());

test('adds .prettierrc', () =>
  expect(
    handle().then(() => fileExists(`${NAME}/.prettierrc`))
  ).resolves.toBeTruthy());

test('adds src directory', () =>
  expect(handle().then(() => fileExists(`${NAME}/src`))).resolves.toBeTruthy());

test('adds test directory', () =>
  expect(
    handle().then(() => fileExists(`${NAME}/test`))
  ).resolves.toBeTruthy());

test('adds index.js template', () =>
  expect(
    handle().then(() => fileExists(`${NAME}/src/index.js`))
  ).resolves.toBeTruthy());

test('adds index.test.js template', () =>
  expect(
    handle().then(() => fileExists(`${NAME}/test/index.test.js`))
  ).resolves.toBeTruthy());

// yarn

// test('initializes yarn', () =>
//   expect(
//     handle({ install: true }).then(() => fileExists(`${NAME}/yarn.lock`))
//   ).resolves.toBeTruthy());
