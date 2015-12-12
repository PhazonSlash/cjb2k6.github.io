///<reference path="../globals.ts" />

/* ------------
     cpuScheduler.ts

     Requires global.ts.

     Schedules when processes run on
     the CPU.
     ------------ */

module TSOS {

    export class CpuScheduler {

        constructor(public currCycle: number = 0) {
          this.init();
        }

        public init(): void {
          this.currCycle = 0;
        }
        //This is the main scheduling function, it keeps track of Cpu cycles
        //and issues context switches when the time is up
        public schedule(): void {
          switch (_SchedMode){
            case RR:
                    this.roundRobinSchedule();
                    break;
            case FCFS:
                    this.roundRobinSchedule(); //With massive time quantum
                    break;
            case PRTY:
                    this.prioritySchedule();
                    break;
          }
        }
        public roundRobinSchedule(){
          //Is there not process in execution?
          if (_CurrentPCB === null || _CurrentPCB.processState === TERMINATED){
            //Is there a new process to load?
            if (!_ReadyQueue.isEmpty()){
              //Check to see if we need to roll in
              if (_ReadyQueue.getSize() >= MEMORY_PARTITIONS && _CurrentPCB !== null){
                //Yeah, we need to roll in
                //Lets look for next process in the backing store
                var found: boolean = false;
                var index: number;
                for (index = 0; index < _ReadyQueue.getSize() && !found; index++){
                  if (_ReadyQueue.peek(index).location !== "MEM"){
                    found = true;
                    break;
                  }
                }
                //Roll in
                _MemoryManager.clearPartition(_CurrentPCB.partition);
                _krnHardDriveDriver.rollIn(_ReadyQueue.peek(index));
              }
              //Load the process
              _CurrentPCB = _ReadyQueue.dequeue();
              _CurrentPCB.processState = RUNNING;
              _CPU.setCPU(_CurrentPCB);
            } else {
              console.log("There was nothing in the ready queue.");
              //We are done executing
              _CPU.isExecuting = false;
              //Turn off single step mode
              if(_SingleStepMode){
                Control.hostBtnSSToggle_click();
              }
              _CurrentPCB = null;
              Control.updatePcbTable();
            }
          }
          console.log("-----------------");
          console.log("Clock Cycle: " + this.currCycle);
          //Check to see if it is time for a context switch
          if(this.currCycle > (_TimeQuantum - 1) && _CPU.isExecuting){
            //Check to see if we need to swap
            if ((_ReadyQueue.getSize() + 1) > MEMORY_PARTITIONS){
              //We probably need to swap
              //Lets look for next process in the backing store
              var found: boolean = false;
              var index: number;
              for (index = 0; index < _ReadyQueue.getSize() && !found; index++){
                console.log("Checking index " + index);
                console.log("PID " + _ReadyQueue.peek(index).processID + " is here.");
                if (_ReadyQueue.peek(index).location !== "MEM"){
                  console.log("and it is the RIGHT one. Location = " + _ReadyQueue.peek(index).location);
                  found = true;
                  break;
                }
              }
              if (!found){
                console.log("SOMETHING WENT HORRIBLY WRONG!!!!!!!!!!");
              }
              //Is there a reason to swap? If a swap just happened, then I think not
              //if (index > MEMORY_PARTITIONS - 1){
                //Yeah, lets swap
                this.swap(_CurrentPCB, _ReadyQueue.peek(index));
            //  }
            }
            console.log("Performing Context Switch");
            this.currCycle = 0;
            _KernelInterruptQueue.enqueue(new Interrupt(CONTEXT_IRQ, "I don't know what to put here yet."));
          } else {
            this.currCycle++;
            if(_CPU.isExecuting){
              _CPU.cycle();
            }
          }
        }

        public prioritySchedule() {

        }

        //Handles the switching of processes
        public contextSwitch(): void {
          if(!_ReadyQueue.isEmpty()){
            //If it is not done, put it on the end of the queue
            if(_CurrentPCB.processState !== TERMINATED){
              _CurrentPCB.updatePcb();
              _CurrentPCB.processState = READY;
              console.log("Enqueueing PID " + _CurrentPCB.processID);
              _ReadyQueue.enqueue(_CurrentPCB);
            }
            //Get the next process
            _CurrentPCB = _ReadyQueue.dequeue();
            console.log("Dequeueing PID " + _CurrentPCB.processID);
            _CurrentPCB.processState = RUNNING;
            _CPU.setCPU(_CurrentPCB);
            console.log("Switching to PCB: " + _CurrentPCB.processID);
            console.log("---------------------------------");
            //Execute
            if(_CPU.isExecuting){
              this.schedule();
            }
          }else{
            console.log("End of Scheduling");
            this.schedule();
          }
        }

      public swap(pcbMem: Pcb, pcbDrive: Pcb){
        console.log("Swapping PID:" + pcbMem.processID + " with PID" + pcbDrive.processID);
        var program = _MemoryManager.getProgram(pcbMem);
        console.log("Swapping out PID " + pcbMem.processID);
        _krnHardDriveDriver.rollOut(program, pcbMem.partition, pcbMem);
        console.log("Swapping in PID " + pcbDrive.processID);
        _krnHardDriveDriver.rollIn(pcbDrive);
        console.log("Swap Complete");
      }

      public updatePcbTimes(){
        if (_CurrentPCB === null){
          console.log("No PCB to put in table");
        } else {
          console.log("Updating Times");
          _CurrentPCB.updateTimes();
          if (!_ReadyQueue.isEmpty()){
            for (var i: number = 0; i < _ReadyQueue.getSize(); i++){
              _ReadyQueue.peek(i).updateTimes();
            }
          }
        }
      }
    }
}
