var TSOS;
(function (TSOS) {
    var CpuScheduler = (function () {
        function CpuScheduler(currCycle, oldRqSize) {
            if (currCycle === void 0) { currCycle = 0; }
            if (oldRqSize === void 0) { oldRqSize = 1000; }
            this.currCycle = currCycle;
            this.oldRqSize = oldRqSize;
            this.init();
        }
        CpuScheduler.prototype.init = function () {
            this.currCycle = 0;
        };
        CpuScheduler.prototype.schedule = function () {
            switch (_SchedMode) {
                case RR:
                    this.roundRobinSchedule();
                    break;
                case FCFS:
                    this.roundRobinSchedule();
                    break;
                case PRTY:
                    this.prioritySchedule();
                    break;
            }
        };
        CpuScheduler.prototype.roundRobinSchedule = function () {
            if (_CurrentPCB === null || _CurrentPCB.processState === TERMINATED) {
                if (!_ReadyQueue.isEmpty()) {
                    if (_ReadyQueue.getSize() >= MEMORY_PARTITIONS && _CurrentPCB !== null) {
                        var found = false;
                        var index;
                        for (index = 0; index < _ReadyQueue.getSize() && !found; index++) {
                            if (_ReadyQueue.peek(index).location !== "MEM") {
                                found = true;
                                break;
                            }
                        }
                        _MemoryManager.clearPartition(_CurrentPCB.partition);
                        _krnHardDriveDriver.rollIn(_ReadyQueue.peek(index));
                    }
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
            console.log("-----------------");
            console.log("Clock Cycle: " + this.currCycle);
            if (this.currCycle > (_TimeQuantum - 1) && _CPU.isExecuting) {
                if ((_ReadyQueue.getSize() + 1) > MEMORY_PARTITIONS) {
                    var found = false;
                    var index;
                    for (index = 0; index < _ReadyQueue.getSize() && !found; index++) {
                        console.log("Checking index " + index);
                        console.log("PID " + _ReadyQueue.peek(index).processID + " is here.");
                        if (_ReadyQueue.peek(index).location !== "MEM") {
                            console.log("and it is the RIGHT one. Location = " + _ReadyQueue.peek(index).location);
                            found = true;
                            break;
                        }
                    }
                    if (!found) {
                        console.log("SOMETHING WENT HORRIBLY WRONG!!!!!!!!!!");
                    }
                    this.swap(_CurrentPCB, _ReadyQueue.peek(index));
                }
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
        CpuScheduler.prototype.prioritySchedule = function () {
            console.log("Old: " + this.oldRqSize + " New: " + _ReadyQueue.getSize());
            if (_CurrentPCB === null || _CurrentPCB.processState === TERMINATED) {
                if (!_ReadyQueue.isEmpty()) {
                    _CurrentPCB = _ReadyQueue.dequeue();
                    for (var i = 0; i < _ReadyQueue.getSize(); i++) {
                        if (this.comparePriority(_CurrentPCB, _ReadyQueue.peek(0)) < 1) {
                            _ReadyQueue.enqueue(_CurrentPCB);
                            _CurrentPCB = _ReadyQueue.dequeue();
                        }
                    }
                    if (_CurrentPCB.location !== "MEM") {
                        var partition = _MemoryManager.getNextFreePartition();
                        if (partition !== -1) {
                            _krnHardDriveDriver.rollIn(_CurrentPCB);
                        }
                        else {
                            var lowest = _ReadyQueue.peek(0);
                            for (var i = 1; i < _ReadyQueue.getSize(); i++) {
                                if (this.comparePriority(_ReadyQueue.peek(i), lowest) < 1 && _ReadyQueue.peek(i).location === "MEM") {
                                    lowest = _ReadyQueue.peek(i);
                                }
                            }
                            console.log("1 Swapping " + _CurrentPCB.processID + " with Lowest: " + lowest.processID);
                            this.swap(lowest, _CurrentPCB);
                        }
                    }
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
            console.log("-----------------");
            console.log("Clock Cycle: " + this.currCycle);
            console.log("Checking Old: " + this.oldRqSize + " New: " + _ReadyQueue.getSize());
            if (_ReadyQueue.getSize() > this.oldRqSize && _CPU.isExecuting) {
                var testPCB;
                for (var i = 0; i < _ReadyQueue.getSize(); i++) {
                    testPCB = _ReadyQueue.dequeue();
                    if (this.comparePriority(_CurrentPCB, testPCB) < 1) {
                        console.log("Switching " + _CurrentPCB.processID + " with " + testPCB.processID);
                        _CurrentPCB.processState = READY;
                        _ReadyQueue.enqueue(_CurrentPCB);
                        _CurrentPCB = testPCB;
                    }
                    else {
                        _ReadyQueue.enqueue(testPCB);
                    }
                }
                if (_CurrentPCB.location !== "MEM") {
                    var partition = _MemoryManager.getNextFreePartition();
                    if (partition !== -1) {
                        _krnHardDriveDriver.rollIn(_CurrentPCB);
                    }
                    else {
                        var lowest = _ReadyQueue.peek(0);
                        for (var i = 1; i < _ReadyQueue.getSize(); i++) {
                            if (this.comparePriority(lowest, _ReadyQueue.peek(i)) < 1 && _ReadyQueue.peek(i).location === "MEM") {
                                lowest = _ReadyQueue.peek(i);
                            }
                        }
                        console.log("2 Swapping " + _CurrentPCB.processID + " with Lowest: " + lowest.processID);
                        this.swap(lowest, _CurrentPCB);
                    }
                }
                _CurrentPCB.processState = RUNNING;
                _CPU.setCPU(_CurrentPCB);
                this.currCycle++;
                this.oldRqSize = _ReadyQueue.getSize();
                this.schedule();
            }
            else {
                this.currCycle++;
                this.oldRqSize = _ReadyQueue.getSize();
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
                    console.log("Enqueueing PID " + _CurrentPCB.processID);
                    _ReadyQueue.enqueue(_CurrentPCB);
                }
                _CurrentPCB = _ReadyQueue.dequeue();
                console.log("Dequeueing PID " + _CurrentPCB.processID);
                _CurrentPCB.processState = RUNNING;
                _CPU.setCPU(_CurrentPCB);
                console.log("Switching to PCB: " + _CurrentPCB.processID);
                console.log("---------------------------------");
                if (_CPU.isExecuting) {
                    this.schedule();
                }
            }
            else {
                console.log("End of Scheduling");
                this.schedule();
            }
        };
        CpuScheduler.prototype.comparePriority = function (pcb1, pcb2) {
            if (pcb1.priority < pcb2.priority) {
                return 1;
            }
            if (pcb1.priority > pcb2.priority) {
                return -1;
            }
            return 0;
        };
        CpuScheduler.prototype.swap = function (pcbMem, pcbDrive) {
            console.log("Swapping PID:" + pcbMem.processID + " with PID" + pcbDrive.processID);
            var program = _MemoryManager.getProgram(pcbMem);
            console.log("Swapping out PID " + pcbMem.processID);
            _krnHardDriveDriver.rollOut(program, pcbMem.partition, pcbMem);
            console.log("Swapping in PID " + pcbDrive.processID);
            _krnHardDriveDriver.rollIn(pcbDrive);
            console.log("Swap Complete");
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
