///<reference path="../globals.ts" />
///<reference path="deviceDriver.ts" />

/* ----------------------------------
   deviceDriverHardDrive.ts

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
        } else {
          //Make sure new block is clear
          var emptyBlock: string = "0~~~"; //In-use, T, S, B
          for (var i: number = 0; i < BLOCK_SIZE - 4; i++){
            emptyBlock += "00"; //Zero out the remaining bytes
          }
          _HardDrive.write(tsb, emptyBlock);
        }
        return tsb;
      }

      public getFileByName(name: string): string {
        var tsb: string = ""; // The output tsb
        var t: number = 0; // The track reserved for directories
        var found: boolean = false;
        //Search directory for filename
        for (var s: number = 0; s < SECTORS && !found; s++){
          for (var b: number = 0; b < BLOCKS  && !found; b++){
            tsb = "" + t + s + b;
            if (this.isInUse(tsb)){
              if (this.checkFileName(name, tsb)) {
                console.log("Found it!");
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

      public checkFileName(name: string, tsb: string): boolean{
        var data = this.getStringDataFromFile(tsb);
        console.log(name + ".");
        console.log(data + ".");
        if (data.localeCompare(name) === 0){
          console.log("Matched!");
          return true;
        }
        return false;
      }

      public getStringDataFromFile(tsb: string): string {
        var data = _HardDrive.read(tsb);
        var str: string = "";
        var currbyte: string = "";
        var index = 4;
        while (index + 1 < BLOCK_SIZE * 2 && currbyte !== "00"){
          currbyte = data.charAt(index) + data.charAt(index + 1);
          index += 2;

          str += String.fromCharCode(parseInt(currbyte, 16));
        }
        return str;
      }

      public getTsbFromBlock(tsb: string): string{
        var block = _HardDrive.read(tsb);
        var tsb: string = "" + block.charAt(1) + block.charAt(2) + block.charAt(3);
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

      public writeToFile(name: string, data: string){
        var dirTSB: string = this.getFileByName(name);
        if (dirTSB === ""){
          _StdOut.putText("Error: File " + name + " does not exist.");
        } else {
          var fileTSB: string = this.getTsbFromBlock(dirTSB);
          var size: number = data.length;
          //Check to see if file has existing reference tsbs and remove them
          if (this.getTsbFromBlock(fileTSB) !== "~~~"){
            this.deleteData(fileTSB);
          }
          this.writeData(fileTSB, data, size);
        }
      }

      public writeData(fileTSB: string, data: string, size: number) {
        var limit: number = 60;
        var block: string = "";
        var index: number;
        //Convert file data to hex and write to block
        for (index = 0; index < data.length && index < limit; index++) {
          block += data.charCodeAt(index).toString(16).toUpperCase();
        }

        if (size <= limit){ //Base Case
          //Fill the rest of the block with zeroes
          for (var i: number = index; i < BLOCK_SIZE - 4; i++){
            block += "00";
          }
          //Put a null reference to next block
          block = "1~~~" + block;
          //Write it
          _HardDrive.write(fileTSB, block);
          console.log("Wrote: " + _HardDrive.read(fileTSB));
        } else { //Fill this file and put the rest in new ones
          var newFileTSB = this.getNextFreeFile();
          this.setInUse(newFileTSB, true);
          block = "1" + newFileTSB + block;
          _HardDrive.write(fileTSB, block);
          console.log("Wrote: " + _HardDrive.read(fileTSB));
          var remainingData = data.substring(limit, data.length);
          console.log("Remaining data: " + remainingData);
          this.writeData(newFileTSB, remainingData, size - limit);
        }
      }

      public readFromFile(name: string): string {
        var dirTSB: string = this.getFileByName(name);
        if (dirTSB === ""){
          return "Error: File \"" + name + "\" not found.";
        }
        var fileTSB: string = this.getTsbFromBlock(dirTSB);
        return this.readData(fileTSB);
      }

      public readData(fileTSB: string): string {
        var data: string = this.getStringDataFromFile(fileTSB);
        console.log("Read Data: " + data);
        if (this.getTsbFromBlock(fileTSB) === "~~~") { //Base case
          return data;
        } else { // If there is another file linked
          var newFileTSB = this.getTsbFromBlock(fileTSB);
          return (data + this.readData(newFileTSB));
        }
      }

      public deleteFile(name): string{
        var dirTSB: string = this.getFileByName(name);
        if (dirTSB === ""){
          return "Error: File \"" + name + "\" not found.";
        }
        var fileTSB: string = this.getTsbFromBlock(dirTSB);
        this.deleteData(fileTSB);
        this.setInUse(dirTSB, false);
        return "File deleted.";
      }

      public deleteData(fileTSB: string){
        this.setInUse(fileTSB, false);
        if (this.getTsbFromBlock(fileTSB) === "~~~") { //Base case
          console.log("Deletion Complete");
        } else { // If there is another file linked
          var newFileTSB = this.getTsbFromBlock(fileTSB);
          this.deleteData(newFileTSB);
        }
      }
    }
}
