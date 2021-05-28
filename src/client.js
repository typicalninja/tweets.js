const constants = require('./utils/constants');
const Func = require('./utils/functions.js');
const querystring = require("querystring");
const EventEmitter = require('events');
const sm = require('./streamManager');

// request client
const fetch = require('node-fetch');

// Internal Structures
const tweet = require('./struc/tweet.js');
const User = require('./struc/user');

/**
 * The core client
 * @param {Object} Options - Options for tweets.js client
 * @param {String} options.version - twitter api version to use, defaults to 1.1
 * @param {String} options.emitter - should the stream be enabled on startup
 * @param {String} options.subdomain - twitter subdomain to use, no recommended to edit
 * @param {String} options.bearer_token - twitter bearer_token
 * @param {String} options.consumer_secret - your consumer secret
 * @param {String} options.consumer_key - if options.emitter is true, the url to stream from
 * @param {String} options.access_token - your access-token
 * @param {String} options.access_token_secret - your access-token-secret
 */
class client extends EventEmitter {
    constructor(options = {}) {
      super();
        if(!options || typeof options !== 'object') throw new Error('Options not provided');
        // the raw options provided by the user
        this._RawOptions = options;
// the merged options
        const config = Object.assign({}, constants.DefaultOptions, options);
        this._options = config;
        if(this._options.emitter) this.indefinite = true;
        if(this._options.emitterUrl) this.streamUrl = this._options.emitterUrl;
        // set the version for future use
        this.version = config.version == '1.1' ? '1' : '2';
        // Set the auth type for restricting function to certain types
        this.authenticationType = config.bearer_token ? 'APP' : 'USER';
 // create the main internal oauth client
        this._client = Func.createClient(config.consumer_key, config.consumer_secret);
// get the base url
        this.BaseUrl = Func.getUrl(config.subdomain, config.version);

        if(this.authenticationType === 'USER') {
          this._UserData = {
            key: this._options.access_token,
            secret: this._options.access_token_secret,
          };
        }

        this.stream = null;
    }
    /**
   * Build all the data required to be sent to twitter
   * @param {string} method - 'GET' or 'POST'
   * @param {string} path - the API endpoint
   * @param {object} parameters - request parameters
   */
    _buildRequest(method, path, parameters) {
        const Data = {
            url: `${this.BaseUrl}/${path}${this.version == '1' ? '.json' : ''}`,
            method: method,
          };

        if (parameters) {
            if (method === 'POST') Data.data = parameters;
            else Data.url += '?' + querystring.stringify(parameters);
        }
  
        let headers = {};
        if (this.authenticationType === 'USER') {
          headers =  this._client.toHeader(
            this._client.authorize(Data, this._UserData),
          );
        } else {
          headers = {
            Authorization: `Bearer ${this._options.bearer_token}`,
          };
        }
        return {
          Data,
          headers,
        };

    }
      /**
   * Handle the returned response from the fetch request
   * @param {Response} response -   Returned response
   */
    async _handleResponse(resp) {
      const headers = resp.headers;

      if (resp.ok) {
        // Return empty response on 204 , or content-length = 0
        if (resp.status === 204 || resp.headers.get('content-length') === '0')
          return {
            _headers: headers,
          };
        // Otherwise, parse JSON response
        return resp.json().then(res => {
          res._headers = headers;
          return res;
        });
      } else {
        throw {
          _headers: headers,
          ...await resp.json(),
        };
      }
    }
     /**
   * Send a GET request
   * @param {string} path- endpoint, e.g. `followers/ids`
   * @param {object} [parameters] - optional parameters
   */
    get(path, parameters) {
      const reqData = this._buildRequest(
        'GET',
        path,
        parameters,
      );
  const headers = Object.assign({}, constants.BASE_GET_HEADERS, reqData.headers);
      return fetch(reqData.Data.url, { headers: headers }).then(this._handleResponse);
    }
    // https://github.com/draftbit/twitter-lite/blob/master/twitter.js#L40
    /**
   * Send a post request
   * @param {string} path- endpoint, e.g. `followers/ids`
   * @param {object} [parameters] - optional parameters
   */
    post(path, parameters) {
      const reqData = this._buildRequest(
        'POST',
        path,
        constants.JSON_ENDPOINTS.includes(path) ? null : parameters, // don't sign JSON bodies; only parameters
      );

      const Headers = Object.assign({}, constants.BASE_HEADERS, reqData.headers);

      if (constants.JSON_ENDPOINTS.includes(path)) {
        parameters = JSON.stringify(parameters);
      } else {
        parameters = Func.percentEncode(querystring.stringify(parameters));
        Headers['Content-Type'] = 'application/x-www-form-urlencoded';
      }

    return fetch(reqData.Data.url, { method: 'POST', headers: Headers, body: parameters }).then(this._handleResponse);
    }

