import { create } from './commands/index';

const { argv } = create.demandCommand().help('h');
