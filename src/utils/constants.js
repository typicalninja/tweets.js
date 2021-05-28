const pkgVersion = require('../../package.json').version;

module.exports.BASE_URL = 'https://api.twitter.com/';
module.exports.UPLOAD_URL = 'https://upload.twitter.com/';

// default options
module.exports.DefaultOptions = {
    subdomain: 'api',
    version: '1.1',
    consumer_key: process.env.CONSUMER_KEY || null,
    consumer_secret: process.env.CONSUMER_SECRET || null,
    access_token: process.env.ACCESS_TOKEN || null,
    access_token_secret: process.env.ACCESS_TOKEN_SECRET || null,
    bearer_token: process.env.BEARER_TOKEN || null,
    emitter: true,
    emitterUrl: 'statuses/filter',
                        };
// Base headers
module.exports.BASE_HEADERS = {
    'Content-Type': 'application/json',
     Accept: 'application/json',
     'User-Agent': `tweets.js/${pkgVersion} (https://github.com/typicalninja493/tweets.js)`,
};


// base get headers

module.exports.BASE_GET_HEADERS = {
    'User-Agent': `tweets.js/${pkgVersion} (https://github.com/typicalninja493/tweets.js)`,
};

// json endpoints: https://github.com/draftbit/twitter-lite/blob/master/twitter.js#L40
module.exports.JSON_ENDPOINTS = [
    'direct_messages/events/new',
    'direct_messages/welcome_messages/new',
    'direct_messages/welcome_messages/rules/new',
    'media/metadata/create',
    'collections/entries/curate',
  ];