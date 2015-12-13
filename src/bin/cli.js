import minimist from 'minimist';
import concat from 'concat-stream';
import { Backloggery } from '../lib/backloggery';

const argv = minimist(process.argv.slice(2));
const user = argv.user || argv._[0];
const format = argv.format || null;
const limit = argv.limit || null;
const useStdin = argv.stdin || false;

if (user === null) {
  console.error('A username must be provided');
  process.exit(1);
}

// Format and output the games returned from the API
// to stdout with the user selected format.
// Currently supports JSON and Text (one game per line)
// @param {Error} error
// @param {[Backloggery.Game]} An array of games to iterate
function outputResults(err, games) {
  switch (format) {
    case 'json':
      console.log(JSON.stringify(games));
      break;
    default:
      games.forEach(game => console.log(`${game.title} for ${game.system} originall found on ${game.originalSystem} | ${game.isCompleted}`));
      break;
  }
};

if (useStdin) {
  process.stdin.pipe(concat(function (buf) {
    Backloggery.fromHTML(buf.toString(), outputResults);
  }));
}
else {
  Backloggery.request(user, { limit: limit }, outputResults);
}
