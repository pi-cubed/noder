import { create } from './commands/index';

try {
  const { argv } = create.demandCommand().help('h');
} catch ({ message }) {
  console.error(`noder: ${message}`);
}
