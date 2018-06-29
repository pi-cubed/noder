import { serial as test } from 'ava';
import { remove } from 'fs-extra';
import readPkg from 'read-pkg';
import { create, handler } from '../../src/commands/index';
import { fileExists } from '../../src/utils';

const NAME = 'test-directory';

const parseCreate = (...args) => create.exitProcess(false).parse(...args);

const handle = (opts = {}) => handler({ name: NAME, ...opts });

const rmdir = () => fileExists(NAME) && remove(NAME);

const getPkg = key => readPkg.sync({ cwd: NAME });

test.beforeEach(rmdir);
test.afterEach.always(rmdir);

test('fails parse if not given a name', ({ is }) =>
  parseCreate('create', ({ message }) =>
    is(message, 'Not enough non-option arguments: got 0, need at least 1')
  ));

test('fails if directory with name exists', ({ is, throws }) => {
  const { message } = throws(() => handle({ name: 'src' }));
  is(message, 'File already exists with that name');
});

test('creates directory with given name', ({ truthy }) =>
  handle().then(() => truthy(fileExists(NAME))));

test('creates package.json in directory', ({ truthy }) =>
  handle().then(() => truthy(fileExists(`${NAME}/package.json`))));

test('package.json has given name', ({ is }) =>
  handle().then(() => is(getPkg().name, NAME)));

test('package.json has default version', ({ is }) =>
  handle().then(() => is(getPkg().version, '0.1.0')));

test('package.json has given version', ({ is }) =>
  handle({ version: '1.0.0' }).then(() => is(getPkg().version, '1.0.0')));

test('package.json has default license', ({ is }) =>
  handle().then(() => is(getPkg().license, 'MIT')));

test('package.json has given license', ({ is }) =>
  handle({ license: 'ISC' }).then(() => is(getPkg().license, 'ISC')));

test('package.json has default author', ({ deepEqual }) =>
  handle().then(() => deepEqual(getPkg().author, { name: 'Pi Cubed' })));

test('package.json has given author', ({ deepEqual }) =>
  handle({ author: 'test' }).then(() =>
    deepEqual(getPkg().author, { name: 'test' })
  ));

test('package.json has default homepage', ({ is }) =>
  handle().then(() =>
    is(getPkg().homepage, `https://github.com/pi-cubed/${NAME}`)
  ));

test('package.json has given homepage', ({ is }) =>
  handle({ homepage: 'https://test.com' }).then(() =>
    is(getPkg().homepage, 'https://test.com')
  ));

test('package.json has default bugs url', ({ deepEqual }) =>
  handle().then(() =>
    deepEqual(getPkg().bugs, {
      url: `https://github.com/pi-cubed/${NAME}/issues`
    })
  ));

test('package.json has given bugs url', ({ deepEqual }) =>
  handle({ bugs: 'https://test.com' }).then(() =>
    deepEqual(getPkg().bugs, { url: 'https://test.com' })
  ));

test('package.json has default engine', ({ deepEqual }) =>
  handle().then(() =>
    deepEqual(getPkg().engines, {
      node: '>=8.0.0'
    })
  ));

test('package.json has given and default engines', ({ deepEqual }) =>
  handle({ engines: { python: '>=3.5.0' } }).then(() =>
    deepEqual(getPkg().engines, { node: '>=8.0.0', python: '>=3.5.0' })
  ));

test('package.json has given engine', ({ deepEqual }) =>
  handle({ engines: { node: '>=10.0.0' } }).then(() =>
    deepEqual(getPkg().engines, { node: '>=10.0.0' })
  ));

test('package.json has given description', ({ is }) =>
  handle({ description: 'test' }).then(() => is(getPkg().description, 'test')));

test('package.json has given repo url', ({ deepEqual }) =>
  handle({ repository: 'test' }).then(() =>
    deepEqual(getPkg().repository, { type: 'git', url: 'test' })
  ));

test('package.json has given custom fields', ({ is }) =>
  handle({ test: 'test' }).then(() => is(getPkg().test, 'test')));
