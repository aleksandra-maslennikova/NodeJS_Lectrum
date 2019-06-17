const { Transform } = require("stream");
const crypto = require("crypto");

class Guardian extends Transform {
  constructor(options = {}) {
    super(options);
    this.algorithm = "aes192";
    this.password = "1qaZxsw2@3edcVfr4";
    this.key = crypto.scryptSync(this.password, "salt", 24);
    this.buf = Buffer.alloc(16, 0);
    this.iv = crypto.randomFillSync(this.buf, 10);
  }

  _transform(customer, encoding, done) {
    const {
      payload: { name, email, password },
      meta
    } = customer;
    const encryptedEmail = this._encrypt(email);
    const encryptedPassword = this._encrypt(password);
    const modifiedCustomer = {
      meta: {
        ...meta,
        iv: this.iv,
        algorithm: this.algorithm,
        key: this.key
      },
      payload: {
        name,
        password: encryptedPassword,
        email: encryptedEmail
      }
    };

    this.push(modifiedCustomer);
    done();
  }

  _encrypt(string) {
    const cipher = crypto.createCipheriv(this.algorithm, this.key, this.iv);
    let encrypted = cipher.update(string, "utf8", "hex");
    encrypted += cipher.final("hex");
    return encrypted;
  }
}

module.exports = Guardian;
