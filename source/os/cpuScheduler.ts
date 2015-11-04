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

        public schedule(): void{
          if(_CurrentPCB === null || _CurrentPCB.processState === TERMINATED){
            if(!_ReadyQueue.isEmpty()){
              _CurrentPCB = _ReadyQueue.dequeue();
              _CPU.setCPU(_CurrentPCB);
            } else {
              console.log("There was nothing in the ready queue.");
              _CPU.isExecuting = false;
              if(_SingleStepMode){
                Control.hostBtnSSToggle_click();
              }
            }
          }
          console.log("Clock Cycle: " + this.currCycle);
          if(this.currCycle >= (_TimeQuantum - 1) && _CPU.isExecuting){
            console.log("Performing Context Switch");
            this.contextSwitch();
            this.currCycle = 0;
          } else {
            this.currCycle++;
          }
          if(_CPU.isExecuting){
            _CPU.cycle();
          }
        }

        public contextSwitch(): void{
          if(!_ReadyQueue.isEmpty()){
            if(_CurrentPCB.processState !== TERMINATED){
              _CurrentPCB.updatePcb();
              _CurrentPCB.processState = WAITING;
              _ReadyQueue.enqueue(_CurrentPCB);
            }
            _CurrentPCB = _ReadyQueue.dequeue();
            _CurrentPCB.processState = RUNNING;
            _CPU.setCPU(_CurrentPCB);
            console.log("Switching to PCB: " + _CurrentPCB.processID);
          }else{
            console.log("End of Scheduling");
          }


        }
    }
}
