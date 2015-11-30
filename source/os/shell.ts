///<reference path="../globals.ts" />
///<reference path="../utils.ts" />
///<reference path="shellCommand.ts" />
///<reference path="userCommand.ts" />


/* ------------
   Shell.ts

   The OS Shell - The "command line interface" (CLI) for the console.

    Note: While fun and learning are the primary goals of all enrichment center activities,
          serious injuries may occur when trying to write your own Operating System.
   ------------ */

var beamWeapons: Array < String > = [];
var weaponIndex = 0;

// TODO: Write a base class / prototype for system services and let Shell inherit from it.

module TSOS {
    export class Shell {
        // Properties
        public promptStr = ">";
        public commandList = [];
        public curses = "[fuvg],[cvff],[shpx],[phag],[pbpxfhpxre],[zbgureshpxre],[gvgf]";
        public apologies = "[sorry]";

        constructor() {
        }

        public init() {
            beamWeapons = ["Power Beam", "Wave Beam", "Ice Beam", "Plasma Beam"];
            weaponIndex = 0;

            var sc;
            //
            // Load the command list.

            // test
            sc = new ShellCommand(this.shellTest,
                                  "test",
                                  "- A command for testing purposes only.");
            this.commandList[this.commandList.length] = sc;

            // ver
            sc = new ShellCommand(this.shellVer,
                                  "ver",
                                  "- Displays the current version data.");
            this.commandList[this.commandList.length] = sc;

            // date
            sc = new ShellCommand(this.shellDate,
                "date",
                "- Displays the current date and time.");
            this.commandList[this.commandList.length] = sc;

            // whereami
            sc = new ShellCommand(this.shellWhereAmI,
                "whereami",
                "- Displays your current location.");
            this.commandList[this.commandList.length] = sc;

            // status
            sc = new ShellCommand(this.shellStatus,
                "status",
                "<status> - Sets your current status.");
            this.commandList[this.commandList.length] = sc;

            // load
            sc = new ShellCommand(this.shellLoad,
                "load",
                "- Loads a program from the program input.");
            this.commandList[this.commandList.length] = sc;

            // run <PID>
            sc = new ShellCommand(this.shellRun,
                "run",
                "<PID> - Runs process of given Process ID number <PID>.");
            this.commandList[this.commandList.length] = sc;

            // runall
            sc = new ShellCommand(this.shellRunAll,
                "runall",
                "- Runs all loaded processes.");
            this.commandList[this.commandList.length] = sc;

            // quantum <integer>
            sc = new ShellCommand(this.shellQuantum,
                "quantum",
                "<integer> - Sets the time quantum for round robin scheduling.");
            this.commandList[this.commandList.length] = sc;

            // setschedule <rr | fcfs | priority>
            sc = new ShellCommand(this.shellSetSchedule,
                "setschedule",
                "<rr | fcfs | priority> - Sets the scheduling algorithm to be used (default: rr).");
            this.commandList[this.commandList.length] = sc;

            // getschedule
            sc = new ShellCommand(this.shellGetSchedule,
                "getschedule",
                "- Returns the name of the scheduling algorithm currently in use.");
            this.commandList[this.commandList.length] = sc;

            // ps
            sc = new ShellCommand(this.shellPs,
                "ps",
                "- Displays all running processes.");
            this.commandList[this.commandList.length] = sc;

            // kill <PID>
            sc = new ShellCommand(this.shellKill,
                "kill",
                "<PID> - Terminates a process by its process ID <PID>.");
            this.commandList[this.commandList.length] = sc;

            // clearmem
            sc = new ShellCommand(this.shellClearMem,
                "clearmem",
                "- Clears all partitions of memory.");
            this.commandList[this.commandList.length] = sc;

            // create <filename>
            sc = new ShellCommand(this.shellCreate,
                "create",
                "<filename> - Create a file with the given <filename>.");
            this.commandList[this.commandList.length] = sc;

            // read <filename>
            sc = new ShellCommand(this.shellRead,
                "read",
                "<filename> - Display the contents of a file with the given <filename>.");
            this.commandList[this.commandList.length] = sc;

            // write <filename> "data"
            sc = new ShellCommand(this.shellWrite,
                "write",
                "<filename> \"data\" - Write the data in double quotes to the file <filename>.");
            this.commandList[this.commandList.length] = sc;

            // delete <filename>
            sc = new ShellCommand(this.shellDelete,
                "delete",
                "<filename> - Remove <filename> from storage.");
            this.commandList[this.commandList.length] = sc;

            // format
            sc = new ShellCommand(this.shellFormat,
                "format",
                "- Clears and initializes all data in the hard drive.");
            this.commandList[this.commandList.length] = sc;

            // ls
            sc = new ShellCommand(this.shellLS,
                "ls",
                "- Lists the files that are currently in the file system.");
            this.commandList[this.commandList.length] = sc;

            // weaponchange
            sc = new ShellCommand(this.shellChangeWeapon,
                "changeweapon",
                "- Switches to next beam weapon.");
            this.commandList[this.commandList.length] = sc;

            // shoot
            sc = new ShellCommand(this.shellShoot,
                "shoot",
                "- Fires selected beam weapon.");
            this.commandList[this.commandList.length] = sc;

            // bsod
            sc = new ShellCommand(this.shellBSOD,
                "bsod",
                "- Displays a blue screen of death.");
            this.commandList[this.commandList.length] = sc;

            // help
            sc = new ShellCommand(this.shellHelp,
                                  "help",
                                  "- This is the help command. Seek help.");
            this.commandList[this.commandList.length] = sc;

            // shutdown
            sc = new ShellCommand(this.shellShutdown,
                                  "shutdown",
                                  "- Shuts down the virtual OS but leaves the underlying host / hardware simulation running.");
            this.commandList[this.commandList.length] = sc;

            // cls
            sc = new ShellCommand(this.shellCls,
                                  "cls",
                                  "- Clears the screen and resets the cursor position.");
            this.commandList[this.commandList.length] = sc;

            // man <topic>
            sc = new ShellCommand(this.shellMan,
                                  "man",
                                  "<topic> - Displays the MANual page for <topic>.");
            this.commandList[this.commandList.length] = sc;

            // trace <on | off>
            sc = new ShellCommand(this.shellTrace,
                                  "trace",
                                  "<on | off> - Turns the OS trace on or off.");
            this.commandList[this.commandList.length] = sc;

            // rot13 <string>
            sc = new ShellCommand(this.shellRot13,
                                  "rot13",
                                  "<string> - Does rot13 obfuscation on <string>.");
            this.commandList[this.commandList.length] = sc;

            // prompt <string>
            sc = new ShellCommand(this.shellPrompt,
                                  "prompt",
                                  "<string> - Sets the prompt.");
            this.commandList[this.commandList.length] = sc;

            // ps  - list the running processes and their IDs
            // kill <id> - kills the specified process id.

            //
            // Display the initial prompt.
            this.putPrompt();
        }

