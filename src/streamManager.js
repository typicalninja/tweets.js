let EventEmitter;
// optional package eventemitter3
try {
  EventEmitter = require("eventemitter3");
} catch {
  EventEmitter = require("events");
}

const END = "\r\n";
const END_LENGTH = 2;
const constants = require("./utils/constants");
const querystring = require("querystring");
const wait = require("util").promisify(setTimeout);
const fetch = require("node-fetch");
const Func = require("./utils/functions.js");

// Internal Structures
const tweet = require("./struc/tweet.js");
const deletedTweet = require("./struc/deletedTweet.js");
/**
 * The StreamManager
 * @class
 * @param {Client} client - tweets.js client
 * @param {Object} options - options for StreamManager
 *  @fires streamManager#ready
 * @fires streamManager#ping
 * @fires streamManager#tweet
 * @fires streamManager#tweetDelete
 * @fires streamManager#raw
 * @fires streamManager#debug
 * @fires streamManager#reconnect
 */
class streamManager extends EventEmitter {
  constructor(client, options = {}) {
    super();

    this.messageBuffer = "";
    this.version = options.version;
    this.path = options.path;
    this._client = client;
    this._UserData = options.userData;
    const _options = Object.assign({}, constants.defaultStreamOptions, options);
    this._options = Object.freeze(_options);
  }
  /**
   * Start the stream
   * @param {Object} parameters - parameters for twitter api
   */
  _connect(parameters) {
    const Data = {
      url: `${Func.getUrl("stream")}/${this.path}${
        this.version == "1" ? ".json" : ""
      }`,
      method: "POST",
    };

    if (parameters) Data.data = parameters;

    const headers = this._client.toHeader(
      this._client.authorize(Data, this._UserData)
    );

    headers["Content-Type"] = "application/x-www-form-urlencoded";

    const streamRequest = fetch(Data.url, {
      method: "POST",
      headers: headers,
      body: Func.percentEncode(querystring.stringify(parameters)),
    });
    // main request
    streamRequest
      .then((response) => {
        this.destroy = () => response.body.destroy();

        if (response.ok) {
          this.ready = true;
          this.parameters = parameters;
          if (this._options.reconnect == true) {
            this._heartBeat();
          }
          this.emit("debug", "[CLIENT] => Stream Connected successfully");
          /**
           * Ready event, fired when stream is connected
           * @event streamManager#ready
           * @property {object} response - the raw response from the request
           */
          this.emit("ready", response);
        } else {
          response._headers = response.headers;
          this.emit("error", response);
          this.emit(
            "debug",
            "[CLIENT] => Error occurred while connecting, disconnecting"
          );
          return this.disconnect(false);
        }

        response.body.on("data", (chunk) => {
          this.emit("debug", "[CHUNk] => chunk received");
          let parsed;
          // try parsing the returned data
          try {
            parsed = this._parse(chunk);
          } catch (err) {
            return this.emit("error", err);
          }

          if (!parsed) return;

          // a ping was received
          if (parsed === "PING") {
            if (this._options.reconnect == true) {
              this._heartBeat();
              this.emit(
                "debug",
                "[HEART_BEAT] => Heart-Beat received, resetting heart-beat timeout"
              );
            }
            /**
             * received when the api sends a ping request
             * @event StreamManger#ping
             */
            return this.emit("ping");
          }

          if (parsed.event !== undefined) {
            this.emit(parsed.event, parsed);
            return this.emit("raw", parsed, "EVENT");
          } else if (parsed.text) {
            /**
             * When a new tweet is given by the stream api
             * @event streamManager#tweet
             * @return {tweet} tweet - a tweet class
             */
            const tweetObj = new tweet(parsed, this);
            this.emit("tweet", tweetObj);
            return this.emit("raw", parsed, "TWEET");
          } else if (parsed.delete) {
            /**
             * emitted when a tweet is deleted
             * @event streamManager#tweetDelete
             * @property {deletedTweet} deletedTweet - the deletedTweet class
             */
            const deleted = new deletedTweet(parsed.delete, this);
            this.emit("tweetDelete", deleted);
            return this.emit("raw", parsed, "TWEET_DELETE");
          } else if (parsed.warning) {
            /**
             * when a warning is given by the api
             * @event streamManager#warning
             * @property {warning} warning - the parsed warning
             */
            this.emit("warning", parsed.warning);
            return this.emit("raw", parsed, "WARN");
          } else {
            /**
             * every data received from the stream api
             * @event streamManager#raw
             * @property {object} parsed - the parsed data
             * @property {String} type - the type of the event data
             */
            return this.emit("raw", parsed, "UNKNOWN");
          }
        });

        response.body.on("error", (error) => this.emit("error", error));
        response.body.on("end", () => {
          this.emit("debug", "[STREAM] => Connection terminated");
          if (!this._options.autoReconnect) {
            clearTimeout(this.pingTimeout);
            this.emit(
              "debug",
              "[CLIENT] => autoReconnect disabled, clearing heart-beat timeout"
            );
          }
          this.emit("end", response);
        });
      })
      .catch((err) => this.emit("error", err));

    return this;
  }
  /**
   * clear the old pingTimeout and set a new timeout when a ping is received, if not auto reconnect
   * @fires streamManager#reconnect
   * @private
   */
  _heartBeat() {
    clearTimeout(this.pingTimeout);

    this.pingTimeout = setTimeout(() => {
      this.emit(
        "debug",
        "[CLIENT] => Heart-Beat timeout exceeded, reconnecting"
      );
      this.reconnect();
    }, 40000);
  }
  /**
   * Disconnects and reconnects the stream, does not remove the listeners
   * @param {Object} newParameters - The new parameters to start the stream with
   * @fires streamManager#reconnect - When the client attempts to reconnect the stream, can be because of forced or due to client disconnection
   */
  async reconnect(newParameters = this.parameters) {
    if (this.ready) await this.disconnect(false);
    if (!newParameters)
      throw new Error("Please provide new parameters for reconnect");
    if (
      !isNaN(parseInt(this._options.reconnectInterval)) &&
      parseInt(this._options.reconnectInterval) > 6000
    ) {
      wait(parseInt(this._options.reconnectInterval));
    } else {
      wait(10000);
    }
    this.ready = false;
    /**
     * When the client attempts to reconnect the stream, can be because of forced or due to client disconnection
     * @event streamManager#reconnect
     */
    this.emit("debug", "[CLIENT] => Reconnect initiated");
    this.emit("reconnect");
    return this._connect(newParameters);
  }

  /**
   * Disconnect the stream
   * @param {Boolean} removeListeners - Weather to remove all the event listeners attached to client/stream set to false if you want to make a manual reconnect logic and don't want to reregister the events
   */
  async disconnect(removeListeners = true) {
    if (removeListeners) {
      this.removeAllListeners(["ping"]);
      this.removeAllListeners(["data"]);
      this.removeAllListeners(["error"]);
    }
    // destroy the stream
    this.destroy();
    this.emit("destroy");
    return null;
  }

  /**
   * parses the stream buffer on new response
   * @param {String} chunk - basically a chunk
   * @private
   */
  _parse(chunk) {
    this.messageBuffer += chunk.toString("utf8");
    chunk = this.messageBuffer;

    let index;
    let json;

    while ((index = this.messageBuffer.indexOf(END)) > -1) {
      json = this.messageBuffer.slice(0, index);
      this.messageBuffer = this.messageBuffer.slice(index + END_LENGTH);
      if (json.length > 0) {
        try {
          json = JSON.parse(json);
          return json;
        } catch (error) {
          error.source = json;
          throw error;
        }
      } else {
        return "PING";
      }
    }
  }
}

module.exports = streamManager;
