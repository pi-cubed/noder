import { serial as test } from 'ava';
import { remove } from 'fs-extra';
import readPkg from 'read-pkg';
import { create, handler } from '../../src/commands/index';
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

const handle = (opts = {}) => handler({ name: NAME, install: false, ...opts });

const rmdir = () => fileExists(NAME) && remove(NAME);

const getPkg = key => readPkg.sync({ cwd: NAME });

test.beforeEach(rmdir);
test.afterEach.always(rmdir);

// parsing

test('fails parse if not given a name', ({ is }) =>
  parseCreate('create', ({ message }) =>
    is(message, 'Not enough non-option arguments: got 0, need at least 1')
  ));

// directory

test('fails if directory with name exists', ({ is, throws }) => {
  const { message } = throws(() => handle({ name: 'src' }));
  is(message, 'File already exists with that name');
});

test('creates directory with given name', ({ truthy }) =>
  handle().then(() => truthy(fileExists(NAME))));

// package.json

test('creates package.json in directory', ({ truthy }) =>
  handle().then(() => truthy(fileExists(`${NAME}/package.json`))));

test('package.json does not have yarg impl fields', ({ truthy }) =>
  handle().then(() => {
    const { $0, h, _ } = getPkg();
    truthy(!($0 || h || _));
  }));

test('package.json has given name with default scope', ({ is }) =>
  handle().then(() => is(getPkg().name, `@${SCOPE}/${NAME}`)));

test('package.json has given name with given scope', ({ is }) =>
  handle({ scope: 'test' }).then(() => is(getPkg().name, `@test/${NAME}`)));

test('package.json has no dependencies', ({ is }) =>
  handle().then(() => is(getPkg().dependencies, undefined)));

test('package.json has given and default dependencies', ({ deepEqual }) =>
  handle({ dependencies: { '@pi-cubed/typed-ui': 'latest' } }).then(() =>
    deepEqual(getPkg().dependencies, {
      '@pi-cubed/typed-ui': 'latest',
      ...DEPS
    })
  ));

test('package.json has default devDependencies', ({ deepEqual }) =>
  handle().then(() => deepEqual(getPkg().devDependencies, DEV_DEPS)));

test('package.json has given and default devDependencies', ({ deepEqual }) =>
  handle({ devDependencies: { '@pi-cubed/typed-ui': 'latest' } }).then(() =>
    deepEqual(getPkg().devDependencies, {
      '@pi-cubed/typed-ui': 'latest',
      ...DEV_DEPS
    })
  ));

test('package.json has default scripts', ({ deepEqual }) =>
  handle().then(() => deepEqual(getPkg().scripts, SCRIPTS)));

test('package.json has given and default scripts', ({ deepEqual }) =>
  handle({ scripts: { a: 'a' } }).then(() =>
    deepEqual(getPkg().scripts, { a: 'a', ...SCRIPTS })
  ));

test('package.json has default version', ({ is }) =>
  handle().then(() => is(getPkg().version, VERSION)));

test('package.json has given version', ({ is }) =>
  handle({ version: '1.0.0' }).then(() => is(getPkg().version, '1.0.0')));

test('package.json has default license', ({ is }) =>
  handle().then(() => is(getPkg().license, LICENSE)));

test('package.json has given license', ({ is }) =>
  handle({ license: 'ISC' }).then(() => is(getPkg().license, 'ISC')));

test('package.json has default author', ({ deepEqual }) =>
  handle().then(() => deepEqual(getPkg().author, { name: AUTHOR })));

test('package.json has given author', ({ deepEqual }) =>
  handle({ author: 'test' }).then(() =>
    deepEqual(getPkg().author, { name: 'test' })
  ));

test('package.json has given repo url', ({ deepEqual }) =>
  handle({ scope: 'a' }).then(() =>
    deepEqual(getPkg().repository, {
      type: 'git',
      url: `git+ssh://git@github.com/a/${NAME}.git`
    })
  ));

test('package.json has default homepage', ({ is }) =>
  handle().then(() =>
    is(getPkg().homepage, `https://github.com/${SCOPE}/${NAME}`)
  ));

test('package.json has given homepage', ({ is }) =>
  handle({ homepage: 'https://test.com' }).then(() =>
    is(getPkg().homepage, 'https://test.com')
  ));

test('package.json has default bugs url', ({ deepEqual }) =>
  handle().then(() =>
    deepEqual(getPkg().bugs, {
      url: `https://github.com/${SCOPE}/${NAME}/issues`
    })
  ));

test('package.json has given bugs url', ({ deepEqual }) =>
  handle({ bugs: 'https://test.com' }).then(() =>
    deepEqual(getPkg().bugs, { url: 'https://test.com' })
  ));

test('package.json has default engine', ({ deepEqual }) =>
  handle().then(() => deepEqual(getPkg().engines, ENGINES)));

test('package.json has given and default engines', ({ deepEqual }) =>
  handle({ engines: { python: '>=3.5.0' } }).then(() =>
    deepEqual(getPkg().engines, { ...ENGINES, python: '>=3.5.0' })
  ));

test('package.json has given engine', ({ deepEqual }) =>
  handle({ engines: { node: '>=10.0.0' } }).then(() =>
    deepEqual(getPkg().engines, { node: '>=10.0.0' })
  ));

test('package.json has given description', ({ is }) =>
  handle({ description: 'test' }).then(() => is(getPkg().description, 'test')));

test('package.json has given custom fields', ({ is }) =>
  handle({ test: 'test' }).then(() => is(getPkg().test, 'test')));

// git

test('initializes git', ({ truthy }) =>
  handle().then(() => truthy(fileExists(`${NAME}/.git`))));

test('adds gitignore from github', ({ truthy }) =>
  handle().then(() => truthy(fileExists(`${NAME}/.gitignore`))));

// yarn

test('initializes yarn', ({ truthy }) =>
  handle({ install: true }).then(() =>
    truthy(fileExists(`${NAME}/yarn.lock`))
  ));

// lib

test('adds README.md', ({ truthy }) =>
  handle().then(() => truthy(fileExists(`${NAME}/README.md`))));

test('adds .travis.yml', ({ truthy }) =>
  handle().then(() => truthy(fileExists(`${NAME}/.travis.yml`))));

test('adds LICENSE', ({ truthy }) =>
  handle().then(() => truthy(fileExists(`${NAME}/LICENSE`))));

test('adds CONTRIBUTING.md', ({ truthy }) =>
  handle().then(() => truthy(fileExists(`${NAME}/CONTRIBUTING.md`))));

test('adds docs config', ({ truthy }) =>
  handle().then(() => truthy(fileExists(`${NAME}/book.json`))));

test('adds .prettierrc', ({ truthy }) =>
  handle().then(() => truthy(fileExists(`${NAME}/.prettierrc`))));

test('adds src directory', ({ truthy }) =>
  handle().then(() => truthy(fileExists(`${NAME}/src`))));

test('adds test directory', ({ truthy }) =>
  handle().then(() => truthy(fileExists(`${NAME}/test`))));

test('adds index.js template', ({ truthy }) =>
  handle().then(() => truthy(fileExists(`${NAME}/src/index.js`))));

test('adds index.test.js template', ({ truthy }) =>
  handle().then(() => truthy(fileExists(`${NAME}/test/index.test.js`))));