        public putPrompt() {
            _StdOut.putText(this.promptStr);
        }

        public handleInput(buffer) {
            _Kernel.krnTrace("Shell Command~" + buffer);
            //
            // Parse the input...
            //
            var userCommand = this.parseInput(buffer);
            // ... and assign the command and args to local variables.
            var cmd = userCommand.command;
            var args = userCommand.args;
            //
            // Determine the command and execute it.
            //
            // TypeScript/JavaScript may not support associative arrays in all browsers so we have to iterate over the
            // command list in attempt to find a match.  TODO: Is there a better way? Probably. Someone work it out and tell me in class.
            var index: number = 0;
            var found: boolean = false;
            var fn = undefined;
            while (!found && index < this.commandList.length) {
                if (this.commandList[index].command === cmd) {
                    found = true;
                    fn = this.commandList[index].func;
                } else {
                    ++index;
                }
            }
            if (found) {
                this.execute(fn, args);
            } else {
                // It's not found, so check for curses and apologies before declaring the command invalid.
                if (this.curses.indexOf("[" + Utils.rot13(cmd) + "]") >= 0) {     // Check for curses.
                    this.execute(this.shellCurse);
                } else if (this.apologies.indexOf("[" + cmd + "]") >= 0) {        // Check for apologies.
                    this.execute(this.shellApology);
                } else { // It's just a bad command. {
                    this.execute(this.shellInvalidCommand);
                }
            }
        }

        // Note: args is an option parameter, ergo the ? which allows TypeScript to understand that.
        public execute(fn, args?) {
            // We just got a command, so advance the line...
            _StdOut.advanceLine();
            // ... call the command function passing in the args with some über-cool functional programming ...
            fn(args);
            // Check to see if we need to advance the line again
            if (_StdOut.currentXPosition > 0) {
                _StdOut.advanceLine();
            }
            // ... and finally write the prompt again.
            this.putPrompt();
        }

