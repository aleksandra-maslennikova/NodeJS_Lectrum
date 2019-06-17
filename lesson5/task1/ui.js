const { Readable } = require('stream');

class Ui extends Readable {
    constructor(customers = [], options = {}) {
        super(options);
        this.customers = customers;
        this.name = "ui";
    }


    _read() {
        const customer = this.customers.shift();
        if (!customer) {
            this.push(null);
        } else {
            this._validate(customer);
            this.push({
                meta: { source: this.name },
                payload: customer
            });
        }
    }

    _validate(customer){
        const requiredFields = ["name", "email", "password"];
        Object.keys(customer).forEach(key => {
            if (!requiredFields.includes(key)) {
              this.emit("error", new Error(`The field ${key} is unknown`));
            }
        })

        requiredFields.forEach(field => {
            if (!customer[field]) {
              this.emit("error",  new Error(`The field ${field} is required`));
            } else if (typeof customer[field] !== "string") {
               this.emit ("error", new Error(`The field ${field} is required`));
            }
        })
    }

}

module.exports = Ui;