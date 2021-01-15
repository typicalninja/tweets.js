const protocolAndDomainRE = /^(?:\w+:)?\/\/(\S+)$/;
const localhostDomainRE = /^localhost[\:?\d]*(?:[^\:?\d]\S*)?$/;
const nonLocalhostDomainRE = /^[^\s\.]+\.\S{2,}$/;
const fs = require("fs");
const fetch = require("node-fetch");
const maxsize = 15;

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

      if(contentlength > maxsize*1024*1024) {
        return console.log('❌ - file size is too large, refer this: https://tinyurl.com/y568pqdh');
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
  encode: async function (string) {
    return string
      .replace(/!/g, "%21")
      .replace(/\*/g, "%2A")
      .replace(/'/g, "%27")
      .replace(/\(/g, "%28")
      .replace(/\)/g, "%29");
  },

};
