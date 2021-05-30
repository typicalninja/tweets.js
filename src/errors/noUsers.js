class UnkownUser extends Error {
    constructor(message) {
      super(message); // (1)
      this.name = "Unknown"; // (2)
    }
  }

module.exports = UnkownUser;