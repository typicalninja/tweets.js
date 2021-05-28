const protocolAndDomainRE = /^(?:\w+:)?\/\/(\S+)$/;
const localhostDomainRE = /^localhost[\:?\d]*(?:[^\:?\d]\S*)?$/;
const nonLocalhostDomainRE = /^[^\s\.]+\.\S{2,}$/;
const fs = require("fs");
const fetch = require("node-fetch");
const maxsize = 15;
const OAuth = require("oauth-1.0a");
const crypto = require("crypto");
const constants = require('../utils/constants');

module.exports = {
  isUrl: async function (string) {
    if (typeof string !== "string") {
      return false;
    }

    const match = string.match(protocolAndDomainRE);
    if (!match) {
      return false;
    }

    const everythingAfterProtocol = match[1];
    if (!everythingAfterProtocol) {
      return false;
    }

    if (
      localhostDomainRE.test(everythingAfterProtocol) ||
      nonLocalhostDomainRE.test(everythingAfterProtocol)
    ) {
      return true;
    }

    return false;
  },
  download: async function (url) {
    const filepath = `./${Date.now()}v${Math.floor(Math.random() * 11)}.png`;
    const response = await fetch(url).catch((err) => {
      console.log(err);
      return;
    });
    if (response) {
      const contentlength = response.headers.get("content-length");

      if (contentlength > maxsize * 1024 * 1024) {
        return console.log(
          "❌ - file size is too large, refer this: https://tinyurl.com/y568pqdh"
        );
      }

      const buffer = await response.buffer();
      fs.writeFile(filepath, buffer, () =>
        console.log("✔️--finished downloading!")
      );
      const res = {
        path: filepath,
        buffer: buffer,
        request: response,
      };
      return res;
    } else {
      throw new Error(
        "❌--Error while fetching and downloading, make sure the url is valid and is a image"
      );
    }
  },
  createClient: function(key, secret){
    const client = OAuth({
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
