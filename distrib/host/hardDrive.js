var TSOS;
(function (TSOS) {
    var HardDrive = (function () {
        function HardDrive(supported) {
            if (supported === void 0) { supported = false; }
            this.supported = supported;
            this.init();
        }
        HardDrive.prototype.init = function () {
            if (true) {
                this.supported = true;
            }
        };
        HardDrive.prototype.write = function (tsb, data) {
            sessionStorage.setItem(tsb, data);
        };
        HardDrive.prototype.read = function (tsb) {
            return sessionStorage[tsb];
        };
        return HardDrive;
    })();
    TSOS.HardDrive = HardDrive;
})(TSOS || (TSOS = {}));
