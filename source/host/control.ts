///<reference path="../globals.ts" />
///<reference path="../os/canvastext.ts" />

/* ------------
     Control.ts

     Requires globals.ts.

     Routines for the hardware simulation, NOT for our client OS itself.
     These are static because we are never going to instantiate them, because they represent the hardware.
     In this manner, it's A LITTLE BIT like a hypervisor, in that the Document environment inside a browser
     is the "bare metal" (so to speak) for which we write code that hosts our client OS.
     But that analogy only goes so far, and the lines are blurred, because we are using TypeScript/JavaScript
     in both the host and client environments.

     This (and other host/simulation scripts) is the only place that we should see "web" code, such as
     DOM manipulation and event handling, and so on.  (Index.html is -- obviously -- the only place for markup.)

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */

//
// Control Services
//
module TSOS {

    export class Control {

        public static hostInit(): void {
            // This is called from index.html's onLoad event via the onDocumentLoad function pointer.

            // Get a global reference to the canvas.  TODO: Should we move this stuff into a Display Device Driver?
            _Canvas = <HTMLCanvasElement>document.getElementById('display');

            // Get a global reference to the drawing context.
            _DrawingContext = _Canvas.getContext("2d");

            // Enable the added-in canvas text functions (see canvastext.ts for provenance and details).
            CanvasTextFunctions.enable(_DrawingContext);   // Text functionality is now built in to the HTML5 canvas. But this is old-school, and fun, so we'll keep it.

            // Clear the log text box.
            // Use the TypeScript cast to HTMLInputElement
            (<HTMLInputElement> document.getElementById("taHostLog")).value="";

            // Set focus on the start button.
            // Use the TypeScript cast to HTMLInputElement
            (<HTMLInputElement> document.getElementById("btnStartOS")).focus();

            // Check for our testing and enrichment core, which
            // may be referenced here (from index.html) as function Glados().
            if (typeof Glados === "function") {
                // function Glados() is here, so instantiate Her into
                // the global (and properly capitalized) _GLaDOS variable.
                _GLaDOS = new Glados();
                _GLaDOS.init();
            }

            this.timeStatusUpdate();
        }

        public static hostLog(msg: string, source: string = "?"): void {
            // Note the OS CLOCK.
            var clock: number = _OSclock;

            // Note the REAL clock in milliseconds since January 1, 1970.
            var now: number = new Date().getTime();

            // Build the log string.
            var str: string = "({ clock:" + clock + ", source:" + source + ", msg:" + msg + ", now:" + now  + " })"  + "\n";

            // Update the log console.
            var taLog = <HTMLInputElement> document.getElementById("taHostLog");
            taLog.value = str + taLog.value;

            // TODO in the future: Optionally update a log database or some streaming service.
        }


        //
        // Host Events
        //
        public static hostBtnStartOS_click(btn): void {
            // Disable the (passed-in) start button...
            btn.disabled = true;

            // .. enable the other buttons ...
            (<HTMLButtonElement>document.getElementById("btnHaltOS")).disabled = false;
            (<HTMLButtonElement>document.getElementById("btnReset")).disabled = false;
            (<HTMLButtonElement>document.getElementById("btnSSToggle")).disabled = false;

            // .. set focus on the OS console display ...
            document.getElementById("display").focus();

            // ... Create and initialize the CPU (because it's part of the hardware)  ...
            _CPU = new Cpu();  // Note: We could simulate multi-core systems by instantiating more than one instance of the CPU here.
            _CPU.init();       //       There's more to do, like dealing with scheduling and such, but this would be a start. Pretty cool.

            _MemoryManager = new MemoryManager();
            _HardDrive = new HardDrive();
            _ReadyQueue = new Queue<Pcb>();
            _ResidentList = new ResidentList();
            _CpuScheduler = new CpuScheduler();

            // ... then set the host clock pulse ...
            _hardwareClockID = setInterval(Devices.hostClockPulse, CPU_CLOCK_INTERVAL);
            // .. and call the OS Kernel Bootstrap routine.
            _Kernel = new Kernel();
            _Kernel.krnBootstrap();  // _GLaDOS.afterStartup() will get called in there, if configured.
            this.updateMemoryTable();
            this.updateCpuTable();
        }

        public static hostBtnHaltOS_click(btn): void {
            Control.hostLog("Emergency halt", "host");
            Control.hostLog("Attempting Kernel shutdown.", "host");
            // Call the OS shutdown routine.
            _Kernel.krnShutdown();
            // Stop the interval that's simulating our clock pulse.
            clearInterval(_hardwareClockID);
            // TODO: Is there anything else we need to do here?
        }

        public static hostBtnReset_click(btn): void {
            // The easiest and most thorough way to do this is to reload (not refresh) the document.
            location.reload(true);
            // That boolean parameter is the 'forceget' flag. When it is true it causes the page to always
            // be reloaded from the server. If it is false or not specified the browser may reload the
            // page from its cache, which is not what we want.
        }

