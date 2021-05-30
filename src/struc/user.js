/**
 * The internal user class
 * @class
 * @param {JsonRequestResponse} UserResponse - User response from the fetch request
 * @param {Client}  twitterClient - tweets.js client
 */
class User {
  
    /**
   * main user constructor
   * @constructor
   * @param {JsonRequestResponse} UserResponse - User response from the fetch request
   * @param {Client} client - tweets.js client
   */
    constructor(UserResponse, client) {
          /**
         * Raw user from twitter api
         * @type {String}
         */
          this.raw = UserResponse;
            /**
         * The user id  of this user
         * @type {String}
         */
         this.id = UserResponse.id_str;
       
          /**
         * The user username
         * @type {String}
         */
         this.name = UserResponse.name;

         /**
         * The user screenName
         * @type {String}
         */
         this.screenName = UserResponse.screen_name;
         this.entities = UserResponse.entities;
         /**
         * When the user's account was created At
         * @type {String}
         */
         this.createdAt = UserResponse.created_at;
          /**
         * Users liked posts
         * @type {String}
         */
         this.likedPosts = UserResponse.favourites_count;
         this.followers = UserResponse.followers_count;
         this.friends = UserResponse.friends_count;

         this.avatarUrl = UserResponse.profile_image_url_https;
         this.bannerUrl = UserResponse.profile_background_image_url_https;

         this.default = UserResponse.default_profile;
         this.defaultImg = UserResponse.default_profile_image;

         this._client = client;

           /**
         * Weather the user is followed by you
         * @type {Boolean}
         */
         this.following = UserResponse.following;

         /**
         * User profile url, unreliable, uses screenName for the url to user profile
         * @type {String}
         */
         this.profileURL = `https://twitter.com/${this.screenName}`;
    }
/**
   * Follow the user which belongs to this User object, alias to main client class follow()
   * @param {Boolean} notifications - weather to Enable notifications for the target user
   */
    follow(notifications = true) {
        if(this.following) return this;
       return this._client.follow(this.id, notifications);
    }
 /**
   * unFollows the user which belongs to this User object, alias to main client class unfollow(), params are auto placed
   */
    unfollow() {
        if(!this.following) return this;
        return this._client.unfollow(this.id);
    }

    /**
   * Get the followers of the user which belongs to this User object, alias to main client class getFollowers(), same options from main
   * @param {Object} options - options for getFollowers()
   */
    getFollowers(options = {}) {
    if(typeof options !== 'object') throw new Error(`options must be a object, got ${typeof options}`);
    return this._client.getFollowers(this.id, options);
    }
}

module.exports = User;
