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
          //Is there not process in execution?
          if(_CurrentPCB === null || _CurrentPCB.processState === TERMINATED){
            //Is there a new process to load?
            if(!_ReadyQueue.isEmpty()){
              //Load the process
              _CurrentPCB = _ReadyQueue.dequeue();
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
            }
          }
          console.log("Clock Cycle: " + this.currCycle);
          //Check to see if it is time for a context switch
          if(this.currCycle >= (_TimeQuantum - 1) && _CPU.isExecuting){
            console.log("Performing Context Switch");
            //this.contextSwitch();
            this.currCycle = 0;
            _KernelInterruptQueue.enqueue(new Interrupt(CONTEXT_IRQ, "I don't know what to put here yet."));
          } else {
            this.currCycle++;
            if(_CPU.isExecuting){
              _CPU.cycle();
            }
          }

        }
        //Handles the switching of processes
        public contextSwitch(): void {
          if(!_ReadyQueue.isEmpty()){
            //If it is not done, put it on the end of the queue
            if(_CurrentPCB.processState !== TERMINATED){
              _CurrentPCB.updatePcb();
              _CurrentPCB.processState = WAITING;
              _ReadyQueue.enqueue(_CurrentPCB);
            }
            //Get the next process
            _CurrentPCB = _ReadyQueue.dequeue();
            _CurrentPCB.processState = RUNNING;
            _CPU.setCPU(_CurrentPCB);
            console.log("Switching to PCB: " + _CurrentPCB.processID);
            //Execute
            if(_CPU.isExecuting){
              _CPU.cycle();
            }
          }else{
            console.log("End of Scheduling");
          }


        }
    }
}
