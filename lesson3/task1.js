const EventEmmiter = require("events");
const shortid = require("shortid");

class Bank extends EventEmmiter {
  constructor() {
    super();
    this.customers = [];
  }

  register(customer) {
    this._validateCustomer(customer);
    const personId = shortid.generate();
    this.customers.push({ ...customer, personId });
    return personId;
  }

  _validateCustomer(customer) {
    if (this._getCustomer("name", customer.name)) {
      this.emit("error", `Customer with name ${customer.name} already exists`);
    }
    if (customer.balance <= 0) {
      this.emit("error", "Customer balance should be positive number");
    }
  }

  _validateTransaction(personId, sum, transaction) {
    const customer = this._getCustomer("personId", personId);
    if (!customer) {
      this.emit("error", `Customer with personId ${personId} doesn't exist`);
    }
    if (transaction === "add" && sum <= 0) {
      this.emit("error", "Sum should be positive");
    }
    if (transaction === "withdraw" && sum < 0) {
      this.emit("error", "Sum should be positive");
    }
    if (transaction === "withdraw" && customer.balance - sum < 0) {
      this.emit("error", "Amount on balance less than sum of transaction");
    }
  }

  _getCustomer(field, value) {
    return this.customers.find(customer => customer[field] === value);
  }

  _getBalance(personId) {
    this._validateTransaction(personId);
    const customer = this._getCustomer("personId", personId);
    return customer.balance;
  }

  _add(personId, sum) {
    this._validateTransaction(personId, sum, "add");
    this.customers = this.customers.map(customer =>
      customer.personId === personId
        ? { ...customer, balance: customer.balance + sum }
        : customer
    );
  }

  _withdraw(personId, sum) {
    this._validateTransaction(personId, sum, "withdraw");
    this.customers = this.customers.map(customer =>
      customer.personId === personId
        ? { ...customer, balance: customer.balance - sum }
        : customer
    );
  }
}

const bank = new Bank();
bank.on("error", error => {
  console.error(error);
});

const id1 = bank.register({ name: "Sasha", balance: 100 });
const id2 = bank.register({ name: "Jon Doe", balance: 200 });
const id3 = bank.register({ name: "Jon Doe", balance: 200 });

bank.on("add", function(personId, sum) {
  this._add(personId, sum);
});

bank.on("withdraw", function(personId, sum) {
  this._withdraw(personId, sum);
});

bank.on("get", function(personId, callback) {
  const balance = this._getBalance(personId);
  callback(balance);
});

bank.emit("add", id1, 20);

bank.emit("get", id1, balance => {
  console.log(`I have ${balance}$`);
});

bank.emit("withdraw", id2, 45);

// const id = 1;
// bank.emit("get", id, (balance) => {
//     console.log(`I have ${balance}$`);
// })
