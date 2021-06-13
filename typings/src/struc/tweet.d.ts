declare const User: any;
/**
 * The internal message/tweets class
 * @class
 * @param {Object} response - response from the fetch request
 * @param {Client}  twitterClient - tweets.js client
 */
declare class tweet {
    /**
 * Tweet class constructor
 * @constructor
 * @param {Object} response - Raw response from get/post request
 * @param {client}  client - tweets.js client
 */
    constructor(response: any, client: any);
    /**
* reply to the tweet which belongs to this Object
* @param {string} message - tweet to post as a reply
* @param {object} options - options for reply()
*/
    reply(message: any, options?: {}): any;
    /**
    * retweet the tweet belonging to this object
    * @param {String} tweetID - the id of the tweet
    */
    retweet(tweetID: any): any;
}
