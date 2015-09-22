var tabMode = false;
var matchArray = [];
var matchIndex = 0;
var commandHistory = [];
var historyIndex = 0;
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
                var chr = _KernelInputQueue.dequeue();
                if (chr === String.fromCharCode(13)) {
                    _OsShell.handleInput(this.buffer);
                    tabMode = false;
                    commandHistory.push(this.buffer);
                    this.resetHistoryIndex();
                    this.buffer = "";
                }
                else if (chr === String.fromCharCode(8)) {
                    this.removeText(this.buffer.charAt(this.buffer.length - 1));
                    this.buffer = this.buffer.substring(0, this.buffer.length - 1);
                    tabMode = false;
                }
                else if (chr === String.fromCharCode(9)) {
                    if (this.buffer.length > 0) {
                        var newBuff = this.autoComplete(this.buffer);
                        if (newBuff.length > 0) {
                            this.removeText(this.buffer);
                            this.buffer = newBuff;
                            this.putText(this.buffer);
                        }
                    }
                }
                else if (chr === String.fromCharCode(38)) {
                    this.traverseHistory("back");
                }
                else if (chr === String.fromCharCode(40)) {
                    this.traverseHistory("forward");
                }
                else {
                    tabMode = false;
                    this.putText(chr);
                    this.buffer += chr;
                }
            }
        };
        Console.prototype.removeText = function (text) {
            if (text !== "") {
                var offset = _DrawingContext.measureText(this.currentFont, this.currentFontSize, text);
                this.currentXPosition = this.currentXPosition - offset;
                _DrawingContext.clearRect(this.currentXPosition, this.currentYPosition - this.currentFontSize - 1, offset, this.currentFontSize * 2);
            }
        };
        Console.prototype.putText = function (text) {
            if (text !== "") {
                _DrawingContext.drawText(this.currentFont, this.currentFontSize, this.currentXPosition, this.currentYPosition, text);
                var offset = _DrawingContext.measureText(this.currentFont, this.currentFontSize, text);
                this.currentXPosition = this.currentXPosition + offset;
            }
        };
        Console.prototype.autoComplete = function (str) {
            str = str.toLowerCase();
            var match = "";
            if (!tabMode) {
                tabMode = true;
                var pattern = new RegExp("^" + str + "\\w*");
                matchArray = [];
                matchIndex = 0;
                for (var i = 0; i < _OsShell.commandList.length; i++) {
                    if (_OsShell.commandList[i].toString().search(pattern) >= 0) {
                        matchArray.push(_OsShell.commandList[i].toString());
                    }
                }
            }
            if (matchArray.length > 0) {
                match = matchArray[matchIndex];
                matchIndex++;
                if (matchIndex > matchArray.length - 1) {
                    matchIndex = 0;
                }
            }
            return match;
        };
        Console.prototype.traverseHistory = function (direction) {
            tabMode = false;
            if (commandHistory.length > 0) {
                if (commandHistory[historyIndex].length > 0) {
                    this.removeText(this.buffer);
                    this.buffer = commandHistory[historyIndex];
                    this.putText(this.buffer);
                }
            }
            if (direction === "back") {
                if (historyIndex > 0) {
                    historyIndex--;
                }
            }
            else {
                if (historyIndex < commandHistory.length - 1) {
                    historyIndex++;
                }
            }
        };
        Console.prototype.resetHistoryIndex = function () {
            if (commandHistory.length > 0) {
                historyIndex = commandHistory.length - 1;
            }
        };
        Console.prototype.advanceLine = function () {
            this.currentXPosition = 0;
            this.currentYPosition += _DefaultFontSize +
                _DrawingContext.fontDescent(this.currentFont, this.currentFontSize) +
                _FontHeightMargin;
            if (this.currentYPosition > _Canvas.height) {
                var imgData = _DrawingContext.getImageData(0, 0, _Canvas.width, _Canvas.height);
                _Canvas.height = _Canvas.height + _Canvas.offsetHeight;
                _DrawingContext.putImageData(imgData, 0, 0);
            }
        };
        return Console;
    })();
    TSOS.Console = Console;
})(TSOS || (TSOS = {}));
