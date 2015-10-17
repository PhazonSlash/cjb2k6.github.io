///<reference path="../globals.ts" />

/* ------------
     CPU.ts

     Requires global.ts.

     Routines for the host CPU simulation, NOT for the OS itself.
     In this manner, it's A LITTLE BIT like a hypervisor,
     in that the Document environment inside a browser is the "bare metal" (so to speak) for which we write code
     that hosts our client OS. But that analogy only goes so far, and the lines are blurred, because we are using
     TypeScript/JavaScript in both the host and client environments.

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */

module TSOS {

    export class Cpu {

        constructor(public PC: number = 0,
                    public Acc: number = 0,
                    public Xreg: number = 0,
                    public Yreg: number = 0,
                    public Zflag: number = 0,
                    public isExecuting: boolean = false) {

        }

        public init(): void {
            this.PC = 0;
            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            this.isExecuting = false;
        }

        public cycle(): void {
            _Kernel.krnTrace('CPU cycle');
            // TODO: Accumulate CPU usage and profiling statistics here.

            //Fetch/Decode/Execute
            this.executeCode(_CurrentPCB, _MemoryManager.getByteFromAddr(_CurrentPCB.programCounter));
        }

        public executeCode(pcb: Pcb, code: Byte): boolean{
          switch(code.getHex().toUpperCase()){
            case "A9":
                      pcb.incrementPC();
                      this.loadAccConst(_MemoryManager.getByteFromAddr(pcb.programCounter));
                      pcb.incrementPC();
                      console.log("A9 - Accumlator: " + this.Acc);
                      break;
            case "AD":
                      pcb.incrementPC();
                      this.loadAccMem(this.littleEndianAddress(pcb));
                      pcb.incrementPC();
                      console.log("AD - Accumlator: " + this.Acc);
                      break;
            case "8D":
                      pcb.incrementPC();
                      this.storeAccMem(this.littleEndianAddress(pcb));
                      pcb.incrementPC();
                      console.log("8D - Acc stored.");
                      break;
            case "00":
                      this.endOfProgram();
                      console.log("00 - End of Program");
                      break;
            default:
                    console.log("Code: " + code.getHex() + " not found.");
                    return false;
          }

          return true;
        }

        //Op Codes -----------------------------------------------------------------
        //A9 - Load the accumulator with a constant
        public loadAccConst(constant: Byte): void {
          this.Acc = constant.getDec();
        }

        //AD - Load the accumulator from memory
        public loadAccMem(address: number): void {
          this.Acc = _MemoryManager.getByteFromAddr(address).getDec();
        }

        //8D - Store the accumulator in memory
        public storeAccMem(address: number): void {
          var byte: Byte = new Byte();
          var str: string = "";
          str = this.Acc.toString(16);
          if(str.length < 2){
            str = "0" + str;
          }
          byte.setHex(str);
          _MemoryManager.setByteAtAddr(byte, address);
        }
        //00 - Break
        public endOfProgram(): void {
          this.isExecuting = false;
        }
        //-------------------------------------------------------------------------

        public littleEndianAddress(pcb: Pcb): number {
          var address: number = 0;
          var bytes: string = "";

          bytes = _MemoryManager.getByteFromAddr(pcb.programCounter).getHex();
          pcb.incrementPC();
          bytes = _MemoryManager.getByteFromAddr(pcb.programCounter).getHex() + bytes;
          address = parseInt(bytes, 16);
          console.log("LE Address: " + address);
          return address;
        }
    }
}
