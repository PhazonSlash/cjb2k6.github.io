///<reference path="../globals.ts" />
///<reference path="canvastext.ts" />
/* ------------
     Console.ts

     Requires globals.ts

     The OS Console - stdIn and stdOut by default.
     Note: This is not the Shell. The Shell is the "command line interface" (CLI) or interpreter for this console.
     ------------ */
var tabMode = false; //Keeps track of auto-complete mode
var matchArray = []; //There current selection of possible commands to be auto-completed
var matchIndex = 0; //The current index of the matchArray
var TSOS;
(function (TSOS) {
    var Console = (function () {
        function Console(currentFont, currentFontSize, currentXPosition, currentYPosition, buffer) {
            if (currentFont === void 0) { currentFont = _DefaultFontFamily; }
            if (currentFontSize === void 0) { currentFontSize = _DefaultFontSize; }
            if (currentXPosition === void 0) { currentXPosition = 0; }
            if (currentYPosition === void 0) { currentYPosition = _DefaultFontSize; }
            if (buffer === void 0) { buffer = ""; }
            this.currentFont = currentFont;
            this.currentFontSize = currentFontSize;
            this.currentXPosition = currentXPosition;
            this.currentYPosition = currentYPosition;
            this.buffer = buffer;
        }
        Console.prototype.init = function () {
            this.clearScreen();
            this.resetXY();
        };
        Console.prototype.clearScreen = function () {
            _DrawingContext.clearRect(0, 0, _Canvas.width, _Canvas.height);
        };
        Console.prototype.resetXY = function () {
            this.currentXPosition = 0;
            this.currentYPosition = this.currentFontSize;
        };
        Console.prototype.handleInput = function () {
            while (_KernelInputQueue.getSize() > 0) {
                // Get the next character from the kernel input queue.
                var chr = _KernelInputQueue.dequeue();
                //console.log("Detected keystroke: " + chr + "Commands: " + _OsShell.commands);
                // Check to see if it's "special" (enter or ctrl-c) or "normal" (anything else that the keyboard device driver gave us).
                if (chr === String.fromCharCode(13)) {
                    // The enter key marks the end of a console command, so ...
                    // ... tell the shell ...
                    _OsShell.handleInput(this.buffer);
                    // ... and reset our buffer.
                    tabMode = false;
                    this.buffer = "";
                }
                else if (chr === String.fromCharCode(8)) {
                    //Remove the char from the buffer
                    this.removeText(this.buffer.charAt(this.buffer.length - 1));
                    this.buffer = this.buffer.substring(0, this.buffer.length - 1);
                    //Make sure that auto-complete mode ends since the Tab key was not pressed
                    tabMode = false;
                }
                else if (chr === String.fromCharCode(9)) {
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
                else {
                    //Make sure that auto-complete mode ends since the Tab key was not pressed
                    tabMode = false;
                    // This is a "normal" character, so ...
                    // ... draw it on the screen...
                    this.putText(chr);
                    // ... and add it to our buffer.
                    this.buffer += chr;
                }
            }
        };
        Console.prototype.removeText = function (text) {
            if (text !== "") {
                // Move the current X position.
                var offset = _DrawingContext.measureText(this.currentFont, this.currentFontSize, text);
                this.currentXPosition = this.currentXPosition - offset;
                //Blank out old text
                _DrawingContext.clearRect(this.currentXPosition, this.currentYPosition - this.currentFontSize - 1, offset, this.currentFontSize * 2);
            }
        };
        Console.prototype.putText = function (text) {
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
        };
        //Find a matching command when tab is pressed
        Console.prototype.autoComplete = function (str) {
            var match = "";
            if (!tabMode) {
                tabMode = true;
                var pattern = new RegExp("^" + str + "\\w*");
                matchArray = [];
                matchIndex = 0;
                //Match each command against the letters the user provided
                for (var i = 0; i < _OsShell.commandList.length; i++) {
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
        };
        Console.prototype.advanceLine = function () {
            this.currentXPosition = 0;
            /*
             * Font size measures from the baseline to the highest point in the font.
             * Font descent measures from the baseline to the lowest point in the font.
             * Font height margin is extra spacing between the lines.
             */
            this.currentYPosition += _DefaultFontSize +
                _DrawingContext.fontDescent(this.currentFont, this.currentFontSize) +
                _FontHeightMargin;
            // TODO: Handle scrolling. (iProject 1)
        };
        return Console;
    })();
    TSOS.Console = Console;
})(TSOS || (TSOS = {}));
