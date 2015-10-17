var TSOS;
(function (TSOS) {
    var Cpu = (function () {
        function Cpu(PC, Acc, Xreg, Yreg, Zflag, isExecuting) {
            if (PC === void 0) { PC = 0; }
            if (Acc === void 0) { Acc = 0; }
            if (Xreg === void 0) { Xreg = 0; }
            if (Yreg === void 0) { Yreg = 0; }
            if (Zflag === void 0) { Zflag = 0; }
            if (isExecuting === void 0) { isExecuting = false; }
            this.PC = PC;
            this.Acc = Acc;
            this.Xreg = Xreg;
            this.Yreg = Yreg;
            this.Zflag = Zflag;
            this.isExecuting = isExecuting;
        }
        Cpu.prototype.init = function () {
            this.PC = 0;
            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            this.isExecuting = false;
        };
        Cpu.prototype.cycle = function () {
            _Kernel.krnTrace('CPU cycle');
            this.executeCode(_CurrentPCB, _MemoryManager.getByteFromAddr(_CurrentPCB.programCounter));
        };
        Cpu.prototype.executeCode = function (pcb, code) {
            switch (code.getHex().toUpperCase()) {
                case "A9":
                    pcb.incrementPC();
                    this.loadAccConst(_MemoryManager.getByteFromAddr(pcb.programCounter));
                    pcb.incrementPC();
                    console.log("A9 - Accumlator: " + this.Acc);
                    break;
                case "AD":
                    pcb.incrementPC();
                    this.loadAccMem(this.littleEndianAddress(pcb));
                    pcb.incrementPC();
                    console.log("AD - Accumlator: " + this.Acc);
                    break;
                case "8D":
                    pcb.incrementPC();
                    this.storeAccMem(this.littleEndianAddress(pcb));
                    pcb.incrementPC();
                    console.log("8D - Acc stored.");
                    break;
                case "00":
                    this.endOfProgram();
                    console.log("00 - End of Program");
                    break;
                default:
                    console.log("Code: " + code.getHex() + " not found.");
                    return false;
            }
            return true;
        };
        Cpu.prototype.loadAccConst = function (constant) {
            this.Acc = constant.getDec();
        };
        Cpu.prototype.loadAccMem = function (address) {
            this.Acc = _MemoryManager.getByteFromAddr(address).getDec();
        };
        Cpu.prototype.storeAccMem = function (address) {
            var byte = new TSOS.Byte();
            var str = "";
            str = this.Acc.toString(16);
            if (str.length < 2) {
                str = "0" + str;
            }
            byte.setHex(str);
            _MemoryManager.setByteAtAddr(byte, address);
        };
        Cpu.prototype.endOfProgram = function () {
            this.isExecuting = false;
        };
        Cpu.prototype.littleEndianAddress = function (pcb) {
            var address = 0;
            var bytes = "";
            bytes = _MemoryManager.getByteFromAddr(pcb.programCounter).getHex();
            pcb.incrementPC();
            bytes = _MemoryManager.getByteFromAddr(pcb.programCounter).getHex() + bytes;
            address = parseInt(bytes, 16);
            console.log("LE Address: " + address);
            return address;
        };
        return Cpu;
    })();
    TSOS.Cpu = Cpu;
})(TSOS || (TSOS = {}));
