/**
 * The internal user class
 * @param {Object} UserResponse - User response obj from the fetch request original object
 * @param {Client}  twitterClient - tweets.js client
 */
class User {
    constructor(UserResponse, client) {
          this.raw = UserResponse;
         this.id = UserResponse.id_str;
       
         // username
         this.name = UserResponse.name;
         // screenName
         this.screenName = UserResponse.screen_name;
         this.entities = UserResponse.entities;
         this.createdAt = UserResponse.created_at;

         this.likedPosts = UserResponse.favourites_count;
         this.followers = UserResponse.followers_count;
         this.friends = UserResponse.friends_count;

         this.avatarUrl = UserResponse.profile_image_url_https;
         this.bannerUrl = UserResponse.profile_background_image_url_https;

         this.default = UserResponse.default_profile;
         this.defaultImg = UserResponse.default_profile_image;

         this._client = client;

         this.following = UserResponse.following;
    }
/**
   * Follow the user which belongs to this User object
   * @param {Boolean} notifications - weather to Enable notifications for the target user
   */
    follow(notifications = true) {
        if(this.following) return this;
       return this._client.follow(this.id, notifications);
    }
 /**
   * unFollows a user
   * @param {String} user- A user id or screen name
   */
    unfollow() {
        if(!this.following) return this;
        return this._client.unfollow(this.id);
    }
}

module.exports = User;
