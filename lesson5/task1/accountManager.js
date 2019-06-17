const { Writable } = require("stream");
const crypto = require("crypto");

class AccountManager extends Writable {
  constructor(options = {}) {
    super(options);
  }

  _write(customer, encoding, done) {
    const {
      meta: { algorithm, key, iv, source },
      payload: { email, password, name }
    } = customer;

    const decryptedCustomer = {
      meta: { source },
      payload: {
        ...customer.payload,
        email: this._decrypt(email, algorithm, key, iv),
        password: this._decrypt(password, algorithm, key, iv)
      }
    };

    console.log({customer, decryptedCustomer});
    done();
  }
  _decrypt(string, algorithm, key, iv) {
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(string, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  }
}
module.exports = AccountManager;
