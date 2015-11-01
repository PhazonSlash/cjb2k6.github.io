///<reference path="../globals.ts" />

/* ------------
     residentList.ts

     Requires global.ts.

     Resident List keeps track of programs loaded
     into memory.
     ------------ */

module TSOS {

    export class ResidentList {

        constructor(public list: Pcb[] = [],
                    public size: number = 0) {
          this.init();
        }

        public init(): void {

        }

        public add(pcb: Pcb): void {
          this.list.push(pcb);
          this.size++;
        }

        public remove(pcb: Pcb): boolean {
          for(var i: number = 0; i < this.size; i++){
            if(pcb.processID === this.list[i].processID){
              this.size--;
              this.list.splice(i, 1);
              return true;
            }
          }
          return false;
        }

        public fillReadyQueue(): void{
          for(var i: number = 0; i < this.size; i++){
            _ReadyQueue.enqueue(this.list[i]);
          }
        }

        public printList(): void {
          console.log("Resident List");
          for(var i: number = 0; i < this.size; i++){
            console.log(this.list[i].processID);
          }
            console.log("------");
        }

    }
}
