declare let EventEmitter: any;
declare const END = "\r\n";
declare const END_LENGTH = 2;
declare const constants: any;
declare const querystring: any;
declare const wait: any;
declare const fetch: any;
declare const Func: any;
declare const tweet: any;
declare const deletedTweet: any;
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
declare class streamManager extends EventEmitter {
    constructor(client: any, options?: {});
    /**
     * Start the stream
     * @param {Object} parameters - parameters for twitter api
     */
    _connect(parameters: any): this;
    /**
     * clear the old pingTimeout and set a new timeout when a ping is received, if not auto reconnect
     * @fires streamManager#reconnect
     * @private
     */
    _heartBeat(): void;
    /**
     * Disconnects and reconnects the stream, does not remove the listeners
     * @param {Object} newParameters - The new parameters to start the stream with
     * @fires streamManager#reconnect - When the client attempts to reconnect the stream, can be because of forced or due to client disconnection
     */
    reconnect(newParameters?: any): Promise<this>;
    /**
     * Disconnect the stream
     * @param {Boolean} removeListeners - Weather to remove all the event listeners attached to client/stream set to false if you want to make a manual reconnect logic and don't want to reregister the events
     */
    disconnect(removeListeners?: boolean): Promise<null>;
    /**
     * parses the stream buffer on new response
     * @param {String} chunk - basically a chunk
     * @private
     */
    _parse(chunk: any): any;
}
