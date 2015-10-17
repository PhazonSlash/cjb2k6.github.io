///<reference path="../globals.ts" />

/* ------------
     pcb.ts

     Requires global.ts.


     ------------ */

module TSOS {

    export class Pcb {
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
    }
}
