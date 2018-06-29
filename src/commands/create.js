import { command } from 'yargs';
import fs from 'fs';
import { promisifyAll } from 'bluebird';
import request from 'request-promise';
import writePkg from 'write-pkg';
import git from 'simple-git/promise';
import installPkgs from 'install-packages';
import { fileExists, DEPS, DEV_DEPS, SCRIPTS } from '../utils';

const { mkdirAsync, writeFileAsync } = promisifyAll(fs);

const nameTakenError = () => {
  throw new Error('File already exists with that name');
};

const initPkg = ({
  name,
  version = '0.1.0',
  license = 'MIT',
  author = 'Pi Cubed',
  dependencies = DEPS,
  devDependencies = DEV_DEPS,
  scripts = SCRIPTS,
  engines,
  ...fields
}) =>
  writePkg(name, {
    name,
    version,
    dependencies,
    devDependencies,
    scripts,
    license,
    author,
    homepage: `https://github.com/pi-cubed/${name}`,
    bugs: `https://github.com/pi-cubed/${name}/issues`,
    engines: { node: '>=8.0.0', ...engines },
    ...fields
  });

const writeGitignore = name =>
  request(
    'https://raw.githubusercontent.com/github/gitignore/master/Node.gitignore'
  ).then(data => writeFileAsync(`${name}/.gitignore`, data));

const initGit = name =>
  git(name)
    .init()
    .then(() => writeGitignore(name));

const initYarn = name => installPkgs({ cwd: name });

/**
 * TODO docs
 */
export const handler = ({ $0, h, _, install = true, ...fields }) => {
  const { name } = fields;
  return fileExists(name)
    ? nameTakenError()
    : mkdirAsync(name)
        .then(() => initPkg(fields))
        .then(() => initGit(name));
  // .then(() => install && initYarn(name));
};

/**
 * TODO docs
 */
export const create = command(
  'create <name>',
  'make a Node.js program',
  {},
  handler
);
