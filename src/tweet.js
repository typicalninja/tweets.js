const { EventEmitter } = require("events");
const crypto = require("crypto");
const OAuth = require("oauth-1.0a");
const fetch = require("node-fetch");
const merge = require("deepmerge");
const querystring = require("querystring");
const fs = require("fs");
const { isUrl, download } = require("../src/functions.js");

const createOauthClient = ({ key, secret }) => {
  const client = OAuth({
    consumer: { key, secret },
    signature_method: "HMAC-SHA1",
    hash_function(baseString, key) {
      return crypto.createHmac("sha1", key).update(baseString).digest("base64");
    },
  });
  return client;
};
this.baseheaders = {
  "Content-Type": "application/json",
  Accept: "application/json",
};
const upload_ends = ["media/upload", "media/metadata/create"];

const JSON_ENDPOINTS = [
  "direct_messages/events/new",
  "statuses/retweet",
  "direct_messages/welcome_messages/new",
  "direct_messages/welcome_messages/rules/new",
  "media/metadata/create",
  "collections/entries/curate",
];

this.DefaultOptions = {
  consumer_key: process.env.CONSUMER_KEY || null,
  consumer_secret: process.env.CONSUMER_SECRET || null,
  access_token: process.env.ACCESS_TOKEN || null,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET || null,
  bearer_token: process.env.BEARER_TOKEN || null,
};

