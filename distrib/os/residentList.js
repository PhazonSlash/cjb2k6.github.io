var TSOS;
(function (TSOS) {
    var ResidentList = (function () {
        function ResidentList(list, size) {
            if (list === void 0) { list = []; }
            if (size === void 0) { size = 0; }
            this.list = list;
            this.size = size;
            this.init();
        }
        ResidentList.prototype.init = function () {
        };
        ResidentList.prototype.add = function (pcb) {
            this.list.push(pcb);
            this.size++;
        };
        ResidentList.prototype.remove = function (pcb) {
            for (var i = 0; i < this.size; i++) {
                if (pcb.processID === this.list[i].processID) {
                    this.size--;
                    this.list.splice(i, 1);
                    return true;
                }
            }
            return false;
        };
        ResidentList.prototype.getPcb = function (processID) {
            for (var i = 0; i < this.size; i++) {
                if (processID === this.list[i].processID) {
                    return this.list[i];
                }
            }
            return null;
        };
        ResidentList.prototype.fillReadyQueue = function () {
            for (var i = 0; i < this.size; i++) {
                _ReadyQueue.enqueue(this.list[i]);
            }
        };
        ResidentList.prototype.printList = function () {
            console.log("Resident List");
            for (var i = 0; i < this.size; i++) {
                console.log(this.list[i].processID);
            }
            console.log("------");
        };
        return ResidentList;
    })();
    TSOS.ResidentList = ResidentList;
})(TSOS || (TSOS = {}));
