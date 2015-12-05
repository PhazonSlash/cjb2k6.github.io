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
        return DeviceDriverHardDrive;
    })(TSOS.DeviceDriver);
    TSOS.DeviceDriverHardDrive = DeviceDriverHardDrive;
})(TSOS || (TSOS = {}));
