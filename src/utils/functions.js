//@ts-check
const { URL } = require('url');
const fs = require("fs");
const fetch = require("node-fetch");
const maxsize = 15;
const OAuth = require("oauth-1.0a");
const crypto = require("crypto");
// const constants = require('../utils/constants');

module.exports = {
  isUrl: function (string) {
    if (typeof string !== "string") {
      return false;
    }

    const protocols = ['https', 'http'];
    let url;
    try {
      url = new URL(string);
      return protocols
          ? url.protocol
              ? protocols.map(u => `${u.toLowerCase()}:`).includes(url.protocol)
              : false
          : true;
  } catch (err) {
      return false;
  }

  },
  isPath: function(p) {
    if(!p) return false;
    if (fs.existsSync(p)) return true;
     return false;
  },

  prepareFile: async function (filepath) {
    if(this.isUrl(filepath)) {
      const b64i = await this.download(filepath);
      return b64i;
    } else if(this.isPath(filepath)) {
      const b64i = fs.readFileSync(filepath, { encoding: "base64" });
      return b64i;
    }
    return null;
  },

  download: async function (url) {
    const response = await fetch(url).catch((err) => {
     throw err;
    });
    if (response) {
      const contentlength = response.headers.get("content-length");

      if (contentlength > maxsize * 1024 * 1024) {
         throw new Error('file over file limit');
      }

      const buffer = await response.buffer();

      return buffer.toString('base64');
      
    } else {
      throw new Error(
        "Error while fetching and downloading, make sure the url is valid and is a image"
      );
    }
  },
  createClient: function(key, secret){
    const client = new OAuth({
      consumer: { 
        key, 
        secret 
      },
      signature_method: "HMAC-SHA1",
      hash_function(baseString, key) {
        return crypto.createHmac("sha1", key).update(baseString).digest("base64");
      },
    });
    return client;
  },
  getUrl: function(subdomain = 'api', endpoint = '1.1') {
     return `https://${subdomain}.twitter.com/${endpoint}`;
  },
  percentEncode: function(string) {
    // https://github.com/draftbit/twitter-lite/blob/master/twitter.js#L53
    return string
      .replace(/!/g, '%21')
      .replace(/\*/g, '%2A')
      .replace(/'/g, '%27')
      .replace(/\(/g, '%28')
      .replace(/\)/g, '%29');
  }
  
};
