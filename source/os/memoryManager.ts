///<reference path="../globals.ts" />

/* ------------
     pcb.ts

     Requires global.ts.


     ------------ */

module TSOS {

    export class MemoryManager {
        constructor(private mainMemory: Memory = new Memory(),
                    private partitions: boolean[] = []) {
          this.init();
        }

        public init(): void {

        }

        public loadProgram(prgm: string, partition:number): boolean{
          //Insert into memory
          var currByte: string = ""; //Holds the current byte from program
          var memLoc: number = (MEMORY_SIZE * partition) - MEMORY_SIZE; //Current location in memory to insert byte into
          console.log("Loading at :" + memLoc);
          for(var i: number = 0; i < prgm.length; i++){
            currByte = currByte + prgm[i];
            if(currByte.length > 1){
              this.mainMemory.mainMem[memLoc].setHex(currByte);
              memLoc++;
              currByte = "";
            }
          }
          this.setPartition(partition, true);
          Control.updateMemoryTable();
          return true;
      }

      public clearAllMem(): void {
        this.mainMemory.clear(0);
        for(var i: number = 1; i < MEMORY_PARTITIONS + 1; i++){
          this.partitions[i] = false;
        }
        Control.updateMemoryTable();
      }

      public clearPartition(partition: number): void {
        if(!this.partitionIsValid(partition)){
          console.log("Invalid memory partition: " + partition);
        } else {
          this.mainMemory.clear(partition);
          this.setPartition(partition, false);
          Control.updateMemoryTable();
        }
      }

      public partitionIsValid(partition: number): boolean {
        if(partition < 1 || partition > MEMORY_PARTITIONS){
          return false;
        }
        return true;
      }

      public partitionIsAvailable(partition: number): boolean{
        if(this.partitionIsValid(partition)){
          return !this.partitions[partition];
        }
        return false;
      }

      public setPartition(partition: number, isUsed: boolean): void{
        if(this.partitionIsValid(partition)){
          this.partitions[partition] = isUsed;
        }
      }

      public getNextFreePartition(): number {
        for(var i: number = 1; i < MEMORY_PARTITIONS + 1; i++){
          if(this.partitionIsAvailable(i)){
            return i;
          }
        }
        return -1;
      }

      public getByteFromAddr(address: number, pcb?: Pcb): Byte {
        var base: number = 0;
        var limit: number = TOTAL_MEMORY_SIZE;
        if(pcb !== undefined){
          base = pcb.base;
          limit = pcb.limit;
        }
        if(address >= limit || address < base){
          _Kernel.krnTrapError("MEMORY ACCESS VIOLATION");
        } else {
        return this.mainMemory.mainMem[address];
      }

      }

      public setByteAtAddr(byte: Byte, address: number, pcb: Pcb): boolean {
        if(address >= pcb.limit || address < pcb.base){
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