        public parseInput(buffer): UserCommand {
            var retVal = new UserCommand();

            // 1. Remove leading and trailing spaces.
            buffer = Utils.trim(buffer);

            // 2. Lower-case it.
            buffer = buffer.toLowerCase();

            // 3. Separate on spaces so we can determine the command and command-line args, if any.
            var tempList = buffer.split(" ");

            // 4. Take the first (zeroth) element and use that as the command.
            var cmd = tempList.shift();  // Yes, you can do that to an array in JavaScript.  See the Queue class.
            // 4.1 Remove any left-over spaces.
            cmd = Utils.trim(cmd);
            // 4.2 Record it in the return value.
            retVal.command = cmd;

            // 5. Now create the args array from what's left.
            for (var i in tempList) {
                var arg = Utils.trim(tempList[i]);
                if (arg != "") {
                    retVal.args[retVal.args.length] = tempList[i];
                }
            }
            return retVal;
        }

        //
        // Shell Command Functions.  Kinda not part of Shell() class exactly, but
        // called from here, so kept here to avoid violating the law of least astonishment.
        //
        public shellInvalidCommand() {
            _StdOut.putText("Invalid Command. ");
            if (_SarcasticMode) {
                _StdOut.putText("Unbelievable. You, [subject name here],");
                _StdOut.advanceLine();
                _StdOut.putText("must be the pride of [subject hometown here].");
            } else {
                _StdOut.putText("Type 'help' for, well... help.");
            }
        }

        public shellCurse() {
            _StdOut.putText("Oh, so that's how it's going to be, eh? Fine.");
            _StdOut.advanceLine();
            _StdOut.putText("Bitch.");
            _SarcasticMode = true;
        }

        public shellApology() {
           if (_SarcasticMode) {
              _StdOut.putText("I think we can put our differences behind us.");
              _StdOut.advanceLine();
              _StdOut.putText("For science . . . You monster.");
              _SarcasticMode = false;
           } else {
              _StdOut.putText("For what?");
           }
        }

        public shellTrace(args:string[]) {
            if (args.length > 0) {
                var setting = args[0];
                switch (setting) {
                    case "on":
                        if (_Trace && _SarcasticMode) {
                            _StdOut.putText("Trace is already on, doofus.");
                        } else {
                            _Trace = true;
                            _StdOut.putText("Trace ON");
                        }
                        break;
                    case "off":
                        _Trace = false;
                        _StdOut.putText("Trace OFF");
                        break;
                    default:
                        _StdOut.putText("Invalid arguement.  Usage: trace <on | off>.");
                }
            } else {
                _StdOut.putText("Usage: trace <on | off>");
            }
        }

        public shellRot13(args:string[]) {
            if (args.length > 0) {
                // Requires Utils.ts for rot13() function.
                _StdOut.putText(args.join(' ') + " = '" + Utils.rot13(args.join(' ')) +"'");
            } else {
                _StdOut.putText("Usage: rot13 <string>  Please supply a string.");
            }
        }

        public shellPrompt(args:string[]) {
            if (args.length > 0) {
                _OsShell.promptStr = args[0];
            } else {
                _StdOut.putText("Usage: prompt <string>  Please supply a string.");
            }
        }

        //Information Commands --------------------------------------------------------------------------------------------------
        public shellTest(args:string[]) {
            _ResidentList.fillReadyQueue();
            var pcb: Pcb;
            while((pcb = _ReadyQueue.dequeue()) != undefined){
              _ResidentList.remove(pcb);
              _MemoryManager.setPartition(pcb.partition, false);
              console.log("Removed: " + pcb.processID);
            }
            console.log(_ResidentList.printList());
        }

        public shellVer(args:string[]) {
            _StdOut.putText(APP_NAME + " version " + APP_VERSION);
        }

        public shellDate(args:string[]) {
            var currentDate = new Date();
            _StdOut.putText("Date: " + currentDate.toLocaleDateString() + " Time: " + currentDate.toLocaleTimeString());
        }

        //Phendrana Drifts is the snowy area of the planet Tallon IV in Metroid Prime
        public shellWhereAmI(args:string[]) {
            _StdOut.putText("Chillin' in Phendrana Drifts.");
        }

