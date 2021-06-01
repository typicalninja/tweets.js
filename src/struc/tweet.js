const User = require("./user");
/**
 * The internal message/tweets class
 * @class
 * @param {Object} response - response from the fetch request
 * @param {Client}  twitterClient - tweets.js client
 */
class tweet {
    /**
 * Tweet class constructor
 * @constructor
 * @param {Object} response - Raw response from get/post request
 * @param {client}  client - tweets.js client
 */
    constructor(response, client) {
         /**
         * Tweet id (string)
         * @type {String}
         */
        this.id = response.id_str;
         /**
         * Raw response from the api         
         * @type {Object}
         */
        this.raw = response;
         /**
         * the tweets.js client
         * @type {Client}
         */
        this.client = client;
         /**
         * when the tweet was created
         * @type {String}
         */
        this.createdAt = response.created_at;
         /**
         * tweet text
         * @type {String}
         */
        this.content = response.text;
        // * Removed: support older versions (below v14) - this.replyTo = response.in_reply_to_status_id_str ? response.in_reply_to_status_id_str : response.in_reply_to_user_id_str;
         /**
         * id of the post/user which this tweet was posted as a reply (if any)
         * @type {?String}
         */
        this.replyTo = response.in_reply_to_status_id_str ||  response.in_reply_to_user_id_str;

        this.entities = response.entities;
          /**
         * The user class of this tweets author
         * @type {User}
         */
        this.user = new User(response.user, client);

         /**
         * Retweets count of this tweet
         * @type {String}
         */
        this.retweets = response.retweet_count;

         /**
         * Request information
         * @type {Object}
         */
        this.request = {
            headers: response._headers,
        };

        if(response.retweeted_status) {
            this.retweet = new tweet(response.retweeted_status, client);
        } else {
            this.retweet = false;
        }

        this.tweetUrl = `https://twitter.com/${this.user.screenName}/status/tweet.id_str`;

    }
       /**
   * reply to the tweet which belongs to this Object
   * @param {string} message - tweet to post as a reply
   * @param {object} options - options for reply()
   */
    reply(message, options = {}) {
        if(!message) throw new Error('Cannot reply with a empty message');
        if(options && typeof options !== 'object') throw new Error('Options must be a object');

        return this.client.reply(message, this.id, options);
    }

   /**
   * retweet the tweet belonging to this object
   * @param {String} tweetID - the id of the tweet
   */
    retweet(tweetID) {
       if(!tweetID) throw new Error('tweet id is not present');
       return this.client.retweet(this.id);
    }
}

module.exports = tweet;