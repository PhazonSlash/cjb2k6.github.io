var TSOS;
(function (TSOS) {
    var MemoryManager = (function () {
        function MemoryManager(mainMemory) {
            if (mainMemory === void 0) { mainMemory = new TSOS.Memory(); }
            this.mainMemory = mainMemory;
            this.init();
        }
        MemoryManager.prototype.init = function () {
        };
        MemoryManager.prototype.loadProgram = function (prgm) {
            this.mainMemory.clear();
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
        MemoryManager.prototype.getByteFromAddr = function (address) {
            return this.mainMemory.mainMem[address];
        };
        MemoryManager.prototype.setByteAtAddr = function (byte, address) {
            this.mainMemory.mainMem[address] = byte;
            return true;
        };
        MemoryManager.prototype.printMemory = function () {
            return this.mainMemory.toString();
        };
        return MemoryManager;
    })();
    TSOS.MemoryManager = MemoryManager;
})(TSOS || (TSOS = {}));