        public static hostBtnSSToggle_click(btn?): void {
          _SingleStepMode = !_SingleStepMode;
          if(_SingleStepMode){
            _Kernel.krnTrace("Single Step Mode: ACTIVATED");
            (<HTMLButtonElement>document.getElementById("btnSSToggle")).innerHTML = "Single Step: ON  ";
            (<HTMLButtonElement>document.getElementById("btnStep")).disabled = false;
          } else {
            _Kernel.krnTrace("Single Step Mode: DEACTIVATED");
            (<HTMLButtonElement>document.getElementById("btnSSToggle")).innerHTML = "Single Step: OFF";
            (<HTMLButtonElement>document.getElementById("btnStep")).disabled = true;
          }
        }

        public static hostBtnStep_click(btn): void {
          _CpuScheduler.schedule();
        }

        public static timeStatusUpdate(): void {
          var currentDate: Date = new Date();
          var hours: string = currentDate.getHours().toString();
          var minutes: string = currentDate.getMinutes().toString();
          if(minutes.length < 2){
            minutes = "0" + minutes;
          }
          document.getElementById("dateTimeLabel").innerHTML = "Time: " + hours + ":" + minutes + " " + currentDate.toLocaleDateString()
          + " | Status: " + _Status;
        }

       public static updateMemoryTable(): void {
         var table: string = "<tbody>";
         var rowHeader: string = "0x";
         var rowNumber: number = 0;
         var currRow: string = "";
         var memoryIndex: number = 0;

         for(var i: number = 0; i < TOTAL_MEMORY_SIZE / 8; i++){
           table += "<tr>";
           currRow = rowNumber.toString(16);
           while(currRow.length < 3){
             currRow = "0" + currRow;
           }
           currRow = currRow.toUpperCase();
           table += "<td style=\"font-weight:bold\">" + rowHeader + currRow + "</td>";
           for(var j: number = 0; j < 8; j++){
             table += "<td>" + _MemoryManager.getByteFromAddr(memoryIndex).getHex().toUpperCase() + "</td>"
             memoryIndex++;
           }
           table += "</tr>";
           rowNumber = rowNumber + 8;
         }
         table += "</tbody>";
         (<HTMLInputElement> document.getElementById("memoryTable")).innerHTML = table;
       }
       public static updateHDDTable(): void {
         var table: string = "";
         var data: string = "";
         var tsb: string = "";
         for (var t: number = 0; t < TRACKS; t++){
           for (var s: number = 0; s < SECTORS; s++){
             for (var b: number = 0; b < BLOCKS; b++){
               tsb = "" + t + s + b;
               data = _HardDrive.read(tsb);
               table += "<tr><td>" + tsb + "</td><td>" + data + "</td></tr>";
               }
             }
           }
         (<HTMLInputElement> document.getElementById("hddTableBody")).innerHTML = table;
       }
       public static updateCpuTable(): void {
         var table: string = "";
         table += "<td>" + _CPU.PC + "</td>";
         table += "<td>" + _CPU.Acc + "</td>";
         table += "<td>" + _CPU.IR.getHex().toUpperCase() + "</td>";
         table += "<td>" + _CPU.Xreg + "</td>";
         table += "<td>" + _CPU.Yreg + "</td>";
         table += "<td>" + _CPU.Zflag + "</td>";
        (<HTMLInputElement> document.getElementById("cpuTableBody")).innerHTML = table;
       }
       public static updatePcbTable(): void {
         var pcb: Pcb;
         var table: string = "";
         if (_CurrentPCB === null){
           console.log("No PCB to put in table");
         } else {
           pcb = _CurrentPCB;
           table += this.buildPcbRow(pcb);
           if (!_ReadyQueue.isEmpty()){
             for (var i: number = 0; i < _ReadyQueue.getSize(); i++){
               pcb = _ReadyQueue.peek(i);
               table += this.buildPcbRow(pcb);
             }
           }
         }
         (<HTMLInputElement> document.getElementById("pcbTableBody")).innerHTML = table;
       }
       private static buildPcbRow(pcb: Pcb): string{
         var table: string = "";
         var state: string = "";
         switch(pcb.processState){
           case NEW:
                  state = "NEW";
                  break;
           case RUNNING:
                  state = "RUNNING";
                  break;
           case WAITING:
                  state = "WAITING";
                  break;
           case READY:
                  state = "READY";
                  break;
           case TERMINATED:
                  state = "TERMINATED";
                  break;
          default:
                  console.log("buildPcbRow: Invalid State");
        }
         table += "<tr>";
         table += "<td>" + pcb.processID + "</td>";
         table += "<td>" + state + "</td>";
         table += "<td>" + pcb.programCounter + "</td>";
         table += "<td>" + pcb.accumulator + "</td>";
         table += "<td>" + pcb.IR.getHex().toUpperCase() + "</td>";
         table += "<td>" + pcb.x + "</td>";
         table += "<td>" + pcb.y + "</td>";
         table += "<td>" + pcb.z + "</td>";
         table += "<td>" + pcb.base + "</td>";
         table += "<td>" + pcb.limit + "</td>";
         table += "<td>" + pcb.partition + "</td>";
         table += "</tr>";
         return table;
       }
    }
}
