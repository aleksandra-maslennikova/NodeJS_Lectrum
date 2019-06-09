class TimersManager {
    constructor() {
        this.timers = [];
        this.started = false;
    }

    add(timer, ...args) {
        this._checkTimerBeforeAdd(timer);
        timer.args = args;
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
        this.started = true
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

    _findTimer(name) {
        return this.timers.find(timer => timer.name === name)
    }


    _startTimer(timer) {
        if (!timer.isStarted) {
            timer.timerId = timer.interval ?
                setInterval(timer.job, timer.delay, ...timer.args) :
                setTimeout(timer.job, timer.delay, ...timer.args)
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
    interval: true,
    job: (a, b) => console.log(a + b)
}

const manager = new TimersManager();
manager.add(t1).add(t2, 1, 2);
manager.start();
setTimeout(() => {
    manager.pause("t2");
}, 3000);

setTimeout(() => {
    manager.resume("t2");
}, 6000);

setTimeout(() => {
    manager.stop();
}, 10000);

// setTimeout(() => {
//     manager.add("t2");
// }, 10000);