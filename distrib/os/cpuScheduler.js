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
                    _CurrentPCB.processState = RUNNING;
                    _CPU.setCPU(_CurrentPCB);
                }
                else {
                    console.log("There was nothing in the ready queue.");
                    _CPU.isExecuting = false;
                    if (_SingleStepMode) {
                        TSOS.Control.hostBtnSSToggle_click();
                    }
                    _CurrentPCB = null;
                    TSOS.Control.updatePcbTable();
                }
            }
            console.log("Clock Cycle: " + this.currCycle);
            if (this.currCycle > (_TimeQuantum - 1) && _CPU.isExecuting) {
                console.log("Performing Context Switch");
                this.currCycle = 0;
                _KernelInterruptQueue.enqueue(new TSOS.Interrupt(CONTEXT_IRQ, "I don't know what to put here yet."));
            }
            else {
                this.currCycle++;
                if (_CPU.isExecuting) {
                    _CPU.cycle();
                }
            }
        };
        CpuScheduler.prototype.contextSwitch = function () {
            if (!_ReadyQueue.isEmpty()) {
                if (_CurrentPCB.processState !== TERMINATED) {
                    _CurrentPCB.updatePcb();
                    _CurrentPCB.processState = READY;
                    _ReadyQueue.enqueue(_CurrentPCB);
                }
                _CurrentPCB = _ReadyQueue.dequeue();
                _CurrentPCB.processState = RUNNING;
                _CPU.setCPU(_CurrentPCB);
                console.log("Switching to PCB: " + _CurrentPCB.processID);
                if (_CPU.isExecuting) {
                    this.schedule();
                }
            }
            else {
                console.log("End of Scheduling");
                this.schedule();
            }
        };
        CpuScheduler.prototype.updatePcbTimes = function () {
            if (_CurrentPCB === null) {
                console.log("No PCB to put in table");
            }
            else {
                console.log("Updating Times");
                _CurrentPCB.updateTimes();
                if (!_ReadyQueue.isEmpty()) {
                    for (var i = 0; i < _ReadyQueue.getSize(); i++) {
                        _ReadyQueue.peek(i).updateTimes();
                    }
                }
            }
        };
        return CpuScheduler;
    })();
    TSOS.CpuScheduler = CpuScheduler;
})(TSOS || (TSOS = {}));
