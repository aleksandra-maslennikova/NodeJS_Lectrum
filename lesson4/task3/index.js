const Ui = require("./ui");
const Guardian = require("./guardian");
const AccountManager = require("./accountManager");
const Logger = require("./logger");
const uiOptions = { objectMode: true };
const guardianOptions = {
    readableObjectMode: true,
    writableObjectMode: true,
    decodingStrings: false
};

const loggerOptions = {
    readableObjectMode: true,
    writableObjectMode: true,
    decodingStrings: false
};

const managerOptions = { objectMode: true };

const customers = [
    {
        name: "Pitter Black",
        email: "pblack@email.com",
        password: "pblack-123",
    },
    {
        name: "Oliver White",
        email: "owhite@email.com",
        password: "owhite-456"
    }
];

const ui = new Ui(customers, uiOptions);
const guardian = new Guardian(guardianOptions);
const manager = new AccountManager(managerOptions);
const logger = new Logger(loggerOptions);

ui.on("error", function (error) {
    console.log(error.message);
    this.emit("end");
}).pipe(guardian).pipe(logger).pipe(manager)