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
                    public IR: Byte = null,
                    public Xreg: number = 0,
                    public Yreg: number = 0,
                    public Zflag: number = 0,
                    public isExecuting: boolean = false) {

        }

        public init(): void {
            this.PC = 0;
            this.Acc = 0;
            this.IR = new Byte();
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            this.isExecuting = false;
        }

        public cycle(): void {
            _Kernel.krnTrace('CPU cycle');
            // TODO: Accumulate CPU usage and profiling statistics here.
            Control.updateMemoryTable();
            Control.updateCpuTable();
            //Fetch/Decode/Execute
            this.IR = _MemoryManager.getByteFromAddr(_CurrentPCB.programCounter, _CurrentPCB);
            Control.updateMemoryTable();
            Control.updateCpuTable();
            this.executeCode(_CurrentPCB);
        }

        public executeCode(pcb: Pcb): boolean{
          //Since we have the current code, we can increment PC here
          pcb.incrementPC();
          //Decode the code
          switch(this.IR.getHex().toUpperCase()){
            case "A9":
                      this.loadAccConst(_MemoryManager.getByteFromAddr(pcb.programCounter, pcb));
                      console.log("A9 - Accumlator: " + this.Acc);
                      break;
            case "AD":
                      this.loadAccMem(this.littleEndianAddress(pcb));
                      console.log("AD - Accumlator: " + this.Acc);
                      break;
            case "8D":
                      this.storeAccMem(this.littleEndianAddress(pcb));
                      console.log("8D - Acc stored.");
                      break;
            case "6D":
                      this.addWithCarry(this.littleEndianAddress(pcb));
                      console.log("6D - Added. Accumlator: " + this.Acc);
                      break;
            case "A2":
                      this.loadXConst(_MemoryManager.getByteFromAddr(pcb.programCounter, pcb));
                      console.log("A2 - X Register: " + this.Xreg);
                      break;
            case "AE":
                      this.loadXMem(this.littleEndianAddress(pcb));
                      console.log("AE - X Register: " + this.Xreg);
                      break;
            case "A0":
                      this.loadYConst(_MemoryManager.getByteFromAddr(pcb.programCounter, pcb));
                      console.log("A2 - Y Register: " + this.Yreg);
                      break;
            case "AC":
                      this.loadYMem(this.littleEndianAddress(pcb));
                      console.log("AE - Y Register: " + this.Yreg);
                      break;
            case "EA":
                      this.noOperation();
                      return true; //Returning here so we don't increment PC again
                      break; //This line will never right run and is stupid, just like EA the company
            case "00":
                      this.endOfProgram();
                      pcb.processState = TERMINATED;
                      pcb.updatePcb();
                      _MemoryManager.clearPartition(pcb.partition);
                      _MemoryManager.setPartition(pcb.partition, false);
                      _ResidentList.remove(pcb);
                      Control.updatePcbTable(pcb);
                      console.log("00 - End of Program");
                      return true;
                      break; //This again
            case "EC":
                      this.compareZ(this.littleEndianAddress(pcb));
                      console.log("EC - Z Flag: " + this.Zflag);
                      break;
            case "D0":
                      this.branchNotEqual(pcb, _MemoryManager.getByteFromAddr(pcb.programCounter, pcb).getDec());
                      console.log("D0 - PC: " + pcb.programCounter);
                      break;
            case "EE":
                      this.incrementByte(this.littleEndianAddress(pcb));
                      console.log("EE - Byte Incremented");
                      break;
            case "FF":
                      this.systemCall();
                      console.log("FF - System Call");
                      return true; //Returning here so we don't increment PC again
                      break; //Pointless, but I like it. Keeps things consistent
            default:
                    console.log("Code: " + this.IR.getHex() + " not found.");
                    return false;
          }
          //Move on to the next code
          pcb.incrementPC();
          return true;
        }

        //Op Codes -----------------------------------------------------------------
        //A9 - Load the accumulator with a constant
        public loadAccConst(constant: Byte): void {
          this.Acc = constant.getDec();
        }

        //AD - Load the accumulator from memory
        public loadAccMem(address: number): void {
          this.Acc = _MemoryManager.getByteFromAddr(address, _CurrentPCB).getDec();
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
          _MemoryManager.setByteAtAddr(byte, address, _CurrentPCB);
        }
        //6D - Add the contents of an address to the contents of the accumulator
        //     and keep the result in the accumulator
        public addWithCarry(address: number): void{
          this.Acc = this.Acc + _MemoryManager.getByteFromAddr(address, _CurrentPCB).getDec();
        }
        //A2 - Load the X register with a constant
        public loadXConst(constant: Byte): void{
          this.Xreg = constant.getDec();
        }
        //AE - Load the X register with a constant
        public loadXMem(address: number): void{
          this.Xreg = _MemoryManager.getByteFromAddr(address, _CurrentPCB).getDec();
        }
        //A0 - Load the Y register with a constant
        public loadYConst(constant: Byte): void{
          this.Yreg = constant.getDec();
        }
        //AC - Load the Y register with a constant
        public loadYMem(address: number): void{
          this.Yreg = _MemoryManager.getByteFromAddr(address, _CurrentPCB).getDec();
        }
        //EA - No Operation - almost as stupid as the game publishing company EA
        public noOperation(): void{
          console.log("EA sucks balls.");
        }
        //00 - Break
        public endOfProgram(): void {
          //this.isExecuting = false;
          if(_SingleStepMode){
            Control.hostBtnSSToggle_click();
          }
        }
        //EC - Compare a byte in memory to the X reg, Sets the Z (zero) flag if equal
        public compareZ(address: number): void {
          if(_MemoryManager.getByteFromAddr(address, _CurrentPCB).getDec() === this.Xreg){
            this.Zflag = 1;
          } else {
            this.Zflag = 0;
          }
        }
        //D0 - Branch n bytes if z flag = 0
        public branchNotEqual(pcb: Pcb, numBytes: number): void {
          if(this.Zflag === 0){
            for(var i: number = 0; i < numBytes; i++){
              pcb.incrementPC();
            }
          }
        }
        //EE - Increment the value of a byte
        public incrementByte(address: number): void {
          //Get the value
          var value: number = _MemoryManager.getByteFromAddr(address, _CurrentPCB).getDec();
          value++; //Increment it
          var newValue: string = value.toString(16); //Convert it to hex
          if(newValue.length < 2){
            newValue = "0" + newValue; //Add a leading zero if needed
          }
          newValue = newValue.toUpperCase(); //Make it uppercase to make it pretty
          var byte: Byte = new Byte();
          byte.setHex(newValue); //Shove it in a new byte
          _MemoryManager.setByteAtAddr(byte, address, _CurrentPCB); //Shove that new byte into the same address
        }
        //FF - System call to print
        public systemCall(): void {
          if(this.Xreg === 1){
            //Print the int in the Y register
            console.log("Printing Y reg int: " + this.Yreg);
            _StdOut.putText("" + this.Yreg);
          } else if(this.Xreg === 2){
            //Print the 00 terminated string in memory
            var address: number = this.Yreg;
            var value: number = _MemoryManager.getByteFromAddr(address, _CurrentPCB).getDec();
            var str: string = "";
            while(value !== 0){
              str += String.fromCharCode(value);
              address++;
              value = _MemoryManager.getByteFromAddr(address, _CurrentPCB).getDec();
            }
            _StdOut.putText(str);
          }
        }
        //-------------------------------------------------------------------------
        //Calculates the little endian address off of the next two memory locations
        //and returns it
        public littleEndianAddress(pcb: Pcb): number {
          var address: number = 0;
          var bytes: string = "";
          //Get the first byte, which will be the last part of the final address
          bytes = _MemoryManager.getByteFromAddr(pcb.programCounter, pcb).getHex();
          //Get the second byte
          pcb.incrementPC();
          //Tack on the first byte to the end and store the final address
          bytes = _MemoryManager.getByteFromAddr(pcb.programCounter, pcb).getHex() + bytes;
          //Make it a decimal number
          address = parseInt(bytes, 16);
          console.log("LE Address: " + address);
          return address;
        }

        public setCPU(pcb: Pcb): void {
          this.PC = pcb.programCounter;
          this.Acc = pcb.accumulator;
          this.IR = _MemoryManager.getByteFromAddr(pcb.programCounter, pcb);
          this.Xreg = pcb.x;
          this.Yreg = pcb.y;
          this.Zflag = pcb.z;
        }
    }
}