function encode(string) {
  return string
    .replace(/!/g, "%21")
    .replace(/\*/g, "%2A")
    .replace(/'/g, "%27")
    .replace(/\(/g, "%28")
    .replace(/\)/g, "%29");
}

class tweet extends EventEmitter {
  constructor(options) {
    super();
    if (!options) {
      throw new Error(
        "No options provided, please read our docs at https://node-tweet.axixdevelopment.gq"
      );
    }

    this.Options = merge(this.DefaultOptions, options);

    this.authType = this.Options.bearer_token ? "App" : "User";

    const config = this.Options;
    this.client = createOauthClient({
      key: this.Options.consumer_key,
      secret: this.Options.consumer_secret,
    });

    this.baseurl = `https://api.twitter.com/1.1`;
    this.uploadurl = `https://upload.twitter.com/1.1`;

    this.token = {
      key: config.access_token,
      secret: config.access_token_secret,
    };
    this.emit("start");
  }

  // handle response fetch

  async _handleResponse(response) {
    const headers = response.headers;
    if (response.ok) {
      if (
        response.status === 204 ||
        response.headers.get("content-length") === "0"
      )
        return {
          _headers: headers,
        };
      // Otherwise, parse JSON response
      return response.json().then((res) => {
        res._headers = headers;
        return res;
      });
    } else {
      throw {
        _headers: headers,
        ...(await response.json()),
      };
    }
  }
  // -------------------------

  async getBearerToken() {
    const headers = {
      Authorization:
        "Basic " +
        Buffer.from(
          this.Options.consumer_key + ":" + this.Options.consumer_secret
        ).toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
    };

    const results = await fetch("https://api.twitter.com/oauth2/token", {
      method: "POST",
      body: "grant_type=client_credentials",
      headers: headers,
    }).then((res) => res.json());

    return results;
  }
  _makeRequest(method, resource, parameters) {
    let requestData = {
      url: `${
        upload_ends.includes(resource) ? this.uploadurl : this.baseurl
      }/${resource}.json`,
      method: method,
    };
    if (parameters) {
      if (method === "POST") {
        requestData.data = parameters;
      } else {
        requestData.url += "?" + querystring.stringify(parameters);
      }
    }
    let headers = {};
    if (this.authType === "User") {
      headers = this.client.toHeader(
        this.client.authorize(requestData, this.token)
      );
    } else {
      headers = {
        Authorization: `Bearer ${this.Options.bearer_token}`,
      };
    }

    return {
      requestData,
      headers,
    };
  }
  // ---- Make request ----

  async tweet(tweet, options, callback) {
    let id = "";
    if (options) {
      if (options.reply_to) {
        id = options.reply_to;
      }
    }
    if (!tweet) {
      throw new Error("Specify a message to tweet");
    }
    let body = {
      status: tweet,
      in_reply_to_status_id: id,
    };
    const { requestData, headers } = this._makeRequest(
      "POST",
      "statuses/update",
      body
    );

    const postHeaders = Object.assign({}, this.baseheaders, headers);
    postHeaders["Content-Type"] = "application/x-www-form-urlencoded";

    body = encode(querystring.stringify(body));

    const s = await fetch(requestData.url, {
      method: "POST",
      headers: postHeaders,
      body: body,
    }).then((res) => res.json());

    if (s.errors) {
      console.log(s);
      throw new Error(
        `Post request received a error as response, did you try to post the same message twice?`
      );
    }
    let construct = {
      id: s.id_str,
      tweet_message: s.text,
      request: s,
      user: {
        id: s.user.id,
        id_str: s.user.id_str,
        username: s.user.name,
        screen_name: s.user.screen_name,
        description: s.user.description,
        followers: s.user.followers_count,
        createdAt: s.user.created_at,
        verified: s.user.verified,
        avatarUrl: s.user.profile_image_url_https,
        bannerUrl: s.user.profile_background_image_url_https,
      },
      error: null,
      retweet: s.retweeted,
    };
    if (callback) {
      return callback(construct, s);
    }

    return construct;
  }

  async reply(message, tweet_id) {
    if (!message) {
      throw new Error("Trying to send an empty tweet");
    }
    if (!tweet_id) {
      throw new Error("tweet_id is a required field that is missing");
    }
    const body = {
      status: message,
      in_reply_to_status_id: tweet_id,
      auto_populate_reply_metadata: true,
    };
    this.post("statuses/update", body).then((s) => {
      if (s.errors) {
        return console.log(s);
      } else {
        let construct = {
          id: s.id_str,
          tweet_message: s.text,
          request: s,
          user: {
            id: s.user.id,
            id_str: s.user.id_str,
            username: s.user.name,
            screen_name: s.user.screen_name,
            description: s.user.description,
            followers: s.user.followers_count,
            createdAt: s.user.created_at,
            verified: s.user.verified,
            avatarUrl: s.user.profile_image_url_https,
            bannerUrl: s.user.profile_background_image_url_https,
          },
          error: null,
          retweet: s.retweeted,
        };
        return construct;
      }
    });
  }
  async retweet(id) {
    if (!id) {
      throw new Error("Id is a needed argument that is missing");
    }
    if (id && isNaN(id)) {
      throw new Error("Id must be a number");
    }
    let para = { id: id };
    await this.get("statuses/lookup", para).then(async (r) => {
      if (r.length == 0) {
        throw new Error(`The given id "${id}" is not valid!!`);
      } else {
        let c;
        let url = `statuses/retweet/${id}`;
        await this.post(url, {}).then((r) => {
          c = r;
        });
        return c;
      }
    });
  }
async getUser(val, callback){
  if(!val) {
    throw new Error('Please provide a name or a id for getUser()');
  }
if(isNaN(val)) {
  let para = {
    screen_name: val
  };
  this.get('users/show', para).then(r => {
    if(callback){
      callback(r);
    } else {
      return r;
    }
  });
    } else {
      let para = {
        user_id: val
      };
      this.get('users/show', para).then(r => {
        if(callback){
          callback(r);
        } else {
          return r;
        }
      });
    }

  }

async uploadMedia(path, options, callback) {
    if (!options) {
      throw new Error("Options are missing!!");
    }
    if (options && !options.alt_text) {
      throw new Error("Option alt_text is a needed option!!");
    }
    if (callback && typeof callback !== "function") {
      throw "INVALID CALLBACK.";
    }

    if (fs.existsSync(path)) {
      const b64i = fs.readFileSync(path, { encoding: "base64" });
      const body = {
        media_data: b64i,
      };

      await this.post("media/upload", body).then(async (r) => {
        if (!r.errors) {
          const mediaIdStr = r.media_id_string;

          const altText = options.alt_text;

          const meta_body = {
            media_id: mediaIdStr,
            alt_text: { text: altText },
          };

          await this.post("media/metadata/create", meta_body).then(async () => {
            const text = options.tweet_message;
            const params = { status: text, media_ids: [mediaIdStr] };
            await this.post("statuses/update", params).then((res) => {
              return res;
            });
          });
        }
      });
    } else if (isUrl(path)) {
      // download stuff
      await download(path).then(async (d) => {
        let t = this;
        const p = d.path;
        setTimeout(async function () {
          console.log("[Node-tweet]-Posting your downloaded images");
          if (fs.existsSync(p)) {
            const b64i = fs.readFileSync(p, { encoding: "base64" });

            const body = {
              media_data: b64i,
            };

            await t.post("media/upload", body).then(async (r) => {
              if (!r.errors) {
                const mediaIdStr = r.media_id_string;

                const altText = options.alt_text;

                const meta_body = {
                  media_id: mediaIdStr,
                  alt_text: { text: altText },
                };

                await t
                  .post("media/metadata/create", meta_body)
                  .then(async () => {
                    const text = options.tweet_message;
                    const params = { status: text, media_ids: [mediaIdStr] };
                    await t.post("statuses/update", params).then((r) => {
                      if (callback) {
                        callback(r);
                      } else {
                        return r;
                      }
                    });
                  });
              }
            });
          } else {
            throw new Error(
              `Could not find the file ${p} - that was downloaded`
            );
          }
        }, 3000);
      });
    } else {
      throw new Error("file path does not exists or is not a valid url");
    }
  }

  async post(url, body, callback) {
    const { requestData, headers } = this._makeRequest(
      "POST",
      url,
      JSON_ENDPOINTS.includes(url) ? null : body
    );

    const postHeaders = Object.assign({}, this.baseheaders, headers);

    if (JSON_ENDPOINTS.includes(url)) {
      body = JSON.stringify(body);
    } else {
      body = encode(querystring.stringify(body));
      postHeaders["Content-Type"] = "application/x-www-form-urlencoded";
    }
    const r = fetch(requestData.url, {
      method: "POST",
      headers: postHeaders,
      body: body,
    })
      .then((r) => {
        const contentType = r.headers.get("content-type");

        if (contentType && contentType.indexOf("application/json") !== -1) {
          return r.json();
        } else {
          return r.text();
        }
      })
      .catch((err) => console.log(`❌--Error while fetching - ${err}`));

    if (callback) {
      callback(r);
    } else {
      return r;
    }
  }
async getFollowers(screen_name, options, callback) {
if(!screen_name) {
  throw new Error('please provide a screen_name or a id for getFolowers()');
}
  if(options && !options.limit) {
    options.limit = 10;
  }
  if(!options && !options.limit) {
    options = {
      limit: 10
    };
  }
if(isNaN(screen_name)) {
  const params = {
    screen_name: screen_name,
    count: options.limit || 50,
  };
 let res = await this.get('followers/ids', params);
  if(callback) {
    callback(res);
  } else {
    return res;
  }
} else {
  const params = {
    user_id: screen_name,
    count: options.limit || 50,
  };
 const res = await this.get('followers/ids', params);
 if(callback) {
   callback(res);
 } else {
   return res;
 }
}

}

  async get(url, parameters) {
    const { requestData, headers } = this._makeRequest("GET", url, parameters);

    const r = fetch(requestData.url, {
      headers: headers,
    })
      .then((r) => {
        const contentType = r.headers.get("content-type");

        if (contentType && contentType.indexOf("application/json") !== -1) {
          return r.json();
        } else {
          return r.text();
        }
      })
      .catch((err) => console.log(`❌--Error while fetching - ${err}`));

    return r;
  }

  async search(query, options) {
    if (!query || typeof query !== "string") {
      throw new Error("Need a valid query");
    }
    const param = {
      q: query,
      lang: options.lang || "en",
      count: options.limit || "17",
    };

    const r = await this.get("search/tweets", param);

    return r;
  }
}

module.exports = tweet;
