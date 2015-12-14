# Backloggery

A javascript (node + browser) module for pulling game data from [Backloggery](http://backloggery.com).

## Usage

To use the API within your code you can use `#request` to return all the games that have been attached to a user's account.

```
import { Backlogger } from 'backloggery';

Backloggery.request('{{username}}', (err, games) => {
  console.log(`{{username}} has ${games.length} games`);
})
```

Each `Game` may contain:

```json
{
  "title": "The name of the game, as added by the user",
  "system": "Console (Original Console)",
  "originalSystem": "The original system the game was released",
  "isCompleted": true|false,
  "rating": 1-5
}
```

## CLI

A CLI is also available for quickly searching users data to use in your shell.

```bash
# return all games belonging to {{username}} in JSON format
npm run cli {{username}} -- --format json
```

Also supports pipes (with `--stdin`) if you want to pass Backloggery HTML in directly.

```bash
cat test.html | babel-node src/bin/cli.js --stdin
```

# License

MIT
