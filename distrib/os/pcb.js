var TSOS;
(function (TSOS) {
    var Pcb = (function () {
        function Pcb(processState, processID, programCounter, accumulator, IR, x, y, z, partition) {
            if (processState === void 0) { processState = 0; }
            if (processID === void 0) { processID = 0; }
            if (programCounter === void 0) { programCounter = 0; }
            if (accumulator === void 0) { accumulator = 0; }
            if (IR === void 0) { IR = new TSOS.Byte(); }
            if (x === void 0) { x = 0; }
            if (y === void 0) { y = 0; }
            if (z === void 0) { z = 0; }
            if (partition === void 0) { partition = 0; }
            this.processState = processState;
            this.processID = processID;
            this.programCounter = programCounter;
            this.accumulator = accumulator;
            this.IR = IR;
            this.x = x;
            this.y = y;
            this.z = z;
            this.partition = partition;
            this.init();
        }
        Pcb.prototype.init = function () {
            this.processID = Pcb.currentProcessNum;
            Pcb.currentProcessNum++;
        };
        Pcb.prototype.setPartition = function (partition) {
            this.partition = partition;
        };
        Pcb.prototype.incrementPC = function () {
            this.programCounter++;
            _CPU.PC++;
            if (this.programCounter > MEMORY_SIZE - 1) {
                this.programCounter = 0;
                _CPU.PC = 0;
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
        Pcb.currentProcessNum = 0;
        return Pcb;
    })();
    TSOS.Pcb = Pcb;
})(TSOS || (TSOS = {}));
