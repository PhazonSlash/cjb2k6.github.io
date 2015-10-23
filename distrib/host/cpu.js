var TSOS;
(function (TSOS) {
    var Cpu = (function () {
        function Cpu(PC, Acc, IR, Xreg, Yreg, Zflag, isExecuting) {
            if (PC === void 0) { PC = 0; }
            if (Acc === void 0) { Acc = 0; }
            if (IR === void 0) { IR = null; }
            if (Xreg === void 0) { Xreg = 0; }
            if (Yreg === void 0) { Yreg = 0; }
            if (Zflag === void 0) { Zflag = 0; }
            if (isExecuting === void 0) { isExecuting = false; }
            this.PC = PC;
            this.Acc = Acc;
            this.IR = IR;
            this.Xreg = Xreg;
            this.Yreg = Yreg;
            this.Zflag = Zflag;
            this.isExecuting = isExecuting;
        }
        Cpu.prototype.init = function () {
            this.PC = 0;
            this.Acc = 0;
            this.IR = new TSOS.Byte();
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            this.isExecuting = false;
        };
        Cpu.prototype.cycle = function () {
            _Kernel.krnTrace('CPU cycle');
            TSOS.Control.updateMemoryTable();
            TSOS.Control.updateCpuTable();
            this.IR = _MemoryManager.getByteFromAddr(_CurrentPCB.programCounter);
            TSOS.Control.updateMemoryTable();
            TSOS.Control.updateCpuTable();
            this.executeCode(_CurrentPCB);
        };
        Cpu.prototype.executeCode = function (pcb) {
            pcb.incrementPC();
            switch (this.IR.getHex().toUpperCase()) {
                case "A9":
                    this.loadAccConst(_MemoryManager.getByteFromAddr(pcb.programCounter));
                    console.log("A9 - Accumlator: " + this.Acc);
                    break;
                case "AD":
                    this.loadAccMem(this.littleEndianAddress(pcb));
                    console.log("AD - Accumlator: " + this.Acc);
                    break;
                case "8D":
                    this.storeAccMem(this.littleEndianAddress(pcb));
                    console.log("8D - Acc stored.");
                    break;
                case "6D":
                    this.addWithCarry(this.littleEndianAddress(pcb));
                    console.log("6D - Added. Accumlator: " + this.Acc);
                    break;
                case "A2":
                    this.loadXConst(_MemoryManager.getByteFromAddr(pcb.programCounter));
                    console.log("A2 - X Register: " + this.Xreg);
                    break;
                case "AE":
                    this.loadXMem(this.littleEndianAddress(pcb));
                    console.log("AE - X Register: " + this.Xreg);
                    break;
                case "A0":
                    this.loadYConst(_MemoryManager.getByteFromAddr(pcb.programCounter));
                    console.log("A2 - Y Register: " + this.Yreg);
                    break;
                case "AC":
                    this.loadYMem(this.littleEndianAddress(pcb));
                    console.log("AE - Y Register: " + this.Yreg);
                    break;
                case "EA":
                    this.noOperation();
                    return true;
                    break;
                case "00":
                    this.endOfProgram();
                    pcb.updatePcb();
                    _MemoryManager.clearPartition(pcb.partition);
                    TSOS.Control.updatePcbTable(pcb);
                    console.log("00 - End of Program");
                    return true;
                    break;
                case "EC":
                    this.compareZ(this.littleEndianAddress(pcb));
                    console.log("EC - Z Flag: " + this.Zflag);
                    break;
                case "D0":
                    this.branchNotEqual(pcb, _MemoryManager.getByteFromAddr(pcb.programCounter).getDec());
                    console.log("D0 - PC: " + pcb.programCounter);
                    break;
                case "EE":
                    this.incrementByte(this.littleEndianAddress(pcb));
                    console.log("EE - Byte Incremented");
                    break;
                case "FF":
                    this.systemCall();
                    console.log("FF - System Call");
                    return true;
                    break;
                default:
                    console.log("Code: " + this.IR.getHex() + " not found.");
                    return false;
            }
            pcb.incrementPC();
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
        Cpu.prototype.addWithCarry = function (address) {
            this.Acc = this.Acc + _MemoryManager.getByteFromAddr(address).getDec();
        };
        Cpu.prototype.loadXConst = function (constant) {
            this.Xreg = constant.getDec();
        };
        Cpu.prototype.loadXMem = function (address) {
            this.Xreg = _MemoryManager.getByteFromAddr(address).getDec();
        };
        Cpu.prototype.loadYConst = function (constant) {
            this.Yreg = constant.getDec();
        };
        Cpu.prototype.loadYMem = function (address) {
            this.Yreg = _MemoryManager.getByteFromAddr(address).getDec();
        };
        Cpu.prototype.noOperation = function () {
            console.log("EA sucks balls.");
        };
        Cpu.prototype.endOfProgram = function () {
            this.isExecuting = false;
            if (_SingleStepMode) {
                TSOS.Control.hostBtnSSToggle_click();
            }
        };
        Cpu.prototype.compareZ = function (address) {
            if (_MemoryManager.getByteFromAddr(address).getDec() === this.Xreg) {
                this.Zflag = 1;
            }
            else {
                this.Zflag = 0;
            }
        };
        Cpu.prototype.branchNotEqual = function (pcb, numBytes) {
            if (this.Zflag === 0) {
                for (var i = 0; i < numBytes; i++) {
                    pcb.incrementPC();
                }
            }
        };
        Cpu.prototype.incrementByte = function (address) {
            var value = _MemoryManager.getByteFromAddr(address).getDec();
            value++;
            var newValue = value.toString(16);
            if (newValue.length < 2) {
                newValue = "0" + newValue;
            }
            newValue = newValue.toUpperCase();
            var byte = new TSOS.Byte();
            byte.setHex(newValue);
            _MemoryManager.setByteAtAddr(byte, address);
        };
        Cpu.prototype.systemCall = function () {
            if (this.Xreg === 1) {
                console.log("Printing Y reg int: " + this.Yreg);
                _StdOut.putText("" + this.Yreg);
            }
            else if (this.Xreg === 2) {
                var address = this.Yreg;
                var value = _MemoryManager.getByteFromAddr(address).getDec();
                var str = "";
                while (value !== 0) {
                    str += String.fromCharCode(value);
                    address++;
                    value = _MemoryManager.getByteFromAddr(address).getDec();
                }
                _StdOut.putText(str);
            }
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
        Cpu.prototype.setCPU = function (pcb) {
            this.PC = pcb.programCounter;
            this.Acc = pcb.accumulator;
            this.IR = _MemoryManager.getByteFromAddr(_CurrentPCB.programCounter);
            this.Xreg = pcb.x;
            this.Yreg = pcb.y;
            this.Zflag = pcb.z;
        };
        return Cpu;
    })();
    TSOS.Cpu = Cpu;
})(TSOS || (TSOS = {}));
