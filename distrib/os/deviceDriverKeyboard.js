///<reference path="../globals.ts" />
///<reference path="deviceDriver.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/* ----------------------------------
   DeviceDriverKeyboard.ts

   Requires deviceDriver.ts

   The Kernel Keyboard Device Driver.
   ---------------------------------- */
var TSOS;
(function (TSOS) {
    // Extends DeviceDriver
    var DeviceDriverKeyboard = (function (_super) {
        __extends(DeviceDriverKeyboard, _super);
        function DeviceDriverKeyboard() {
            // Override the base method pointers.
            _super.call(this, this.krnKbdDriverEntry, this.krnKbdDispatchKeyPress);
        }
        DeviceDriverKeyboard.prototype.krnKbdDriverEntry = function () {
            // Initialization routine for this, the kernel-mode Keyboard Device Driver.
            this.status = "loaded";
            // More?
        };
        DeviceDriverKeyboard.prototype.krnKbdDispatchKeyPress = function (params) {
            // Parse the params.    TODO: Check that the params are valid and osTrapError if not.
            var keyCode = params[0];
            var isShifted = params[1];
            _Kernel.krnTrace("Key code:" + keyCode + " shifted:" + isShifted);
            var chr = "";
            // Check to see if we even want to deal with the key that was pressed.
            if (((keyCode >= 65) && (keyCode <= 90)) ||
                ((keyCode >= 97) && (keyCode <= 123))) {
                // Determine the character we want to display.
                // Assume it's lowercase...
                chr = String.fromCharCode(keyCode + 32);
                // ... then check the shift key and re-adjust if necessary.
                if (isShifted) {
                    chr = String.fromCharCode(keyCode);
                }
                // TODO: Check for caps-lock and handle as shifted if so.
                _KernelInputQueue.enqueue(chr);
            }
            else if ((keyCode == 32) ||
                (keyCode == 13) ||
                (keyCode == 8)) {
                chr = String.fromCharCode(keyCode);
                _KernelInputQueue.enqueue(chr);
            }
            else if (((keyCode >= 48) && (keyCode <= 57))) {
                if (isShifted) {
                    switch (keyCode) {
                        case 48:
                            chr = ")";
                            break;
                        case 49:
                            chr = "!";
                            break;
                        case 50:
                            chr = "@";
                            break;
                        case 51:
                            chr = "#";
                            break;
                        case 52:
                            chr = "$";
                            break;
                        case 53:
                            chr = "%";
                            break;
                        case 54:
                            chr = "^";
                            break;
                        case 55:
                            chr = "&";
                            break;
                        case 56:
                            chr = "*";
                            break;
                        case 57:
                            chr = "(";
                            break;
                    }
                }
                else {
                    chr = String.fromCharCode(keyCode);
                }
                _KernelInputQueue.enqueue(chr);
            }
            else {
                switch (keyCode) {
                    case 186:
                        if (isShifted) {
                            chr = ":";
                        }
                        else {
                            chr = ";";
                        }
                        break;
                    case 187:
                        if (isShifted) {
                            chr = "+";
                        }
                        else {
                            chr = "=";
                        }
                        break;
                    case 188:
                        if (isShifted) {
                            chr = "<";
                        }
                        else {
                            chr = ",";
                        }
                        break;
                    case 189:
                        if (isShifted) {
                            chr = "_";
                        }
                        else {
                            chr = "-";
                        }
                        break;
                    case 190:
                        if (isShifted) {
                            chr = ">";
                        }
                        else {
                            chr = ".";
                        }
                        break;
                    case 191:
                        if (isShifted) {
                            chr = "?";
                        }
                        else {
                            chr = "/";
                        }
                        break;
                    case 192:
                        if (isShifted) {
                            chr = "~";
                        }
                        else {
                            chr = "`";
                        }
                        break;
                    case 219:
                        if (isShifted) {
                            chr = "{";
                        }
                        else {
                            chr = "[";
                        }
                        break;
                    case 220:
                        if (isShifted) {
                            chr = "|";
                        }
                        else {
                            chr = "\\";
                        }
                        break;
                    case 221:
                        if (isShifted) {
                            chr = "}";
                        }
                        else {
                            chr = "]";
                        }
                        break;
                    case 222:
                        if (isShifted) {
                            chr = "\"";
                        }
                        else {
                            chr = "'";
                        }
                        break;
                }
                _KernelInputQueue.enqueue(chr);
            }
        };
        return DeviceDriverKeyboard;
    })(TSOS.DeviceDriver);
    TSOS.DeviceDriverKeyboard = DeviceDriverKeyboard;
})(TSOS || (TSOS = {}));
