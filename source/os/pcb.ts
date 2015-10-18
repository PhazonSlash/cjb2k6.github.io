///<reference path="../globals.ts" />

/* ------------
     pcb.ts

     Requires global.ts.

     Process Control Block Object, used to keep track
     of data related to a process that is in execution.
     ------------ */

module TSOS {

    export class Pcb {
        //Used to keep track and assign new process IDs
        public static currentProcessNum: number = 0;

        constructor(public processState: number = 0,
                    public processID: number = 0,
                    public programCounter: number = 0,
                    public accumulator: number = 0,
                    public x: number = 0,
                    public y: number = 0,
                    public z: number = 0) {
          this.init();
        }

        public init(): void {
            this.processID = Pcb.currentProcessNum;
            Pcb.currentProcessNum++;
        }

        public incrementPC(): void{
          this.programCounter++;
          //If PC excedes memory size, wrap-around to start of memory
          if(this.programCounter > MEMORY_SIZE - 1){
            this.programCounter = 0;
          }
        }
    }
}
