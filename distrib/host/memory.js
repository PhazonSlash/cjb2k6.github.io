var TSOS;
(function (TSOS) {
    var Memory = (function () {
        function Memory(mainMem) {
            if (mainMem === void 0) { mainMem = []; }
            this.mainMem = mainMem;
            this.init();
        }
        Memory.prototype.init = function () {
            for (var i = 0; i < TOTAL_MEMORY_SIZE; i++) {
                this.mainMem[i] = new Byte();
            }
        };
        Memory.prototype.clear = function (partition) {
            if (partition === 0) {
                for (var i = 0; i < TOTAL_MEMORY_SIZE; i++) {
                    this.mainMem[i].reset();
                }
            }
            else {
                var startAddress = (partition - 1) * MEMORY_SIZE;
                var endAddress = startAddress + MEMORY_SIZE;
                for (var i = startAddress; i < endAddress; i++) {
                    this.mainMem[i].reset();
                }
            }
        };
        Memory.prototype.toString = function () {
            var str = "";
            for (var i = 0; i < TOTAL_MEMORY_SIZE; i++) {
                str = str + this.mainMem[i].getHex() + " ";
            }
            return str;
        };
        return Memory;
    })();
    TSOS.Memory = Memory;
    var Byte = (function () {
        function Byte(hex) {
            if (hex === void 0) { hex = "00"; }
            this.hex = hex;
        }
        Byte.prototype.reset = function () {
            this.hex = "00";
        };
        Byte.prototype.setHex = function (hex) {
            this.hex = hex;
        };
        Byte.prototype.getHex = function () {
            return this.hex;
        };
        Byte.prototype.getDec = function () {
            return parseInt(this.hex, 16);
        };
        return Byte;
    })();
    TSOS.Byte = Byte;
})(TSOS || (TSOS = {}));
