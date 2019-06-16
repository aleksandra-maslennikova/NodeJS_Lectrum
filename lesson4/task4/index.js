const Ui = require("./ui");
const Decryptor = require("./decryptor");
const AccountManager = require("./accountManager");

const uiOptions = { objectMode: true };
const decryptorOptions = {
    readableObjectMode: true,
    writableObjectMode: true,
    decodingStrings: false
};


const managerOptions = { objectMode: true };

const customers = [
    {
        payload: {
            name: "Pitter Black",
            email: "70626c61636b40656d61696c2e636f6d",
            password: "70626c61636b5f313233",
        },
        meta: {
            algorithm: "hex"
        }
    }
];

const ui = new Ui(customers, uiOptions);
const decryptor = new Decryptor(decryptorOptions);
const manager = new AccountManager(managerOptions);

ui.on("error", function (error) {
    console.log(error.message);
    this.emit("end");
}).pipe(decryptor).on("error", function (error) {
    console.log(error.message);
    process.exit(1);
}).pipe(manager)