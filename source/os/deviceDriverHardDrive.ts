///<reference path="../globals.ts" />
///<reference path="deviceDriver.ts" />

/* ----------------------------------
   seviceDriverHardDrive.ts

   Requires deviceDriver.ts

   The Kernel Hard Drive Device Driver.
   ---------------------------------- */

module TSOS {

    // Extends DeviceDriver
    export class DeviceDriverHardDrive extends DeviceDriver {
        public formatted: boolean;

        constructor() {
            // Override the base method pointers.
            super(this.krnHddDriverEntry, null);
            this.formatted = false;
        }

        public krnHddDriverEntry() {
            // Initialization routine for this, the kernel-mode Keyboard Device Driver.
            this.status = "loaded";
            // More?
        }

        public krnHddFormat() {
          //Create Master Boot Record
          var mbr = "1~~~MBR";
          //Create Empty Block
          var emptyBlock: string = "0~~~"; //In-use, T, S, B
          for (var i: number = 0; i < BLOCK_SIZE - 4; i++){
            emptyBlock += "00"; //Zero out the remaining bytes
          }
          //Write the empty blocks
          for (var t: number = 0; t < TRACKS; t++){
            for (var s: number = 0; s < SECTORS; s++){
              for (var b: number = 0; b < BLOCKS; b++){
                var tsb: string = "" + t + s + b;
                if (tsb === "000") {
                  _HardDrive.write(tsb, mbr);
                } else {
                  _HardDrive.write(tsb, emptyBlock);
                }
                console.log(_HardDrive.read(tsb));
              }
            }
          }
          this.formatted = true;
        }

      public isInUse(tsb: string): boolean {
        return (_HardDrive.read(tsb).charAt(0) === "1");
      }

      public setInUse(tsb: string, inUse: boolean) {
        var block: string = _HardDrive.read(tsb);
        if (inUse){
          block = block.slice(1, block.length - 1);
          block = "1" + block;
        } else {
          block = block.slice(1, block.length - 1);
          block = "0" + block;
        }
        _HardDrive.write(tsb, block);
      }

      public getNextFreeDir(): string {
        var t: number = 0; // The track reserved for directories
        var tsb: string = ""; // The output tsb
        var found: boolean = false;

        for (var s: number = 0; s < SECTORS && !found; s++){
          for (var b: number = 0; b < BLOCKS  && !found; b++){
            tsb = "" + t + s + b;
            if(!this.isInUse(tsb)) {
              found = true;
            }
          }
        }
        if (!found) {
          return "";
        }
        return tsb;
      }

      public getNextFreeFile(): string {
        var tsb: string = ""; // The output tsb
        var found: boolean = false;
        for (var t: number = 1; t < TRACKS && !found; t++){
          for (var s: number = 0; s < SECTORS && !found; s++){
            for (var b: number = 0; b < BLOCKS && !found; b++){
              tsb = "" + t + s + b;
              if(!this.isInUse(tsb)) {
                found = true;
              }
            }
          }
        }
        if (!found) {
          return "";
        }
        return tsb;
      }

      public createFile(name: string): boolean {
        var fileTSB: string = this.getNextFreeFile();
        var index: number;
        if (fileTSB !== ""){
          //Set the file to In-use
          this.setInUse(fileTSB, true);
          //Create the new directory block
          var dirBlock: string = "1" + fileTSB;
          //Convert file name to hex and write to block
          for (index = 0; index < name.length; index++) {
            dirBlock += name.charCodeAt(index).toString(16).toUpperCase();
          }
          //Fill the rest of the block with zeroes
          for (var i: number = index; i < BLOCK_SIZE - 4; i++){
            dirBlock += "00";
          }
          //Write the directory block
          var dirTSB: string = this.getNextFreeDir();
          if (dirTSB !== ""){
            _HardDrive.write(dirTSB, dirBlock);
          } else {
            console.log("No free directory space found.");
            return false;
          }
        } else {
          console.log("No free file space found.");
          return false;
        }
        return true;
      }
    }
}
