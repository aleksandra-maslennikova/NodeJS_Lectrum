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
      return this.emit(
        "error",
        `Customer with name ${customer.name} already exists`
      );
    }
    if (customer.balance <= 0) {
      return this.emit("error", "Customer balance should be positive number");
    }

    if (!customer.limit || typeof customer.limit !== "function") {
      return this.emit(
        "error",
        "Customer limit is required field and should be a function"
      );
    }
  }

  _validateTransaction(personId, sum, transaction) {
    const customer = this._getCustomer("personId", personId);
    if (!customer) {
      return this.emit(
        "error",
        `Customer with personId ${personId} doesn't exist`
      );
    }

    if (transaction === "add") {
      const updatedBalance = customer.balance + sum;
      if (sum <= 0) {
        return this.emit("error", "Sum should be positive");
      }

      if (!customer.limit(sum, customer.balance, updatedBalance)) {
        return this.emit(
          "error",
          "Transaction is forbidden because of customer's limit "
        );
      }
    }

    if (transaction === "withdraw") {
      const updatedBalance = customer.balance - sum;
      if (sum < 0) {
        return this.emit("error", "Sum should be positive");
      }
      if (customer.balance - sum < 0) {
        return this.emit(
          "error",
          "Amount on balance less than sum of transaction"
        );
      }
    }
  }

  _getCustomer(field, value) {
    return this.customers.find(customer => customer[field] === value);
  }

  _getBalance(personId) {
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
  _send(senderId, recipientId, sum) {
    this._validateTransaction(senderId, sum, "withdraw");
    this._validateTransaction(recipientId, sum, "add");
    this.customers = this.customers.map(customer => {
      if (customer.personId === senderId) {
        return { ...customer, balance: customer.balance - sum };
      }
      if (customer.personId === recipientId) {
        return { ...customer, balance: customer.balance + sum };
      }
      return customer;
    });
  }

  _changeLimit(personId, callback) {
    this._validateTransaction(personId);
    this.customers = this.customers.map(customer =>
      customer.personId === personId
        ? { ...customer, limit: callback }
        : customer
    );
  }
}

const bank = new Bank();
bank.on("error", error => {
  console.error(error);
});

bank.on("changeLimit", function(personId, callback) {
  return this._changeLimit(personId, callback);
});

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

bank.on("send", function(senderId, recipientId, sum) {
  this._send(senderId, recipientId, sum);
});

const id1 = bank.register({
  name: "Sasha",
  balance: 300,
  limit: amount => amount < 100
});

const id2 = bank.register({ name: "Jon Doe", balance: 1000, limit: 1 });

bank.emit("get", id1, balance => {
  console.log(`I have ${balance}$`);
});

bank.emit("get", id2, balance => {
  console.log(`I have ${balance}$`);
});

bank.emit("changeLimit", id2, (amount, currentBalance) => {
  return currentBalance > 800;
});

bank.emit("send", id1, id2, 200);

bank.emit("get", id1, balance => {
  console.log(`I have ${balance}$`);
});

bank.emit("get", id2, balance => {
  console.log(`I have ${balance}$`);
});