        public shellHelp(args:string[]) {
            _StdOut.putText("Commands:");
            for (var i in _OsShell.commandList) {
                _StdOut.advanceLine();
                _StdOut.putText("  " + _OsShell.commandList[i].command + " " + _OsShell.commandList[i].description);
            }
        }

        public shellMan(args:string[]) {
            if (args.length > 0) {
                var topic = args[0];
                switch (topic) {
                    case "help":
                        _StdOut.putText("Help displays a list of (hopefully) valid commands.");
                        break;
                    // TODO: Make descriptive MANual page entries for the the rest of the shell commands here.
                    default:
                        _StdOut.putText("No manual entry for " + args[0] + ".");
                }
            } else {
                _StdOut.putText("Usage: man <topic>  Please supply a topic.");
            }
        }

        public shellStatus(args:string[]) {
            if (args.length > 0) {
                var st = "" + args[0];
                if (args.length > 1) {
                    for (var i = 1; i < args.length; i++) {
                        st = st + " " + args[i];
                    }
                }
                _Status = st;
                Control.timeStatusUpdate();
            }
        }

        //Program Commands ---------------------------------------------------------------------------------------------
        public shellLoad(args:string[]) {
            var prgm:string = (<HTMLInputElement>document.getElementById("taProgramInput")).value;
            if(prgm.length > 0){
              var pattern:RegExp = /([^0123456789abcdefABCDEF\s])/g;
              var result:number = prgm.search(pattern);
              if (result >= 0){ //Check to see if there are any non hex digits
                  _StdOut.putText("Error: Programs can only contain hex digits and spaces.");
              }else{
                  prgm = Utils.removeSpaces(prgm);
                  if(prgm.length > 512){ //Check to see if there are too many hex digits
                    _StdOut.putText("Program cannot be more than 256 bytes long.");
                  } else{
                    var partition: number = _MemoryManager.getNextFreePartition();
                    if(partition === -1){
                      _StdOut.putText("Error: No memory partitions available.");
                    } else {
                      _MemoryManager.loadProgram(prgm, partition);
                      //Creates a new PCB for the process. Stores it in temp variable
                      //that will be replaced with the Ready Queue in the future
                      var pcb: Pcb = new Pcb();
                      pcb.setPartition(partition);
                      _ResidentList.add(pcb);

                      _StdOut.putText("Program loaded. PID: " + pcb.processID);
                      //console.log(_MemoryManager.printMemory());
                    }
                  }
              }
            }else{
                _StdOut.putText("Error: Please type in a program.");
            }
        }

        public shellRun(args:string[]) {
            if (args.length > 0){
              if(args[0].match(/[0-9]+/g)){
                var pcb: Pcb = _ResidentList.getPcb(parseInt(args[0]));
                //console.log("The procID: " + pcb.processID);
                if (pcb !== null && pcb !== undefined){
                  _ReadyQueue.enqueue(pcb);
                  _CpuScheduler.init();
                  _CPU.isExecuting = true;
                } else {
                  _StdOut.putText("Error: PID " + args[0] + " does not exist currently.");
                }
              } else {
                _StdOut.putText("Error: Please enter a numeric PID.");
              }
            } else {
              _StdOut.putText("Error: Please enter a PID.");
            }
        }

        public shellRunAll(args:string[]) {
          if (_ResidentList.isEmpty()){
            _StdOut.putText("Error: No programs loaded.");
          } else {
            _ResidentList.fillReadyQueue();
            _CpuScheduler.init();
            _CPU.isExecuting = true;
          }
        }
        //Process/Scheduling Commands ----------------------------------------------------------------------
        public shellQuantum(args:string[]) {
          if (args.length > 0){
            if (args[0].match(/[0-9]+/g)){
              var quant: number = parseInt(args[0]);
              if (quant < 0){
                  _StdOut.putText("Error: You can't have negative time.");
                } else {
                  _TimeQuantum = quant;
                  _StdOut.putText("Time quantum is now " + quant + ".");
                }

              }  else {
              _StdOut.putText("Error: Please enter a positive numeric quantum.");
            }
          } else {
            _StdOut.putText("Error: Please enter a positive number.");
          }
        }

        public shellSetSchedule(args:string[]) {

        }

        public shellGetSchedule(args:string[]) {

        }

