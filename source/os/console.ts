///<reference path="../globals.ts" />
///<reference path="canvastext.ts" />

/* ------------
     Console.ts

     Requires globals.ts

     The OS Console - stdIn and stdOut by default.
     Note: This is not the Shell. The Shell is the "command line interface" (CLI) or interpreter for this console.
     ------------ */
var tabMode:boolean = false; //Keeps track of auto-complete mode
var matchArray:string[] = []; //There current selection of possible commands to be auto-completed
var matchIndex:number = 0; //The current index of the matchArray
var commandHistory:string[] = []; //History of recent commands
var historyIndex:number = 0; //Points to current spot in history

module TSOS {

    export class Console {

        constructor(public currentFont = _DefaultFontFamily,
                    public currentFontSize = _DefaultFontSize,
                    public currentXPosition = 0,
                    public currentYPosition = _DefaultFontSize,
                    public buffer = "") {
        }

        public init(): void {
            this.clearScreen();
            this.resetXY();
        }

        private clearScreen(): void {
            _DrawingContext.clearRect(0, 0, _Canvas.width, _Canvas.height);
        }

        private resetXY(): void {
            this.currentXPosition = 0;
            this.currentYPosition = this.currentFontSize;
        }

        public handleInput(): void {
            while (_KernelInputQueue.getSize() > 0) {
                // Get the next character from the kernel input queue.
                var chr = _KernelInputQueue.dequeue();
                //console.log("Detected keystroke: " + chr + "Commands: " + _OsShell.commands);
                // Check to see if it's "special" (enter or ctrl-c) or "normal" (anything else that the keyboard device driver gave us).
                if (chr === String.fromCharCode(13)) { //     Enter key
                    // The enter key marks the end of a console command, so ...
                    // ... tell the shell ...
                    _OsShell.handleInput(this.buffer);
                    // ... and reset our buffer.
                    tabMode = false;
                    commandHistory.push(this.buffer);
                    this.resetHistoryIndex();
                    this.buffer = "";
                } else if (chr === String.fromCharCode(8)) { //check if backspace
                    //Remove the char from the buffer
                    this.removeText(this.buffer.charAt(this.buffer.length - 1));
                    this.buffer = this.buffer.substring(0, this.buffer.length - 1);
                    //Make sure that auto-complete mode ends since the Tab key was not pressed
                    tabMode = false;
                } else if (chr === String.fromCharCode(9)) { //check if tab
                    if (this.buffer.length > 0) {
                        //Get the auto-complete command candidate
                        var newBuff = this.autoComplete(this.buffer);
                        if (newBuff.length > 0) {
                            //Clear the current line
                            this.removeText(this.buffer);
                            //Fill the buffer with the command
                            this.buffer = newBuff;
                            //Print it on the CLI
                            this.putText(this.buffer);
                        }
                    }

                } else if (chr === String.fromCharCode(38)) { //check if up
                    this.traverseHistory("back");
                } else if (chr === String.fromCharCode(40)) { //check if down
                    this.traverseHistory("forward");
                } else {
                    //Make sure that auto-complete mode ends since the Tab key was not pressed
                    tabMode = false;
                    // This is a "normal" character, so ...
                    // ... draw it on the screen...
                    this.putText(chr);
                    // ... and add it to our buffer.
                    this.buffer += chr;
                }
                // TODO: Write a case for Ctrl-C.
            }
        }
        public removeText(text) {
            if (text !== "") {
                // Move the current X position.
                var offset = _DrawingContext.measureText(this.currentFont, this.currentFontSize, text);
                this.currentXPosition = this.currentXPosition - offset;

                //Blank out old text
                _DrawingContext.clearRect(this.currentXPosition, this.currentYPosition - this.currentFontSize - 1, offset, this.currentFontSize * 2);
            }
        }
        public putText(text): void {
            // My first inclination here was to write two functions: putChar() and putString().
            // Then I remembered that JavaScript is (sadly) untyped and it won't differentiate
            // between the two.  So rather than be like PHP and write two (or more) functions that
            // do the same thing, thereby encouraging confusion and decreasing readability, I
            // decided to write one function and use the term "text" to connote string or char.
            //
            // UPDATE: Even though we are now working in TypeScript, char and string remain undistinguished.
            //         Consider fixing that.
            if (text !== "") {
                // Draw the text at the current X and Y coordinates.
                _DrawingContext.drawText(this.currentFont, this.currentFontSize, this.currentXPosition, this.currentYPosition, text);
                // Move the current X position.
                var offset = _DrawingContext.measureText(this.currentFont, this.currentFontSize, text);
                this.currentXPosition = this.currentXPosition + offset;
            }
        }
        //Find a matching command(s) when tab is pressed
        public autoComplete(str) {
            str = str.toLowerCase();
            var match:string = "";
            if (!tabMode) {
                tabMode = true;
                var pattern:RegExp = new RegExp("^" + str + "\\w*");
                matchArray = [];
                matchIndex = 0;
                //Match each command against the letters the user provided
                for (var i:number = 0; i < _OsShell.commandList.length; i++) {
                    if (_OsShell.commandList[i].toString().search(pattern) >= 0) {
                        //Store matches
                        matchArray.push(_OsShell.commandList[i].toString());
                    }

                }
            }
            //Cycle through a match each time tab is pressed
            if (matchArray.length > 0) {
                match = matchArray[matchIndex];
                matchIndex++;
                if (matchIndex > matchArray.length - 1) {
                    matchIndex = 0;
                }
            }
            return match;

        }
        //Function to move through the command history using arrow keys
        public traverseHistory(direction) {
            tabMode = false;
            if (commandHistory.length > 0) {
                if (commandHistory[historyIndex].length > 0) {
                    //Clear the current line
                    this.removeText(this.buffer);
                    //Fill the buffer with the command
                    this.buffer = commandHistory[historyIndex];
                    //Print it on the CLI
                    this.putText(this.buffer);
                }
            }
            if (direction === "back") {
                if (historyIndex > 0) {
                    historyIndex--;
                }
            } else {
                if (historyIndex < commandHistory.length - 1) {
                    historyIndex++;
                }
            }
        }
        //Function to point to the most recent command in the command history
        public resetHistoryIndex() {
            if (commandHistory.length > 0) {
                historyIndex = commandHistory.length - 1;
            }
        }
        public advanceLine(): void {
            this.currentXPosition = 0;
            /*
             * Font size measures from the baseline to the highest point in the font.
             * Font descent measures from the baseline to the lowest point in the font.
             * Font height margin is extra spacing between the lines.
             */
            this.currentYPosition += _DefaultFontSize +
                                     _DrawingContext.fontDescent(this.currentFont, this.currentFontSize) +
                                     _FontHeightMargin;

            if (this.currentYPosition > _Canvas.height) {
                var imgData = _DrawingContext.getImageData(0, 0, _Canvas.width, _Canvas.height);
                _Canvas.height = _Canvas.height + _Canvas.offsetHeight;
                _DrawingContext.putImageData(imgData, 0, 0);
            }
        }
    }
 }