  /**
   * post a tweet
   * @param {string} message- tweet to post
   * @param {object} options - tweet options
   * @param {object} options.body - additional body with the constructed body
   */
   async tweet(message, options = {}) {
     if(this.authenticationType !== 'USER') throw new Error(`Auth type must be a user type to tweet, got "${this.authenticationType}"`);
        if(!message) throw new Error('Cannot tweet a empty message');
        if(options && typeof options !== 'object') throw new Error('Options must be a object');
        const body = {
          status: message,
        };
// add user provided body to original body
        if(options.body && typeof options.body == 'object') {
          const keys = Object.keys(options.body);
          keys.forEach((key) => {
            body[key] = options.body[key];
          });
        }
      const request = await this.post('statuses/update', body);
      return new tweet(request, this);
   }

   /**
   * reply to a tweet
   * @param {string} message- tweet to post
   * @param {string} to - Id of the tweet to reply
   * @param {object} options - options for reply()
   */
   async reply(message, to, options = {}) {
     if(this.authenticationType !== 'USER') throw new Error(`Auth type must be a user type to tweet/reply, got "${this.authenticationType}"`);
     if(!to) throw new Error(`Need a tweet id to reply to`);
     if(!message) throw new Error('Cannot reply with a empty message');
     if(options && typeof options !== 'object') throw new Error('Options must be a object');

     const body = {
      status: message,
      in_reply_to_status_id: to,
      auto_populate_reply_metadata: true,
    };

    if(options.body && typeof options.body == 'object') {
      const keys = Object.keys(options.body);
      keys.forEach((key) => {
        body[key] = options.body[key];
      });
    }

    const request = await this.post('statuses/update', body);
    return new tweet(request, this);
   }

     /**
   * Make a thread
   * @param {Array} threadMessage- Array of messages to make a thread out of
   * @param {Object} options - options for either repl() or tweet()
   * @param {String} options.lastTweetID - starting the thread with already posted tweet?
   */
   async thread(threadMessages = [], options = {}) {
    if(this.authenticationType !== 'USER') throw new Error(`Auth type must be a User, got "${this.authenticationType}"`);
     if(!threadMessages) throw new Error('Cannot create a empty thread');
     if(!Array.isArray(threadMessages)) throw new Error(`threadMessages Must be a array got "${typeof threadMessages}"`);
   
     // keep track of the last tweet posted
     let lastTweetID = options.lastTweetID || null;
     // make a empty array to be returned later with all the thread tweets classes
     const threads = [];
     for (const message of threadMessages) {
       // if this is the first message
       if(!lastTweetID) {
        const tweet = await this.tweet(message, options);
        if(tweet.id) {
          lastTweetID = tweet.id;
        }
        threads.push(tweet);
        // if this is one of the messages after the first
       } else {
         const tweet = await this.reply(message, lastTweetID, options);
         if(tweet.id) {
          lastTweetID = tweet.id;
        }
        threads.push(tweet);
       }
           
       }
// return the threads
       return threads;
    }

