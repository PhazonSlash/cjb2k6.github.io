var TSOS;
(function (TSOS) {
    var CpuScheduler = (function () {
        function CpuScheduler(currCycle) {
            if (currCycle === void 0) { currCycle = 0; }
            this.currCycle = currCycle;
            this.init();
        }
        CpuScheduler.prototype.init = function () {
            this.currCycle = 0;
        };
        CpuScheduler.prototype.schedule = function () {
            if (_CurrentPCB === null || _CurrentPCB.processState === TERMINATED) {
                if (!_ReadyQueue.isEmpty()) {
                    _CurrentPCB = _ReadyQueue.dequeue();
                }
                else {
                    console.log("There was nothing in the ready queue.");
                    _CPU.isExecuting = false;
                }
            }
            console.log("Clock Cycle: " + this.currCycle);
            if (this.currCycle >= (_TimeQuantum - 1) && _CPU.isExecuting) {
                console.log("Performing Context Switch");
                this.contextSwitch();
                this.currCycle = 0;
            }
            else {
                this.currCycle++;
            }
            if (_CPU.isExecuting) {
                _CPU.cycle();
            }
        };
        CpuScheduler.prototype.contextSwitch = function () {
            if (!_ReadyQueue.isEmpty()) {
                if (_CurrentPCB.processState !== TERMINATED) {
                    _CurrentPCB.updatePcb();
                    _CurrentPCB.processState = WAITING;
                    _ReadyQueue.enqueue(_CurrentPCB);
                }
                _CurrentPCB = _ReadyQueue.dequeue();
                _CurrentPCB.processState = RUNNING;
                _CPU.setCPU(_CurrentPCB);
                console.log("Switching to PCB: " + _CurrentPCB.processID);
            }
            else {
                console.log("End of Scheduling");
                _CPU.isExecuting = false;
            }
        };
        return CpuScheduler;
    })();
    TSOS.CpuScheduler = CpuScheduler;
})(TSOS || (TSOS = {}));
