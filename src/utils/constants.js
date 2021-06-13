const pkgVersion = require('../../package.json').version;

module.exports.BASE_URL = 'https://api.twitter.com/';
module.exports.UPLOAD_URL = 'https://upload.twitter.com/';

// default options

/**
 * Options for a client.
 * @typedef {Object} ClientOptions
 * @property {String} subdomain - the subdomain to use for twitter api, ex: api becomes https://api.twitter.com
 * @property {String} version - twitter api version to use https://api.twitter.com
 * @property {String} consumer_key - your consumer key if authentication as a USER, if not present fetches from env
 * @property {String} consumer_secret - Your consumer secret if authentication as a USER, if not present fetches from env
 * @property {String} access_token - Your access token (key) if authentication as a USER, if not present fetches from env
 * @property {String} access_token_secret - Your access token secret if authentication as a USER, if not present fetches from env
 * @property {String} bearer_token - Your bearer token if authenticating as a APP, if not present fetches from env
 * @property {Boolean} emitter - weather to enable the stream
 * @property {String} emitterUrl - the url to stream from, ex: statuses/filter
 * @property {Boolean} autoReconnect - Weather to autoReconnect the stream if a dead stream is found (ping timeout exceeded)
 * @property {Number} reconnectInterval - the interval reconnect will take to disconnect and reconnect
 * @property {Boolean} verifyCredentials - weather to verify credentials provided on app startup
 */
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
    autoReconnect: true,
    reconnectInterval: 10000, 
    verifyCredentials: true,
    structures: ['USER'],
    };

module.exports.defaultStreamOptions = {
 
};
// Base headers
module.exports.BASE_HEADERS = {
    'Content-Type': 'application/json',
     Accept: 'application/json',
     'User-Agent': `tweets.js/${pkgVersion} (https://github.com/typicalninja493/tweets.js)`,
};

module.exports.upload_ends = ["media/upload", "media/metadata/create"];


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