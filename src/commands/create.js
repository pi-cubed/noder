import { command } from 'yargs';
import { promisifyAll } from 'bluebird';
import writePkg from 'write-pkg';
import git from 'simple-git/promise';
import installPkgs from 'install-packages';
import replace from 'replace-in-file';
import {
  fileExists,
  DEPS,
  DEV_DEPS,
  SCRIPTS,
  SCOPE,
  VERSION,
  LICENSE,
  AUTHOR,
  ENGINES
} from '../utils';
const { mkdirAsync, writeFileAsync } = promisifyAll(require('fs'));
const { copyAsync } = promisifyAll(require('fs-extra'));

const nameTakenError = () => {
  throw new Error('File already exists with that name');
};

const initPkg = fields => {
  const {
    name,
    scope = SCOPE,
    version = VERSION,
    license = LICENSE,
    author = AUTHOR,
    dependencies = {},
    devDependencies = {},
    scripts = {},
    engines = {}
  } = fields;
  const pkgName = scope ? `@${scope}/${name}` : name;
  return writePkg(name, {
    ...fields,
    name: pkgName,
    version,
    dependencies: { ...DEPS, ...dependencies },
    devDependencies: { ...DEV_DEPS, ...devDependencies },
    scripts: { ...SCRIPTS, ...scripts },
    license,
    author,
    repository: `git+ssh://git@github.com/${scope}/${name}.git`,
    homepage: fields.homepage || `https://github.com/${scope}/${name}`,
    bugs: fields.bugs || `https://github.com/${scope}/${name}/issues`,
    engines: { ...ENGINES, ...engines }
  }).then(() => fields);
};

const mkdir = fields =>
  fileExists(fields.name)
    ? nameTakenError()
    : mkdirAsync(fields.name).then(() => fields);

const initGit = fields =>
  git(fields.name)
    .init()
    .then(() => fields);

const initYarn = fields => installPkgs({ cwd: fields.name }).then(() => fields);

const copyLib = fields => copyAsync('lib', fields.name).then(() => fields);

const updateFiles = fields => {
  const { name, scope, author, license } = fields;
  return replace({
    files: ['README.md', 'LICENSE'],
    from: ['NAME', 'SCOPE', 'AUTHOR', 'LICENSE'],
    to: [name, scope, author, license]
  }).then(() => fields);
};

/**
 * TODO docs
 */
export const createHandler = ({ $0, h, _, install = true, ...fields }) => {
  return mkdir(fields)
    .then(initPkg)
    .then(initGit)
    .then(copyLib)
    .then(updateFiles)
    .then(install ? initYarn : _ => _);
};

/**
 * TODO docs
 */
export const create = command(
  'create <name>',
  'make a Node.js program',
  {},
  createHandler
);
