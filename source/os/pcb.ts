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
                    public IR: Byte = new Byte(),
                    public x: number = 0,
                    public y: number = 0,
                    public z: number = 0,
                    public partition: number = 0) {
          this.init();
        }

        public init(): void {
            this.processID = Pcb.currentProcessNum;
            Pcb.currentProcessNum++;
        }
        public setPartition(partition: number): void{
          this.partition = partition;
        }

        public incrementPC(): void{
          this.programCounter++;
          _CPU.PC++;
          //If PC excedes memory size, wrap-around to start of memory
          if(this.programCounter > MEMORY_SIZE - 1){
            this.programCounter = 0;
            _CPU.PC = 0;
          }
        }
        
        public updatePcb(): void{
          this.programCounter = _CPU.PC;
          this.accumulator = _CPU.Acc;
          this.IR = _CPU.IR;
          this.x = _CPU.Xreg;
          this.y = _CPU.Yreg;
          this.z = _CPU.Zflag;
        }
    }
}
