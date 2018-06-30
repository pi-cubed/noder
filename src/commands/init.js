import { command } from 'yargs';
import { promisifyAll } from 'bluebird';
import git from 'simple-git/promise';
import installPkgs from 'install-packages';
import replace from 'replace-in-file';
import { parse } from 'inquirer';
import readPkg from 'read-pkg';
import writePkg from 'write-pkg';
import loadJsonFile from 'load-json-file';
import writeJsonFile from 'write-json-file';
import {
  fileExists,
  DEPS,
  DEV_DEPS,
  SCRIPTS,
  SCOPE,
  VERSION,
  LICENSE,
  AUTHOR,
  ENGINES,
  CONFIG
} from '../utils';
const { mkdirAsync, writeFileAsync } = promisifyAll(require('fs'));
const { copyAsync } = promisifyAll(require('fs-extra'));

const initConfig = fields =>
  fileExists(CONFIG)
    ? loadJsonFile(CONFIG)
    : promptConfig().then(config =>
        writeJsonFile(CONFIG, config).then(() => ({ ...fields, ...config }))
      );

const promptConfig = () =>
  parse([
    { type: 'string', name: 'name', message: 'Package name' },
    { type: 'string', name: 'scope', message: 'Package scope', default: SCOPE },
    {
      type: 'string',
      name: 'author',
      message: 'Package author',
      default: AUTHOR
    },
    {
      type: 'string',
      name: 'version',
      message: 'Package version',
      default: VERSION
    },
    {
      type: 'string',
      name: 'license',
      message: 'Package license',
      default: LICENSE
    }
  ]);

const initPkg = config => {
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
  } = config;
  const data = {
    ...config,
    name: scope ? `@${scope}/${name}` : name,
    scope,
    version,
    license,
    author,
    dependencies: { ...DEPS, ...dependencies },
    devDependencies: { ...DEV_DEPS, ...devDependencies },
    scripts: { ...SCRIPTS, ...scripts },
    repository: `git+ssh://git@github.com/${scope}/${name}.git`,
    homepage: config.homepage || `https://github.com/${scope}/${name}`,
    bugs: config.bugs || `https://github.com/${scope}/${name}/issues`,
    engines: { ...ENGINES, ...engines }
  };
  return writePkg(data).then(() => data);
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
export const initHandler = ({ $0, h, _, install = true, ...fields }) => {
  return initConfig(fields).then(initPkg);
};

/**
 * TODO docs
 */
export const init = command(
  'init',
  'initialize a noder project',
  {},
  initHandler
);
