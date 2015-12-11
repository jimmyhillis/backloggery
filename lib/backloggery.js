import request from 'request';
import Xray from 'x-ray';

export class Game {
  constructor({ title, console, note }) {
    this.title = title;
    this.console = console;
    this.note = note;
  }
}

// Scrape HTML from Backloggery.com and return a list of
// object data that represents each game
// @param {String} html from Backloggery to scrape games from
// @param {function} callback to pass completion to
function scrape(html, callback) {
  const xray = new Xray();
  const scraper = xray(html, '.gamebox', [{
    title: 'h2 b',
    console: '.gamerow b',
  }]);
  scraper((err, data) => {
    if (err) {
      return callback(err);
    }
    return callback(null, data.map(({ title, console }) => {
      return new Game({
        title: title.trim(),
        console: console.trim(),
      });
    }));
  });
}

export class Backloggery {
  // Request a list of games attached to the `username` account
  // on Backloggery. This request can be tested with cURL
  //   curl 'http://backloggery.com/games.php?user={{username}}&console=&rating=&status=&unplayed=&own=&search=&comments=&region=&region_u=2&wish=&alpha=&temp_sys=360&total=264&aid=2&ajid={{offset}}' \
  //     --compressed
  // @param {String} html from Backloggery to scrape games from
  // @param {object} options
  //   - {Number} offset to start gathering games from
  //   - {Number} limit the number of games found
  // @param {function} callback to pass completion to
  static request(username, options, _callback) {
    const { initialOffset = 0, limit = null } = !_callback && typeof options === 'function' ? {} : options;
    const callback = _callback || options || function () {};
    let games = [];
    const url = `http://backloggery.com/ajax_moregames.php?user=${username}&console=&rating=&status=&unplayed=&own=&search=&comments=&region=&region_u=2&wish=&alpha=&temp_sys=&total=0&aid=1`;
    (function partialRequest(offset) {
      return request(`${url}&ajid=${offset}`, (err, response) => {
        if (err) {
          return callback(err);
        }
        return scrape(response.body, (err, results) => {
          if (err) {
            return callback(err);
          }
          if (!results.length) {
            return callback(null, games);
          }
          games = games.concat(results);
          if (limit && games.length >= limit) {
            return callback(null, games.slice(0, limit));
          }
          return partialRequest(games.length);
        });
      });
    }(initialOffset));
  }
}
