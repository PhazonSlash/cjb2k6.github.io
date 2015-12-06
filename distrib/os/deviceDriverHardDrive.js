var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var TSOS;
(function (TSOS) {
    var DeviceDriverHardDrive = (function (_super) {
        __extends(DeviceDriverHardDrive, _super);
        function DeviceDriverHardDrive() {
            _super.call(this, this.krnHddDriverEntry, null);
            this.formatted = false;
        }
        DeviceDriverHardDrive.prototype.krnHddDriverEntry = function () {
            this.status = "loaded";
        };
        DeviceDriverHardDrive.prototype.krnHddFormat = function () {
            var mbr = "1~~~MBR";
            var emptyBlock = "0~~~";
            for (var i = 0; i < BLOCK_SIZE - 4; i++) {
                emptyBlock += "00";
            }
            for (var t = 0; t < TRACKS; t++) {
                for (var s = 0; s < SECTORS; s++) {
                    for (var b = 0; b < BLOCKS; b++) {
                        var tsb = "" + t + s + b;
                        if (tsb === "000") {
                            _HardDrive.write(tsb, mbr);
                        }
                        else {
                            _HardDrive.write(tsb, emptyBlock);
                        }
                        console.log(_HardDrive.read(tsb));
                    }
                }
            }
            this.formatted = true;
        };
        DeviceDriverHardDrive.prototype.isInUse = function (tsb) {
            return (_HardDrive.read(tsb).charAt(0) === "1");
        };
        DeviceDriverHardDrive.prototype.setInUse = function (tsb, inUse) {
            var block = _HardDrive.read(tsb);
            if (inUse) {
                block = block.slice(1, block.length - 1);
                block = "1" + block;
            }
            else {
                block = block.slice(1, block.length - 1);
                block = "0" + block;
            }
            _HardDrive.write(tsb, block);
        };
        DeviceDriverHardDrive.prototype.getNextFreeDir = function () {
            var t = 0;
            var tsb = "";
            var found = false;
            for (var s = 0; s < SECTORS && !found; s++) {
                for (var b = 0; b < BLOCKS && !found; b++) {
                    tsb = "" + t + s + b;
                    if (!this.isInUse(tsb)) {
                        found = true;
                    }
                }
            }
            if (!found) {
                return "";
            }
            return tsb;
        };
        DeviceDriverHardDrive.prototype.getNextFreeFile = function () {
            var tsb = "";
            var found = false;
            for (var t = 1; t < TRACKS && !found; t++) {
                for (var s = 0; s < SECTORS && !found; s++) {
                    for (var b = 0; b < BLOCKS && !found; b++) {
                        tsb = "" + t + s + b;
                        if (!this.isInUse(tsb)) {
                            found = true;
                        }
                    }
                }
            }
            if (!found) {
                return "";
            }
            return tsb;
        };
        DeviceDriverHardDrive.prototype.createFile = function (name) {
            var fileTSB = this.getNextFreeFile();
            var index;
            if (fileTSB !== "") {
                this.setInUse(fileTSB, true);
                var dirBlock = "1" + fileTSB;
                for (index = 0; index < name.length; index++) {
                    dirBlock += name.charCodeAt(index).toString(16).toUpperCase();
                }
                for (var i = index; i < BLOCK_SIZE - 4; i++) {
                    dirBlock += "00";
                }
                var dirTSB = this.getNextFreeDir();
                if (dirTSB !== "") {
                    _HardDrive.write(dirTSB, dirBlock);
                }
                else {
                    console.log("No free directory space found.");
                    return false;
                }
            }
            else {
                console.log("No free file space found.");
                return false;
            }
            return true;
        };
        return DeviceDriverHardDrive;
    })(TSOS.DeviceDriver);
    TSOS.DeviceDriverHardDrive = DeviceDriverHardDrive;
})(TSOS || (TSOS = {}));
