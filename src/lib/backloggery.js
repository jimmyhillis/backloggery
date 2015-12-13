import request from 'request';
import Xray from 'x-ray';

export class Game {
  constructor({ title=null, system=null, originalSystem=null, note=null, isCompleted=false, rating=null }) {
    this.title = title;
    this.system = system;
    this.originalsystem = originalSystem;
    this.note = note;
    this.isCompleted = isCompleted;
    this.rating = rating;
  }
}

const completionTypes = ['mastered', 'completed', 'beaten'];

// Return true if, from the provided set of medals/attached images
// an image for a completed state is found
// @parma {[]} images found within the game scrape
function getCompletionFromImages(images) {
  return images.reduce((isCompleted, image) => {
    return isCompleted || completionTypes.indexOf(image.replace(/images\/|\.gif/gi, '')) > -1;
  }, false);
}

// Return a rating (or null) if an image for
// a star rating is found
// @parma {[]} images found within the game scrape
function getRaitingFromImages(images) {
  for (let x = 0; x < images.length; x++) {
    const image = images[x];
    const ratingMatch = image.match(/images\/(\d)_5stars.gif/)
    if (ratingMatch) {
      return parseInt(ratingMatch[1], 10);
    }
  }
  return null;
}

// Scrape HTML from Backloggery.com and return a list of
// object data that represents each game
// @param {String} html from Backloggery to scrape games from
// @param {function} callback to pass completion to
function scrape(html, callback) {
  const xray = new Xray();
  const scraper = xray(html, '.gamebox', [{
    title: 'h2 b',
    system: '.gamerow b',
    images: ['img@src']
  }]);
  scraper((err, data) => {
    if (err) {
      return callback(err);
    }
    return callback(null, data
      // remove all games without a title
      .filter(({ title=null }) => !!title)
      // map scrape into a sane Game object
      .map(({ title='', system='', images=[] }) => {
        const systemMatch = system.match(/\((.*?)\)/)
        const game = new Game({
          title: title.trim(),
          system: system.trim(),
          originalSystem: systemMatch ? system[1] : null,
          isCompleted: getCompletionFromImages(images),
          rating: getRaitingFromImages(images)
        });
        return game;
      }));
  });
}

export class Backloggery {
  // Request a list of games attached to the `username` account
  // on Backloggery. This request can be tested with cURL
  //   curl 'http://backloggery.com/games.php?user={{username}}&console=&rating=&status=&unplayed=&own=&search=&comments=&region=&region_u=2&wish=&alpha=&temp_sys=360&total=264&aid=2&ajid={{offset}}' \
  //     --compressed
  // @param {String} username of the backloggery user to scrap
  // @param {object} options
  //   - {Number} offset to start gathering games from
  //   - {Number} limit the number of games found
  // @param {function} callback to pass completion to
  static request(username, options, _callback) {
    const { initialOffset = 0, limit = undefined } = !_callback && typeof options === 'function' ? {} : options;
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
  // Parse and scrape the HTML from a Backloggery user's profile HTML
  // This can be used for offline support where making a request
  // is not available (e.g. testing)
  // @param {String} html from Backloggery to scrape games from
  // @param {object} options
  //   - {Number} offset to start gathering games from
  //   - {Number} limit the number of games found
  // @param {function} callback to pass completion to
  static fromHTML(html, options, _callback) {
    const { initialOffset = 0, limit = undefined } = !_callback && typeof options === 'function' ? {} : options;
    const callback = _callback || options || function () {};
    return scrape(html, function (err, games) {
      if (err) {
        return callback(err);
      }
      return callback(null, games.slice(initialOffset, limit));
    });
  }
}
