const EventEmmiter = require("events");

class DB extends EventEmmiter {
    constructor() {
        super();
        this.customers = [];
        this._init()
    }
    _init() {
        this.on("error", (error) => {
            console.log(error.message);
        });

        this.on("add", function (customer = {}) {
            const { meta, payload } = customer;
            const data = {
                source: meta.source,
                payload,
                created: new Date()
            };
            console.log({data});
            this.customers.push(data);
        });
    }

    add(customer) {
        this.emit("add", customer);
    }
}

module.exports = new DB();