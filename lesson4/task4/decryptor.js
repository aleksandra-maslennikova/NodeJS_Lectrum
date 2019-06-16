const { Transform } = require("stream");

class Decryptor extends Transform {
    constructor(options = {}) {
        super(options);
    }

    _transform(customer, encoding, done) {
        const { payload: { name, email, password }, meta = { } } = customer;
        this._validate(meta.algorithm);
        const decodedEmail = this._decode(email, meta.algorithm);
        const decodedPassword = this._decode(password, meta.algorithm);

        const modifiedCustomer = {
            meta,
            payload: {
                name,
                password: decodedPassword,
                email: decodedEmail
            }
        }
        this.push(modifiedCustomer);
        done();
    }

    _decode(string, algorithm) {
        return Buffer.from(string, algorithm).toString()
    }

    _validate(algorithm){
        const possibleAlgorithms = ["hex", "base64"];
        if(!possibleAlgorithms.includes(algorithm)){
            this.emit("error", new Error(`Unknown algorithm ${algorithm}`))
        }
    }
}

module.exports = Decryptor;