       /**
   * Follow a user
   * @param {String} user- A user id or screen name
   * @param {Boolean} notifications - weather to Enable notifications for the target user
   */
    async follow(user, notifications = true) {
      if(this.authenticationType !== 'USER') throw new Error(`Auth type must be a User, got "${this.authenticationType}"`);
      if(!user) throw new Error('Please give me either a user id or a user screen name to follow');
      if(typeof user !== 'string' && typeof user !== 'number' && isNaN(user)) throw new Error(`User must be a userID (number) or a user scree name, received ${typeof user}`);
     // empty object, add values to this
      const body = {};
      // decide if a user id or a screen Name was provided
      if(isNaN(user)) body.screen_name = user; 
      else body.user_id = user;
      // if notifs are enabled or not
      if(notifications) body.follow = true; 
      else body.follow = false; 
// send the request
      const request = await this.post('friendships/create', body);
      return new User(request, this);
    }

  /**
   * unFollows a user
   * @param {String} user- A user id or screen name
   */
    async unfollow(user) {
      if(this.authenticationType !== 'USER') throw new Error(`Auth type must be a User, got "${this.authenticationType}"`);
      if(typeof user !== 'string' && typeof user !== 'number' && isNaN(user)) throw new Error(`User must be a userID (number) or a user scree name, received ${typeof user}`);

       // empty object, add values to this
       const body = {};
       // decide if a user id or a screen Name was provided
       if(isNaN(user)) body.screen_name = user; 
       else body.user_id = user;

       const request = await this.post('friendships/destroy', body);
       return new User(request, this);
    }

     /**
   * Search users by a query
   * @param {String} query- query to search users of, ex: nodejs
   * @param {Object} options - request options
   * @param {String} options.page - Specifies the page of results to retrieve.
   * @param {String} options.count - The number of potential user results to retrieve per page. This value has a maximum of 20.
   * @param {string} options.includeEntities - The entities node will not be included in embedded Tweet objects when set to false
   */
    async searchUsers(query, options = {}) {
   if(!query) throw new Error('Cannot search for a empty query');
   if(typeof query !== 'string') throw new Error('query must be a string,');
   if(typeof options !== 'object') throw new Error('options must be a object');
   const parameters = {
     q: query,
     page: '1',
     count: '2',
   };
   if(options.page && !isNaN(options.page) && options.page <= 10) parameters.page = options.page;
   if(options.count && !isNaN(options.count) && options.count <= 20) parameters.count = options.count;
   if(options.includeEntities && typeof options.includeEntities === 'boolean') parameters.include_entities = options.includeEntities;
// do request
   const request = await this.get('users/search', parameters);
// keep a array to push later
   const users = [];

   for(const user of request) {
      const constructedUserClass = new User(user, this);
      users.push(constructedUserClass);
   }

   return users;
    }
  
     start(parameters = {}, path = this.streamUrl) {
      if(this.authenticationType !== 'USER') throw new Error(`Auth type must be a User, got "${this.authenticationType}"`);
      if(!this.indefinite) throw new Error('Stream disabled');

      this.stream = new sm();

      const Data = {
        url: `${Func.getUrl('stream')}/${path}${this.version == '1' ? '.json' : ''}`,
        method: 'POST',
      };

      if (parameters) Data.data = parameters;

      const headers = this._client.toHeader(
        this._client.authorize(Data, this._UserData),
      );
      headers['Content-Type'] = 'application/x-www-form-urlencoded';

    const streamRequest = fetch(Data.url, { method: 'POST', headers: headers , body: Func.percentEncode(querystring.stringify(parameters)), });
    
    
    streamRequest
      .then(response => {
        this.stream.destroy = () => response.body.destroy();

        if (response.ok) {
          this.emit('ready', response);
        } else {
          response._headers = response.headers;
          this.emit('error', response);
        }


        response.body.on('data', chunk => {
          let parsed;
          try {
           parsed = this.stream._parse(chunk);
          } catch(err) {
            return this.emit('error', err);
          }

          if(!parsed) return;

          if(parsed === 'ping') return this.emit('ping');
         
             return this.emit(parsed.event || 'data', parsed);
        });

        response.body.on('error', error => this.emit('error', error));
        response.body.on('end', () => this.emit('end', response));
      }).catch(error => this.emit('error', error));

      return this;
  }
}

module.exports = client;