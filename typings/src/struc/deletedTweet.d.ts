const User = require("./user");

/**
 * The internal deletedTweet class, similar to tweet class
 * @class
 * @param {Object} response - deleted tweet response from the fetch request
 * @param {Client}  twitterClient - tweets.js client
 */
class deletedTweet {
    constructor(response, client) {
          /**
         * Raw response from the api         
         * @type {Object}
         */
        this.raw = response;
          /**
         * an property to decide is the tweet class returned was for deletedTweet        
         * @type {Boolean}
         */
        this.deleted = true;
          /**
         * Deleted tweet id    
         * @type {String}
         */
        this.id = response.status.id_str;
        if(client._options.structures.includes('USER')) {
            const userData = client.getUser(response.status.user_id_str);
              /**
             * The author of the deleted tweet, present only if USER structure enabled
             * @type {User}
              */
            this.user = userData;
        } else {
            this.user = null;
        }
    }
}

module.exports = deletedTweet;