        public shellPs(args:string[]) {
          if (_CurrentPCB !== null){
            _StdOut.putText("PID " + _CurrentPCB.processID + " is currently running. ");
          }
          var str: string = "PID ";
          if (!_ReadyQueue.isEmpty()){
            for(var i: number = 0; i < _ReadyQueue.getSize(); i++){
              if(i < _ReadyQueue.getSize() - 1){
                if(_ReadyQueue.peek(i).processState != TERMINATED){
                  str += _ReadyQueue.peek(i).processID + ", ";
                }
              } else {
                if(_ReadyQueue.peek(i).processState != TERMINATED){
                  if (i > 0){
                    str += "and " + _ReadyQueue.peek(i).processID + " are waiting.";
                  } else {
                    str += _ReadyQueue.peek(i).processID + " is waiting.";
                  }
                }
              }

            }
            _StdOut.putText(str);
          }
        }

        public shellKill(args:string[]) {
          if (args.length > 0){
            if(args[0].match(/[0-9]+/g)){
              var id: number = parseInt(args[0]);
              var killed: boolean = false;
              //Check current process
              if (_CurrentPCB.processID === id){
                _CurrentPCB.processState = TERMINATED;
                _MemoryManager.setPartition(_CurrentPCB.partition, false);
                _KernelInterruptQueue.enqueue(new Interrupt(CONTEXT_IRQ, "I don't know what to put here yet."));
                killed = true;
              } else if (!_ReadyQueue.isEmpty()){
                for(var i: number = 0; i < _ReadyQueue.getSize(); i++){
                  if(_ReadyQueue.peek(i).processID === id){
                    _ReadyQueue.peek(i).processState = TERMINATED;
                    _MemoryManager.setPartition(_ReadyQueue.peek(i).partition, false);
                    killed = true;
                  }
                }
              }
              //Did it die?
              if (killed){
                _StdOut.putText("PID " + args[0] + " was killed.");
              } else {
                _StdOut.putText("Error: PID " + args[0] + " is not currently running.");
              }
            } else {
              _StdOut.putText("Error: Please enter a numeric PID.");
            }
          } else {
            _StdOut.putText("Error: Please enter a PID.");
          }
        }

        //Memory Commands ---------------------------------------------------------------------------------------------------
        public shellClearMem(args:string[]) {
          _MemoryManager.clearAllMem();
          _ResidentList.removeAll();
        }

        //HDD/File System Commands ------------------------------------------------------------------------------------------
        public shellCreate(args:string[]) {

        }

        public shellRead(args:string[]) {

        }

        public shellWrite(args:string[]) {

        }

        public shellDelete(args:string[]) {

        }

        public shellFormat(args:string[]) {

        }

        public shellLS(args:string[]) {

        }

        //Useless Commands --------------------------------------------------------------------------------------------------
        //Command to change the beam weapon used for the shoot command
        //Weapons are Samus Aran's beam weapons from Metroid Prime
        public shellChangeWeapon(args:string[]) {
            weaponIndex++;
            if (weaponIndex >= 4) {
               weaponIndex = 0;
            }
            console.log(beamWeapons[weaponIndex]);
            _StdOut.putText(beamWeapons[weaponIndex] + " selected.");
        }
        //Command to "fire" the selected beam weapon. Each features a unique "sound effect"
        public shellShoot(args:string[]) {
            switch (weaponIndex) {
                case 0:
                    _StdOut.putText("*pew* You fired your Power Beam.");
                    break;
                case 1:
                    _StdOut.putText("*zap* You fired your Wave Beam.");
                    break;
                case 2:
                    _StdOut.putText("*pachink* You fired your Ice Beam.");
                    break;
                case 3:
                    _StdOut.putText("*bang* You fired your Plasma Beam.");
                    break;
            }
        }
        //Break Everything Commands ------------------------------------------------------------------------------------
        public shellBSOD(args:string[]) {
            _Kernel.krnTrapError("BSOD Test");
        }

        public shellShutdown(args:string[]) {
             _StdOut.putText("Shutting down...");
             // Call Kernel shutdown routine.
            _Kernel.krnShutdown();
            // TODO: Stop the final prompt from being displayed.  If possible.  Not a high priority.  (Damn OCD!)
        }
        //Console Management Commands ---------------------------------------------------------------------------------
        public shellCls(args:string[]) {
            _StdOut.clearScreen();
            _StdOut.resetXY();
        }
    }
}
