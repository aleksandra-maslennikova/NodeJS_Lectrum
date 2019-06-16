const { Transform } = require("stream");

class Guardian extends Transform {
    constructor(options = {}) {
        super(options);
    }

    _transform(customer, encoding, done) {
        const { payload: { name, email, password }, meta } = customer;
        const encodedEmail = this._encode(email);
        const encodedPassword = this._encode(password);
        const modifiedCustomer = {
            meta,
            payload: {
                name,
                password: encodedPassword,
                email: encodedEmail
            }
        }

        this.push(modifiedCustomer);
        done();
    }

    _encode(string) {
        return Buffer.from(string).toString("hex")
    }
}

module.exports = Guardian;