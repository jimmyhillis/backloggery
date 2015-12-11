import minimist from 'minimist';
import { Backloggery } from '../lib/backloggery';

const argv = minimist(process.argv.slice(2));
const user = argv.user || argv._[0];
const format = argv.format || null;
const limit = argv.limit || null;

if (user === null) {
  console.error('A username must be provided');
  process.exit(1);
}

Backloggery.request(user, { limit: limit }, (err, games) => {
  switch (format) {
    case 'json':
      console.log(JSON.stringify(games));
      break;
    default:
      games.forEach(game => console.log(`${game.title} for ${game.console}`));
      break;
  }
});
