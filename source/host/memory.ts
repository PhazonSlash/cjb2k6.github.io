///<reference path="../globals.ts" />

/* ------------
     memory.ts

     Requires global.ts.
     Routines for memory hardware simulation.
     ------------ */

module TSOS {

    export class Memory {

        constructor(public mainMem: Byte[] = []) {
          this.init();
        }

        public init(): void {
            //Fill the array with empty bytes
            for(var i: number = 0; i < TOTAL_MEMORY_SIZE; i++){
            this.mainMem[i] = new Byte();
            }
        }
        //Clears memory
        public clear(partition: number): void {
          if(partition === 0){ //Clear all memory
            for(var i: number = 0; i < TOTAL_MEMORY_SIZE; i++){
              this.mainMem[i].reset();
            }
          } else {
            var startAddress: number = partition * MEMORY_SIZE;
            var endAddress: number = startAddress + MEMORY_SIZE;
            for(var i: number = startAddress; i < endAddress; i++){
              this.mainMem[i].reset();
            }
          }
        }
        //Prints the whole memory array for testing purposes
        public toString(): string {
          var str: string = "";
          for(var i: number = 0; i < TOTAL_MEMORY_SIZE; i++){
            str = str + this.mainMem[i].getHex() + " ";
          }
          return str;
        }
    }
    //Byte object to use in memory
    export class Byte {

        constructor(private hex: string = "00") {

        }

        public reset(): void {
          this.hex = "00";
        }

        public setHex(hex: string): void {
          this.hex = hex;
        }

        public getHex(): string {
          return this.hex;
        }

        public getDec(): number {
          return parseInt(this.hex, 16);
        }
    }
}
