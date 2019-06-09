const EventEmmiter = require("events");

class Bank extends EventEmmiter {
    constructor() {
        super();
        this.contragents = [];
    }

    register(contragent) {
        this._validateContragent(contragent);
        const personId = new Date().getTime();
        this.contragents.push({ ...contragent, personId });
        return personId;
    }

    _validateContragent(contragent) {
        if (this._getContragent("name", contragent.name)) {
            this.emit("error", `Contragent with name ${contragent.name} already exists`);
        }
        if (contragent.balance <= 0) {
            this.emit("error", "Contragent balance should be positive number");
        }
    }

    _validateTransaction(personId, sum, transaction) {
        const contragent = this._getContragent("personId", personId);
        if (!contragent) {
            this.emit("error", `Contragent with personId ${personId} doesn't exist`);
        }
        if (transaction === "add" && sum <= 0) {
            this.emit("error", "Sum should be positive");
        }
        if (transaction === "withdrow" && sum < 0) {
            this.emit("error", "Sum should be positive");
        }
        if (transaction === "withdrow" && contragent.balance - sum < 0) {
            this.emit("error", "Amount on balance less than sum of transaction");
        }
    }

    _getContragent(field, value) {
        return this.contragents.find(contragent => contragent[field] === value);
    }

    _getBalance(personId) {
        this._validateTransaction(personId);
        const contragent = this._getContragent("personId", personId);
        return contragent.balance;
    }

    _add(personId, sum) {
        this._validateTransaction(personId, sum, "add");
        this.contragents = this.contragents.map(contragent => (
            contragent.personId === personId ?
                { ...contragent, balance: contragent.balance + sum } :
                contragent));

    }

    _withdraw(personId, sum) {
        this._validateTransaction(personId, sum, "withdraw");
        this.contragents = this.contragents.map(contragent => (
            contragent.personId === personId ?
                { ...contragent, balance: contragent.balance - sum } :
                contragent))
    }

}

const bank = new Bank();
bank.on("error", error => {
    console.error(error);
})


const id1 = bank.register({ name: "Sasha", balance: 100 });
const id2 = bank.register({ name: "Jon Doe", balance: 200 });
const id3 = bank.register({ name: "Jon Doe", balance: 200 });


bank.on("add", function (personId, sum) {
    this._add(personId, sum);
});

bank.on("withdraw", function (personId, sum) {
    this._withdraw(personId, sum);
});

bank.on("get", function (personId, callback) {
    const balance = this._getBalance(personId);
    callback(balance);
});

bank.emit("add", id1, 20);

bank.emit("get", id1, (balance) => {
    console.log(`I have ${balance}$`);
})

bank.emit("withdraw", id2, 45);

// const id = 1;
// bank.emit("get", id, (balance) => {
//     console.log(`I have ${balance}$`);
// })