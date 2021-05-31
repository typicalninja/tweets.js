const EventEmitter = require('events');
const END = '\r\n';
const END_LENGTH = 2;

class streamManager extends EventEmitter {
    constructor() {
    super();

    this.messageBuffer = '';
    }
    _parse(chunk) {
        this.messageBuffer += chunk.toString('utf8');
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
           return 'PING';
          }
        }
    }
}

module.exports = streamManager;