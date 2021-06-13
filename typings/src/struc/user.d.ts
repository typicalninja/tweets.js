/**
 * The internal user class
 * @class
 * @param {JsonRequestResponse} UserResponse - User response from the fetch request
 * @param {Client}  twitterClient - tweets.js client
 */
 declare class User {
    /**
   * main user constructor
   * @constructor
   * @param {JsonRequestResponse} UserResponse - User response from the fetch request
   * @param {Client} client - tweets.js client
   */
    constructor(UserResponse: any, client: any);
    /**
       * Follow the user which belongs to this User object, alias to main client class follow()
       * @param {Boolean} notifications - weather to Enable notifications for the target user
       */
    follow(notifications?: boolean): any;
    /**
      * unFollows the user which belongs to this User object, alias to main client class unfollow(), params are auto placed
      */
    unfollow(): any;
    /**
   * Get the followers of the user which belongs to this User object, alias to main client class getFollowers(), same options from main
   * @param {Object} options - options for getFollowers()
   */
    getFollowers(options?: {}): any;
}
