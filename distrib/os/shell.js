var beamWeapons = [];
var weaponIndex = 0;
var TSOS;
(function (TSOS) {
    var Shell = (function () {
        function Shell() {
            this.promptStr = ">";
            this.commandList = [];
            this.curses = "[fuvg],[cvff],[shpx],[phag],[pbpxfhpxre],[zbgureshpxre],[gvgf]";
            this.apologies = "[sorry]";
        }
        Shell.prototype.init = function () {
            beamWeapons = ["Power Beam", "Wave Beam", "Ice Beam", "Plasma Beam"];
            weaponIndex = 0;
            var sc;
            sc = new TSOS.ShellCommand(this.shellTest, "test", "- A command for testing purposes only.");
            this.commandList[this.commandList.length] = sc;
            sc = new TSOS.ShellCommand(this.shellVer, "ver", "- Displays the current version data.");
            this.commandList[this.commandList.length] = sc;
            sc = new TSOS.ShellCommand(this.shellDate, "date", "- Displays the current date and time.");
            this.commandList[this.commandList.length] = sc;
            sc = new TSOS.ShellCommand(this.shellWhereAmI, "whereami", "- Displays your current location.");
            this.commandList[this.commandList.length] = sc;
            sc = new TSOS.ShellCommand(this.shellStatus, "status", "- Sets your current status.");
            this.commandList[this.commandList.length] = sc;
            sc = new TSOS.ShellCommand(this.shellLoad, "load", "- Loads a program from the program input.");
            this.commandList[this.commandList.length] = sc;
            sc = new TSOS.ShellCommand(this.shellRun, "run", "- Runs process of given Process ID (PID).");
            this.commandList[this.commandList.length] = sc;
            sc = new TSOS.ShellCommand(this.shellClearMem, "clearmem", "- Clears all partitions of memory.");
            this.commandList[this.commandList.length] = sc;
            sc = new TSOS.ShellCommand(this.shellChangeWeapon, "changeweapon", "- Switches to next beam weapon.");
            this.commandList[this.commandList.length] = sc;
            sc = new TSOS.ShellCommand(this.shellShoot, "shoot", "- Fires selected beam weapon.");
            this.commandList[this.commandList.length] = sc;
            sc = new TSOS.ShellCommand(this.shellBSOD, "bsod", "- Displays a blue screen of death.");
            this.commandList[this.commandList.length] = sc;
            sc = new TSOS.ShellCommand(this.shellHelp, "help", "- This is the help command. Seek help.");
            this.commandList[this.commandList.length] = sc;
            sc = new TSOS.ShellCommand(this.shellShutdown, "shutdown", "- Shuts down the virtual OS but leaves the underlying host / hardware simulation running.");
            this.commandList[this.commandList.length] = sc;
            sc = new TSOS.ShellCommand(this.shellCls, "cls", "- Clears the screen and resets the cursor position.");
            this.commandList[this.commandList.length] = sc;
            sc = new TSOS.ShellCommand(this.shellMan, "man", "<topic> - Displays the MANual page for <topic>.");
            this.commandList[this.commandList.length] = sc;
            sc = new TSOS.ShellCommand(this.shellTrace, "trace", "<on | off> - Turns the OS trace on or off.");
            this.commandList[this.commandList.length] = sc;
            sc = new TSOS.ShellCommand(this.shellRot13, "rot13", "<string> - Does rot13 obfuscation on <string>.");
            this.commandList[this.commandList.length] = sc;
            sc = new TSOS.ShellCommand(this.shellPrompt, "prompt", "<string> - Sets the prompt.");
            this.commandList[this.commandList.length] = sc;
            this.putPrompt();
        };
        Shell.prototype.putPrompt = function () {
            _StdOut.putText(this.promptStr);
        };
        Shell.prototype.handleInput = function (buffer) {
            _Kernel.krnTrace("Shell Command~" + buffer);
            var userCommand = this.parseInput(buffer);
            var cmd = userCommand.command;
            var args = userCommand.args;
            var index = 0;
            var found = false;
            var fn = undefined;
            while (!found && index < this.commandList.length) {
                if (this.commandList[index].command === cmd) {
                    found = true;
                    fn = this.commandList[index].func;
                }
                else {
                    ++index;
                }
            }
            if (found) {
                this.execute(fn, args);
            }
            else {
                if (this.curses.indexOf("[" + TSOS.Utils.rot13(cmd) + "]") >= 0) {
                    this.execute(this.shellCurse);
                }
                else if (this.apologies.indexOf("[" + cmd + "]") >= 0) {
                    this.execute(this.shellApology);
                }
                else {
                    this.execute(this.shellInvalidCommand);
                }
            }
        };
        Shell.prototype.execute = function (fn, args) {
            _StdOut.advanceLine();
            fn(args);
            if (_StdOut.currentXPosition > 0) {
                _StdOut.advanceLine();
            }
            this.putPrompt();
        };
        Shell.prototype.parseInput = function (buffer) {
            var retVal = new TSOS.UserCommand();
            buffer = TSOS.Utils.trim(buffer);
            buffer = buffer.toLowerCase();
            var tempList = buffer.split(" ");
            var cmd = tempList.shift();
            cmd = TSOS.Utils.trim(cmd);
            retVal.command = cmd;
            for (var i in tempList) {
                var arg = TSOS.Utils.trim(tempList[i]);
                if (arg != "") {
                    retVal.args[retVal.args.length] = tempList[i];
                }
            }
            return retVal;
        };
        Shell.prototype.shellInvalidCommand = function () {
            _StdOut.putText("Invalid Command. ");
            if (_SarcasticMode) {
                _StdOut.putText("Unbelievable. You, [subject name here],");
                _StdOut.advanceLine();
                _StdOut.putText("must be the pride of [subject hometown here].");
            }
            else {
                _StdOut.putText("Type 'help' for, well... help.");
            }
        };
        Shell.prototype.shellCurse = function () {
            _StdOut.putText("Oh, so that's how it's going to be, eh? Fine.");
            _StdOut.advanceLine();
            _StdOut.putText("Bitch.");
            _SarcasticMode = true;
        };
        Shell.prototype.shellApology = function () {
            if (_SarcasticMode) {
                _StdOut.putText("I think we can put our differences behind us.");
                _StdOut.advanceLine();
                _StdOut.putText("For science . . . You monster.");
                _SarcasticMode = false;
            }
            else {
                _StdOut.putText("For what?");
            }
        };
        Shell.prototype.shellTest = function (args) {
            _ResidentList.fillReadyQueue();
            var pcb;
            while ((pcb = _ReadyQueue.dequeue()) != undefined) {
                console.log("Dequeued: " + pcb.processID);
            }
        };
        Shell.prototype.shellVer = function (args) {
            _StdOut.putText(APP_NAME + " version " + APP_VERSION);
        };
        Shell.prototype.shellDate = function (args) {
            var currentDate = new Date();
            _StdOut.putText("Date: " + currentDate.toLocaleDateString() + " Time: " + currentDate.toLocaleTimeString());
        };
        Shell.prototype.shellWhereAmI = function (args) {
            _StdOut.putText("Chillin' in Phendrana Drifts.");
        };
        Shell.prototype.shellStatus = function (args) {
            if (args.length > 0) {
                var st = "" + args[0];
                if (args.length > 1) {
                    for (var i = 1; i < args.length; i++) {
                        st = st + " " + args[i];
                    }
                }
                _Status = st;
                TSOS.Control.timeStatusUpdate();
            }
        };
        Shell.prototype.shellLoad = function (args) {
            var prgm = document.getElementById("taProgramInput").value;
            if (prgm.length > 0) {
                var pattern = /([^0123456789abcdefABCDEF\s])/g;
                var result = prgm.search(pattern);
                if (result >= 0) {
                    _StdOut.putText("Error: Programs can only contain hex digits and spaces.");
                }
                else {
                    prgm = TSOS.Utils.removeSpaces(prgm);
                    if (prgm.length > 512) {
                        _StdOut.putText("Program cannot be more than 256 bytes long.");
                    }
                    else {
                        var partition = _MemoryManager.getNextFreePartition();
                        if (partition === -1) {
                            _StdOut.putText("Error: No memory partitions available.");
                        }
                        else {
                            _MemoryManager.loadProgram(prgm, partition);
                            var pcb = new TSOS.Pcb();
                            pcb.setPartition(partition);
                            _ResidentList.add(pcb);
                            _StdOut.putText("Program loaded. PID: " + pcb.processID);
                        }
                    }
                }
            }
            else {
                _StdOut.putText("Error: Please type in a program.");
            }
        };
        Shell.prototype.shellRun = function (args) {
            if (args.length > 0) {
                if (args[0].match(/[0-9]+/g)) {
                    if (parseInt(args[0]) === _CurrentPCB.processID) {
                        _CPU.setCPU(_CurrentPCB);
                        _CPU.isExecuting = true;
                    }
                    else {
                        _StdOut.putText("Error: PID " + args[0] + " does not exist currently.");
                    }
                }
                else {
                    _StdOut.putText("Error: Please enter a numeric PID.");
                }
            }
            else {
                _StdOut.putText("Error: Please enter a PID.");
            }
        };
        Shell.prototype.shellClearMem = function (args) {
            _MemoryManager.clearAllMem();
        };
        Shell.prototype.shellChangeWeapon = function (args) {
            weaponIndex++;
            if (weaponIndex >= 4) {
                weaponIndex = 0;
            }
            console.log(beamWeapons[weaponIndex]);
            _StdOut.putText(beamWeapons[weaponIndex] + " selected.");
        };
        Shell.prototype.shellShoot = function (args) {
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
        };
        Shell.prototype.shellBSOD = function (args) {
            _Kernel.krnTrapError("BSOD Test");
        };
        Shell.prototype.shellHelp = function (args) {
            _StdOut.putText("Commands:");
            for (var i in _OsShell.commandList) {
                _StdOut.advanceLine();
                _StdOut.putText("  " + _OsShell.commandList[i].command + " " + _OsShell.commandList[i].description);
            }
        };
        Shell.prototype.shellShutdown = function (args) {
            _StdOut.putText("Shutting down...");
            _Kernel.krnShutdown();
        };
        Shell.prototype.shellCls = function (args) {
            _StdOut.clearScreen();
            _StdOut.resetXY();
        };
        Shell.prototype.shellMan = function (args) {
            if (args.length > 0) {
                var topic = args[0];
                switch (topic) {
                    case "help":
                        _StdOut.putText("Help displays a list of (hopefully) valid commands.");
                        break;
                    default:
                        _StdOut.putText("No manual entry for " + args[0] + ".");
                }
            }
            else {
                _StdOut.putText("Usage: man <topic>  Please supply a topic.");
            }
        };
        Shell.prototype.shellTrace = function (args) {
            if (args.length > 0) {
                var setting = args[0];
                switch (setting) {
                    case "on":
                        if (_Trace && _SarcasticMode) {
                            _StdOut.putText("Trace is already on, doofus.");
                        }
                        else {
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
            }
            else {
                _StdOut.putText("Usage: trace <on | off>");
            }
        };
        Shell.prototype.shellRot13 = function (args) {
            if (args.length > 0) {
                _StdOut.putText(args.join(' ') + " = '" + TSOS.Utils.rot13(args.join(' ')) + "'");
            }
            else {
                _StdOut.putText("Usage: rot13 <string>  Please supply a string.");
            }
        };
        Shell.prototype.shellPrompt = function (args) {
            if (args.length > 0) {
                _OsShell.promptStr = args[0];
            }
            else {
                _StdOut.putText("Usage: prompt <string>  Please supply a string.");
            }
        };
        return Shell;
    })();
    TSOS.Shell = Shell;
})(TSOS || (TSOS = {}));
