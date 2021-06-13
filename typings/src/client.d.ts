declare const constants: any;
declare const Func: any;
declare const querystring: any;
declare const streamManager: any;
declare const wait: any;
declare const fetch: any;
declare const tweet: any;
declare const User: any;
/**
 * The core client
 * @class
 * @param {ClientOptions} Options - Options for tweets.js client
 */
declare class client {
    constructor(options?: {});
    /**
     * Build all the data required to be sent to twitter
     * @param {string} method - 'GET' or 'POST'
     * @param {string} path - the API endpoint
     * @param {object} parameters - request parameters
     * @private
     */
    _buildRequest(method: any, path: any, parameters: any): {
        Data: {
            url: string;
            method: any;
        };
        headers: {};
    };
    /**
     * Handle the returned response from the fetch request
     * @param {Response} response -   Returned response
     * @private
     */
    _handleResponse(resp: any): Promise<any>;
    /**
     * Send a GET request
     * @param {string} path - endpoint, e.g. `followers/ids`
     * @param {object} [parameters] - optional parameters
     */
    get(path: any, parameters: any): Promise<any>;
    /**
     * Send a post request
     * @param {string} path - endpoint, e.g. `followers/ids`
     * @param {object} [parameters] - optional parameters
     */
    post(path: any, parameters: any): Promise<any>;
    /**
     * post a tweet
     * @param {string} message - tweet to post
     * @param {object} options - tweet options
     * @param {object} options.body - additional body with the constructed body
     * @returns {tweet}
     */
    tweet(message: any, options?: {}): Promise<any>;
    /**
     * gets a tweet
     * @param {Array} tweetIds - Array of tweet ids to get
     * @param {object} options - method options
     * @param {object} options.include_entities - The entities node that may appear within embedded statuses will not be included when set to false.
     * @return {Array<tweet>}
     */
    getTweets(tweetIds?: never[], options?: {}): Promise<any[]>;
    /**
     * reply to a tweet
     * @param {string} message - tweet to post
     * @param {string} to - Id of the tweet to reply
     * @param {object} options - options for reply()
     * @param {object} options.body - additional body with the constructed body
     * @returns {tweet}
     */
    reply(message: any, to: any, options?: {}): Promise<any>;
    /**
     * Make a thread
     * @param {Array<any>} threadMessages - Array of messages to make a thread out of
     * @param {Object} options - options for either reply() or tweet()
     * @param {String} options.lastTweetID - starting the thread with already posted tweet?
     * @param {String} options.delay - add a delay to in how many time it should take to post it tweet, default to 10000
     * @return {Promise<tweet[]>}
     */
    thread(threadMessages?: never[], options?: {}): Promise<any[]>;
    /**
     * Follow a user
     * @param {String} user - A user id or screen name
     * @param {Boolean} notifications - weather to Enable notifications for the target user
     * @returns {Promise<User>}
     */
    follow(user: any, notifications?: boolean): Promise<any>;
    /**
     * unFollows a user
     * @param {String} user - A user id or screen name
     * @returns {Promise<User>}
     */
    unfollow(user: any): Promise<any>;
    /**
     * unFollows a user
     * @param {String} file - A url or a file path to image/media file
     * @param {Object} options - options for uploadMedia()
     * @param {String} options.altText - alt text for image
     * @param {String} options.message - optional message to post with the media
     * @returns {Promise<tweet>}
     */
    uploadMedia(file: any, options?: {}): Promise<any>;
    verifyCredentials(): Promise<any>;
    /**
     * Search users by a query
     * @param {String} query - query to search users of, ex: nodejs
     * @param {Object} options - request options
     * @param {String} options.page - Specifies the page of results to retrieve.
     * @param {String} options.count - The number of potential user results to retrieve per page. This value has a maximum of 20.
     * @param {string} options.includeEntities - The entities node will not be included in embedded Tweet objects when set to false
     * @returns {Promise<User[]>}
     */
    searchUsers(query: any, options?: {}): Promise<any[]>;
    /**
     * Get a users follower list
     * @param {String} user - A user id or screen name
     * @param {Object} options - Options for twitter api
     * @param {String} options.count - The number of user results to retrieve, max of 200
     * @param {Boolean} options.skip_status - Weather to not include status in the api response
     * @param {Boolean} options.include_user_entities - The user object entities node will not be included when set to false
     * @returns {Promise<User[]>}
     */
    getFollowers(user: any, options?: {}): Promise<any[]>;
    /**
     * gets A specific user from the api
     * @param {String} user - A user id or screen name
     * @returns {Promise<User>}
     */
    getUser(user: any): Promise<any>;
    /**
     * retweet a tweet
     * @param {String} tweetID - the id of the tweet
     * @returns {Promise<tweet>} returns the tweet object for this tweet
     */
    retweet(tweetID: any): Promise<any>;
    /**
     * Start the stream
     * @param {Object} parameters - parameters for twitter api
     * @param {String} path - url to stream, defaults to what you set as stream url in client options
     * @returns {streamManager}
     */
    start(parameters?: {}, path?: any): any;
}
