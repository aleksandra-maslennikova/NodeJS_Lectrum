class TimersManager {
    constructor() {
        this.timers = [];
        this.logs = [];
        this.started = false;
    }

    add(timer, ...args) {
        this._checkTimerBeforeAdd(timer);
        timer.args = args;
        timer._log = this._log.bind(this);
        this.timers.push(timer);
        return this;
    }

    remove(name) {
        const timer = this._findTimer(name);
        this._stopTimer(timer);
        this.timers = this.timers.filter(timer => timer.name !== name);
        return this;
    }

    start() {
        this.started = true;
        this.timers.forEach(this._startTimer);
        return this;
    }

    stop() {
        this.timers.forEach(this._stopTimer);
        this.started = false;
        return this;
    }

    pause(name) {
        const timer = this._findTimer(name);
        this._stopTimer(timer);

        return this;
    }

    resume(name) {
        const timer = this._findTimer(name);
        this._startTimer(timer);

        return this;
    }

    print() {
        console.log(this.logs);
    }

    _findTimer(name) {
        return this.timers.find(timer => timer.name === name)
    }

    _startTimer(timer) {
        if (!timer.isStarted) {
            timer.timerId = timer.interval ?
                setInterval(timer._log, timer.delay, timer) :
                setTimeout(timer._log, timer.delay, timer)
            timer.isStarted = true;
        }
    }

    _stopTimer(timer) {
        if (timer.isStarted) {
            timer.interval ? clearInterval(timer.timerId) : clearTimeout(timer.timerId);
            timer.isStarted = false;
        }
    }

    _checkTimerBeforeAdd(timer) {
        if (this.started) {
            throw new Error("Sorry, but you can't add timer after start...")
        }
        if (!timer.name || typeof timer.name !== "string") {
            throw new Error("Wrong name type");
        }
        if (typeof timer.delay !== "number" || timer.delay < 0 || timer.delay > 5000) {
            throw new Error("Wrong delay type");
        }
        if (typeof timer.interval !== "boolean") {
            throw new Error("Wrong interval type");
        }
        if (typeof timer.job !== "function") {
            throw new Error("Wrong job type");
        }
        if (this._findTimer(timer.name)) {
            throw new Error(`Timer with name "${timer.name}" already exists`);
        }
    }
    _log(timer) {
        const logObject = { in: timer.args, name: timer.name, created: new Date(), out: undefined };
        try {
            logObject.out = timer.job(...timer.args);
        } catch (error) {
            logObject.error = {
                name: error.name,
                message: error.message,
                stack: error.stack
            };
        }


        this.logs.push(logObject);
    }
}

const t1 = {
    name: "t1",
    delay: 1000,
    interval: false,
    job: () => console.log("t1")
}

const t2 = {
    name: "t2",
    delay: 1000,
    interval: false,
    job: () => { throw new Error("We have a problem") }
}

const t3 = {
    name: "t3",
    delay: 1000,
    interval: false,
    job: n => n
}

const manager = new TimersManager();
manager.add(t1).add(t2, 1, 2).add(t3, 1);
manager.start();
setTimeout(() => {
    manager.pause("t2");
}, 2000);

setTimeout(() => {
    manager.resume("t2");
}, 4000);

setTimeout(() => {
    manager.stop();
}, 6000);

setTimeout(() => {
    manager.print();
}, 8000);
