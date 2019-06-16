const { Writable } = require("stream");

class AccountManager extends Writable {
    constructor(options = {}) {
        super(options);
    }

    _write(customer, encoding, done) {
        console.log(customer.payload);
        done();
    }
}
module.exports = AccountManager;