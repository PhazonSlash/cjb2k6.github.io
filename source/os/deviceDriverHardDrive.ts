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
    }
}
