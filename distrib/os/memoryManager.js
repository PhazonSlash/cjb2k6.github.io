var TSOS;
(function (TSOS) {
    var MemoryManager = (function () {
        function MemoryManager(mainMemory, partitions) {
            if (mainMemory === void 0) { mainMemory = new TSOS.Memory(); }
            if (partitions === void 0) { partitions = []; }
            this.mainMemory = mainMemory;
            this.partitions = partitions;
            this.init();
        }
        MemoryManager.prototype.init = function () {
        };
        MemoryManager.prototype.loadProgram = function (prgm) {
            this.clearAllMem();
            var currByte = "";
            var memLoc = 0;
            for (var i = 0; i < prgm.length; i++) {
                currByte = currByte + prgm[i];
                if (currByte.length > 1) {
                    this.mainMemory.mainMem[memLoc].setHex(currByte);
                    memLoc++;
                    currByte = "";
                }
            }
            return true;
        };
        MemoryManager.prototype.clearAllMem = function () {
            this.mainMemory.clear(0);
            TSOS.Control.updateMemoryTable();
        };
        MemoryManager.prototype.partitionIsValid = function (partition) {
            if (partition < 1 || partition > MEMORY_PARTITIONS) {
                return false;
            }
            return true;
        };
        MemoryManager.prototype.partitionIsAvailable = function (partition) {
            if (this.partitionIsValid(partition)) {
                return this.partitions[partition];
            }
            return false;
        };
        MemoryManager.prototype.clearPartition = function (partition) {
            if (!this.partitionIsValid(partition)) {
                console.log("Invalid memory partition: " + partition);
            }
            else {
                this.mainMemory.clear(partition);
                TSOS.Control.updateMemoryTable();
            }
        };
        MemoryManager.prototype.getByteFromAddr = function (address) {
            if (address >= this.mainMemory.mainMem.length || address < 0) {
                _Kernel.krnTrapError("MEMORY ACCESS VIOLATION");
            }
            else {
                return this.mainMemory.mainMem[address];
            }
        };
        MemoryManager.prototype.setByteAtAddr = function (byte, address) {
            if (address >= this.mainMemory.mainMem.length || address < 0) {
                _Kernel.krnTrapError("MEMORY ACCESS VIOLATION");
            }
            else {
                this.mainMemory.mainMem[address] = byte;
                return true;
            }
            return false;
        };
        MemoryManager.prototype.printMemory = function () {
            return this.mainMemory.toString();
        };
        return MemoryManager;
    })();
    TSOS.MemoryManager = MemoryManager;
})(TSOS || (TSOS = {}));
