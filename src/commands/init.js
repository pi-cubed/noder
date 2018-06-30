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
  CONFIG
} from '../utils';
const { mkdirAsync, writeFileAsync } = promisifyAll(require('fs'));
const { copyAsync } = promisifyAll(require('fs-extra'));

const initConfig = fields => (fileExists(CONFIG) ? loadJsonFile(CONFIG) : null);

//promptConfig().then(config =>
//   writeJsonFile(CONFIG, config).then(() => ({ ...fields, ...config }))
// )

const promptConfig = () =>
  prompt([
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

const initGit = config =>
  git()
    .init()
    .then(() => config);

const copyLib = config => {
  fileExists('.travis.yml') && loadJsonFile('.travis.yml');

  return copyAsync(path.join(__dirname, '../../lib'), process.cwd(), {
    overwrite: false
  }).then(() => config);
};

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
