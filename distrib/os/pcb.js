var TSOS;
(function (TSOS) {
    var Pcb = (function () {
        function Pcb(processState, processID, programCounter, accumulator, IR, x, y, z, partition, location, base, limit, wait, turnAround) {
            if (processState === void 0) { processState = NEW; }
            if (processID === void 0) { processID = 0; }
            if (programCounter === void 0) { programCounter = 0; }
            if (accumulator === void 0) { accumulator = 0; }
            if (IR === void 0) { IR = new TSOS.Byte(); }
            if (x === void 0) { x = 0; }
            if (y === void 0) { y = 0; }
            if (z === void 0) { z = 0; }
            if (partition === void 0) { partition = 0; }
            if (location === void 0) { location = ""; }
            if (base === void 0) { base = 0; }
            if (limit === void 0) { limit = 0; }
            if (wait === void 0) { wait = 0; }
            if (turnAround === void 0) { turnAround = 0; }
            this.processState = processState;
            this.processID = processID;
            this.programCounter = programCounter;
            this.accumulator = accumulator;
            this.IR = IR;
            this.x = x;
            this.y = y;
            this.z = z;
            this.partition = partition;
            this.location = location;
            this.base = base;
            this.limit = limit;
            this.wait = wait;
            this.turnAround = turnAround;
            this.init();
        }
        Pcb.prototype.init = function () {
            this.processID = Pcb.currentProcessNum;
            Pcb.currentProcessNum++;
        };
        Pcb.prototype.setPartition = function (partition, location) {
            this.partition = partition;
            this.base = (partition - 1) * MEMORY_SIZE;
            this.limit = (partition * MEMORY_SIZE) - 1;
            this.programCounter = this.base;
            this.location = location;
            console.log("Partition: " + this.partition + " Base: " + this.base + " Limit: " + this.limit);
        };
        Pcb.prototype.incrementPC = function () {
            this.programCounter++;
            _CPU.PC++;
            if (this.programCounter > this.limit) {
                this.programCounter = this.base;
                _CPU.PC = this.base;
            }
        };
        Pcb.prototype.updatePcb = function () {
            this.programCounter = _CPU.PC;
            this.accumulator = _CPU.Acc;
            this.IR = _CPU.IR;
            this.x = _CPU.Xreg;
            this.y = _CPU.Yreg;
            this.z = _CPU.Zflag;
        };
        Pcb.prototype.updateTimes = function () {
            if (this.processState !== TERMINATED) {
                this.turnAround++;
                if (this.processState === READY || this.processState === NEW) {
                    this.wait++;
                }
            }
        };
        Pcb.currentProcessNum = 0;
        return Pcb;
    })();
    TSOS.Pcb = Pcb;
})(TSOS || (TSOS = {}));
