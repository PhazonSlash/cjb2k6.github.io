///<reference path="../globals.ts" />

/* ------------
     pcb.ts

     Requires global.ts.


     ------------ */

module TSOS {

    export class MemoryManager {
        constructor(private mainMemory: Memory = new Memory()) {
          this.init();
        }

        public init(): void {

        }

        public loadProgram(prgm: string): boolean{
          //Clear current memory
          this.clearAllMem();
          //Insert into memory
          var currByte: string = ""; //Holds the current byte from program
          var memLoc: number = 0; //Current location in memory to insert byte into
          for(var i: number = 0; i < prgm.length; i++){
            currByte = currByte + prgm[i];
            if(currByte.length > 1){
              this.mainMemory.mainMem[memLoc].setHex(currByte);
              memLoc++;
              currByte = "";
            }
          }
          return true;
      }

      public clearAllMem(){
        this.mainMemory.clear(0);
        Control.updateMemoryTable();
      }

      public clearPartition(partition: number){
        if(partition < 1 || partition > MEMORY_PARTITIONS){
          console.log("Invalid memory partition: " + partition);
        } else {
          this.mainMemory.clear(partition);
          Control.updateMemoryTable();
        }
      }

      public getByteFromAddr(address: number): Byte {
        if(address >= this.mainMemory.mainMem.length || address < 0){
          _Kernel.krnTrapError("MEMORY ACCESS VIOLATION");
        } else {
        return this.mainMemory.mainMem[address];
      }

      }

      public setByteAtAddr(byte: Byte, address: number): boolean {
        if(address >= this.mainMemory.mainMem.length || address < 0){
          _Kernel.krnTrapError("MEMORY ACCESS VIOLATION");
        } else {
          this.mainMemory.mainMem[address] = byte;
          return true;
        }
        return false;
      }

      public printMemory(): string {
        return this.mainMemory.toString();
      }
    }
}
