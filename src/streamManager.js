const EventEmitter = require('events');
const END = '\r\n';
const END_LENGTH = 2;

class streamManager extends EventEmitter {
    constructor() {
    super();

    this.buffer = '';
    }
    _parse(buffer) {
        this.buffer += buffer.toString('utf8');
        let index;
        let json;
    
        while ((index = this.buffer.indexOf(END)) > -1) {
          json = this.buffer.slice(0, index);
          this.buffer = this.buffer.slice(index + END_LENGTH);
          if (json.length > 0) {
            try {
              json = JSON.parse(json);
             return json;
            } catch (error) {
              error.source = json;
             throw error;
            }
          } else {
           return 'ping';
          }
        }
    }
}

module.exports = streamManager;