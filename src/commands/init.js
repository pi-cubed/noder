import path from 'path';
import { command } from 'yargs';
import { promisifyAll } from 'bluebird';
import git from 'simple-git/promise';
import installPkgs from 'install-packages';
import replace from 'replace-in-file';
import { prompt } from 'inquirer';
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
  CONFIG_PATH,
  CONFIG_FIELDS,
  then
} from '../utils';
const { mkdirAsync, writeFileAsync } = promisifyAll(require('fs'));
const { copyAsync } = promisifyAll(require('fs-extra'));

/**
 * TODO docs
 *
 * @private
 */
const initConfig = fields =>
  then(() => getConfig(fields))
    .then(mergeConfig(fields))
    .then(config =>
      then(() => getMissingConfig(config))
        .then(promptMissingConfig)
        .then(mergeConfig(config))
    )
    .then(writeConfig);

/**
 * TODO docs
 *
 * @private
 */
const mergeConfig = a => b => ({ ...b, ...a });

/**
 * TODO docs
 *
 * @private
 */
const writeConfig = config =>
  writeJsonFile(CONFIG_PATH, config).then(() => config);

/**
 * TODO docs
 *
 * @private
 */
const getConfig = fields =>
  fileExists(CONFIG_PATH) ? loadJsonFile(CONFIG_PATH) : {};

/**
 * TODO docs
 *
 * @private
 */
const getMissingConfig = fields =>
  Object.keys(fields).filter(f => !(f in CONFIG_FIELDS));

/**
 * TODO docs
 *
 * @private
 */
const CONFIG_PROMPTS = [
  { type: 'string', name: 'name', message: 'Package name' },
  { type: 'string', name: 'description', message: 'Package description' },
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
];

/**
 * TODO docs
 *
 * @private
 */
const promptMissingConfig = fields => {
  const prompts = CONFIG_PROMPTS.filter(({ name }) => name in fields);
  return prompts.length ? prompt(prompts) : {};
};

/**
 * TODO docs
 *
 * @private
 */
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
  const original = fileExists('package.json') ? readPkg.sync() : {};
  const data = {
    ...config,
    ...original,
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

/**
 * TODO docs
 *
 * @private
 */
const initGit = config =>
  git()
    .init()
    .then(() => config);

/**
 * TODO docs
 *
 * @private
 */
const copyLib = config => {
  fileExists('.travis.yml') && loadJsonFile('.travis.yml');

  return copyAsync(path.join(__dirname, '../../lib'), process.cwd(), {
    overwrite: false
  }).then(() => config);
};

/**
 * TODO docs
 *
 * @private
 */
const updateFiles = config => {
  const { name, scope, author, license } = config;
  return replace({
    files: ['README.md', 'LICENSE'],
    from: ['NAME', 'SCOPE', 'AUTHOR', 'LICENSE'],
    to: [name, scope, author, license]
  }).then(() => config);
};

/**
 * TODO docs
 */
export const initHandler = ({ $0, h, _, install = true, ...fields }) =>
  initConfig(fields)
    .then(initPkg)
    .then(initGit)
    .then(copyLib)
    .then(updateFiles)
    .then(install ? installPkgs : _ => _);
/**
 * TODO docs
 */
export const init = command(
  'init',
  'initialize a noder project',
  {},
  initHandler
);
