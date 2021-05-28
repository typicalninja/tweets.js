const User = require("./user");
/**
 * The internal message/tweets class
 * @param {Object} response - response from the fetch request
 * @param {Client}  twitterClient - tweets.js client
 */
class tweet {
    constructor(response, client) {
        this.id = response.id_str;
        this.raw = response;
        this.client = client;
        this.createdAt = response.created_at;
        this.content = response.text;
        // * Removed: support older versions (below v14) - this.replyTo = response.in_reply_to_status_id_str ? response.in_reply_to_status_id_str : response.in_reply_to_user_id_str;
        this.replyTo = response.in_reply_to_status_id_str ||  response.in_reply_to_user_id_str;

        this.entities = response.entities;
        this.tweetID = response.id_str;

        this.user = new User(response.user, client);

        this.retweets = response.retweet_count;

        this.request = {
            headers: response._headers,
        };

    }
       /**
   * reply to a tweet
   * @param {string} message- tweet to post as a reply
   * @param {object} options - options for reply()
   */
    reply(message, options = {}) {
        if(!message) throw new Error('Cannot reply with a empty message');
        if(options && typeof options !== 'object') throw new Error('Options must be a object');

        return this.client.reply(message, this.id, options);
    }
}

module.exports = tweet;