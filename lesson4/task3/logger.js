const { Transform } = require("stream");
const db = require("./db");

class Logger extends Transform {
    constructor(options = {}) {
        super(options);
    }

    _transform(customer, encoding, done) {
        db.add(customer);
        this.push(customer);
        done();
    }

}

module.exports = Logger;