///<reference path="../globals.ts" />

/* ------------
     memory.ts

     Requires global.ts.


     ------------ */

module TSOS {

    export class Memory {

        constructor(public mainMem: Byte[] = []) {
          this.init();
        }

        public init(): void {
            //Fill the array
            for(var i: number = 0; i < MEMORY_SIZE; i++){
            this.mainMem[i] = new Byte();
            }
        }

        public clear(): void {
            for(var i: number = 0; i < MEMORY_SIZE; i++){
              this.mainMem[i].reset();
            }
        }

        public toString(): string {
          var str: string = "";
          for(var i: number = 0; i < MEMORY_SIZE; i++){
            str = str + this.mainMem[i].getHex() + " ";
          }
          return str;
        }
    }
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
