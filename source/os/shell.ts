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
                "- Sets your current status.");
            this.commandList[this.commandList.length] = sc;

            // load
            sc = new ShellCommand(this.shellLoad,
                "load",
                "- Loads a program from the program input.");
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

        public shellVer(args) {
            _StdOut.putText(APP_NAME + " version " + APP_VERSION);
        }

        public shellDate(args) {
            var currentDate = new Date();
            _StdOut.putText("Date: " + currentDate.toLocaleDateString() + " Time: " + currentDate.toLocaleTimeString());
        }

        public shellWhereAmI(args) {
            _StdOut.putText("Phendrana Drifts");
        }

        public shellStatus(args) {
            if (args.length > 0) {
                var st = "Status: " + args[0];
                if (args.length > 1) {
                    for (var i = 1; i < args.length; i++) {
                        st = st + " " + args[i];
                    }
                }
                document.getElementById("statusLabel").innerHTML = st;
            }
        }

        public shellLoad(args) {
            var prgm = document.getElementById("taProgramInput").innerHTML;
            var pattern = /([^0123456789abcdefABCDEF\s])/g;
            var result = prgm.search(pattern);
            console.log("Program: " + prgm);
            console.log("Result: " + result);
            if (result >= 0){
                _StdOut.putText("Error: Programs can only contain hex digits and spaces.");
            }
            _StdOut.putText("Program loaded.");
        }

        public shellChangeWeapon(args) {
            weaponIndex++;
            if (weaponIndex >= 4) {
               weaponIndex = 0;
            }
            console.log(beamWeapons[weaponIndex]);
            _StdOut.putText(beamWeapons[weaponIndex] + " selected.");
        }

        public shellShoot(args) {
            switch (weaponIndex) {
                case 0:
                    _StdOut.putText("*pew* *pew* You fired your Power Beam.");
                    break;
                case 1:
                    _StdOut.putText("*zap* *zap* You fired your Wave Beam.");
                    break;
                case 2:
                    _StdOut.putText("*pachink* *pachink* You fired your Ice Beam.");
                    break;
                case 3:
                    _StdOut.putText("*bang* *bang* You fired your Plasma Beam.");
                    break;
            }
        }

        public shellBSOD(args) {
            //_DrawingContext.clearRect(0, 0, _Canvas.width, _Canvas.height);
            _Console.init();
            _DrawingContext.rect(0, 0, _Canvas.width, _Canvas.height);
            _DrawingContext.fillStyle = "blue";
            _DrawingContext.fill();

            _DrawingContext.font = "30px Courier New";
            _DrawingContext.fillStyle = "white";
            _DrawingContext.fillText('PhazonOS has crashed!', 50, 50);

            _DrawingContext.font = "16px Courier New";
            _DrawingContext.fillText('What the hell do you think you are doing?  Are you', 5, 80);
            _DrawingContext.fillText('trying to melt the computer with your stupidity?. I', 5, 100);
            _DrawingContext.fillText('did not even think this was possible.', 5, 120);
            _DrawingContext.fillText('Check to make sure your machine is not a total', 5, 160);
            _DrawingContext.fillText('piece of garbage. Try soaking the RAM in cheetah', 5, 180);
            _DrawingContext.fillText('blood to make it faster. Your motherboard is so', 5, 200);
            _DrawingContext.fillText('fat, it\'s BIOS has its own MAC address.', 5, 220);
            _DrawingContext.fillText('Technical information: ', 5, 260);
            _DrawingContext.fillText('*** STOPTHAT: 0x00000BAD (0x00080F10)', 5, 280);
            _DrawingContext.fillText('For assistance, please mash your face on keyboard.', 5, 320);
        }

        public shellHelp(args) {
            _StdOut.putText("Commands:");
            for (var i in _OsShell.commandList) {
                _StdOut.advanceLine();
                _StdOut.putText("  " + _OsShell.commandList[i].command + " " + _OsShell.commandList[i].description);
            }
        }

        public shellShutdown(args) {
             _StdOut.putText("Shutting down...");
             // Call Kernel shutdown routine.
            _Kernel.krnShutdown();
            // TODO: Stop the final prompt from being displayed.  If possible.  Not a high priority.  (Damn OCD!)
        }

        public shellCls(args) {
            _StdOut.clearScreen();
            _StdOut.resetXY();
        }

        public shellMan(args) {
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

        public shellTrace(args) {
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

        public shellRot13(args) {
            if (args.length > 0) {
                // Requires Utils.ts for rot13() function.
                _StdOut.putText(args.join(' ') + " = '" + Utils.rot13(args.join(' ')) +"'");
            } else {
                _StdOut.putText("Usage: rot13 <string>  Please supply a string.");
            }
        }

        public shellPrompt(args) {
            if (args.length > 0) {
                _OsShell.promptStr = args[0];
            } else {
                _StdOut.putText("Usage: prompt <string>  Please supply a string.");
            }
        }

    }
}
