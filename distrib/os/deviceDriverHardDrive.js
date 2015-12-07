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
            else {
                var emptyBlock = "0~~~";
                for (var i = 0; i < BLOCK_SIZE - 4; i++) {
                    emptyBlock += "00";
                }
                _HardDrive.write(tsb, emptyBlock);
            }
            return tsb;
        };
        DeviceDriverHardDrive.prototype.getFileByName = function (name) {
            var tsb = "";
            var t = 0;
            var found = false;
            for (var s = 0; s < SECTORS && !found; s++) {
                for (var b = 0; b < BLOCKS && !found; b++) {
                    tsb = "" + t + s + b;
                    if (this.isInUse(tsb)) {
                        if (this.checkFileName(name, tsb)) {
                            console.log("Found it!");
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
        DeviceDriverHardDrive.prototype.checkFileName = function (name, tsb) {
            var data = this.getStringDataFromFile(tsb);
            console.log(name + ".");
            console.log(data + ".");
            if (data.localeCompare(name) === 0) {
                console.log("Matched!");
                return true;
            }
            return false;
        };
        DeviceDriverHardDrive.prototype.getStringDataFromFile = function (tsb) {
            var data = _HardDrive.read(tsb);
            var str = "";
            var currbyte = "";
            var index = 4;
            while (index + 1 < BLOCK_SIZE * 2 && currbyte !== "00") {
                currbyte = data.charAt(index) + data.charAt(index + 1);
                index += 2;
                str += String.fromCharCode(parseInt(currbyte, 16));
            }
            return str;
        };
        DeviceDriverHardDrive.prototype.getTsbFromBlock = function (tsb) {
            var block = _HardDrive.read(tsb);
            var tsb = "" + block.charAt(1) + block.charAt(2) + block.charAt(3);
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
        DeviceDriverHardDrive.prototype.writeToFile = function (name, data) {
            var dirTSB = this.getFileByName(name);
            if (dirTSB === "") {
                _StdOut.putText("Error: File " + name + " does not exist.");
            }
            else {
                var fileTSB = this.getTsbFromBlock(dirTSB);
                var size = data.length;
                if (this.getTsbFromBlock(fileTSB) !== "~~~") {
                    this.deleteData(fileTSB);
                }
                this.writeData(fileTSB, data, size);
            }
        };
        DeviceDriverHardDrive.prototype.writeData = function (fileTSB, data, size) {
            var limit = 60;
            var block = "";
            var index;
            for (index = 0; index < data.length && index < limit; index++) {
                block += data.charCodeAt(index).toString(16).toUpperCase();
            }
            if (size <= limit) {
                for (var i = index; i < BLOCK_SIZE - 4; i++) {
                    block += "00";
                }
                block = "1~~~" + block;
                _HardDrive.write(fileTSB, block);
                console.log("Wrote: " + _HardDrive.read(fileTSB));
            }
            else {
                var newFileTSB = this.getNextFreeFile();
                this.setInUse(newFileTSB, true);
                block = "1" + newFileTSB + block;
                _HardDrive.write(fileTSB, block);
                console.log("Wrote: " + _HardDrive.read(fileTSB));
                var remainingData = data.substring(limit, data.length);
                console.log("Remaining data: " + remainingData);
                this.writeData(newFileTSB, remainingData, size - limit);
            }
        };
        DeviceDriverHardDrive.prototype.readFromFile = function (name) {
            var dirTSB = this.getFileByName(name);
            if (dirTSB === "") {
                return "Error: File \"" + name + "\" not found.";
            }
            var fileTSB = this.getTsbFromBlock(dirTSB);
            return this.readData(fileTSB);
        };
        DeviceDriverHardDrive.prototype.readData = function (fileTSB) {
            var data = this.getStringDataFromFile(fileTSB);
            console.log("Read Data: " + data);
            if (this.getTsbFromBlock(fileTSB) === "~~~") {
                return data;
            }
            else {
                var newFileTSB = this.getTsbFromBlock(fileTSB);
                return (data + this.readData(newFileTSB));
            }
        };
        DeviceDriverHardDrive.prototype.deleteFile = function (name) {
            var dirTSB = this.getFileByName(name);
            if (dirTSB === "") {
                return "Error: File \"" + name + "\" not found.";
            }
            var fileTSB = this.getTsbFromBlock(dirTSB);
            this.deleteData(fileTSB);
            this.setInUse(dirTSB, false);
            return "File deleted.";
        };
        DeviceDriverHardDrive.prototype.deleteData = function (fileTSB) {
            this.setInUse(fileTSB, false);
            if (this.getTsbFromBlock(fileTSB) === "~~~") {
                console.log("Deletion Complete");
            }
            else {
                var newFileTSB = this.getTsbFromBlock(fileTSB);
                this.deleteData(newFileTSB);
            }
        };
        return DeviceDriverHardDrive;
    })(TSOS.DeviceDriver);
    TSOS.DeviceDriverHardDrive = DeviceDriverHardDrive;
})(TSOS || (TSOS = {}));
