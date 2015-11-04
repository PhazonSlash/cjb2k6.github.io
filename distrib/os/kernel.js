var TSOS;
(function (TSOS) {
    var Kernel = (function () {
        function Kernel() {
        }
        Kernel.prototype.krnBootstrap = function () {
            TSOS.Control.hostLog("bootstrap", "host");
            _KernelInterruptQueue = new TSOS.Queue();
            _KernelBuffers = new Array();
            _KernelInputQueue = new TSOS.Queue();
            _Console = new TSOS.Console();
            _Console.init();
            _StdIn = _Console;
            _StdOut = _Console;
            this.krnTrace("Loading the keyboard device driver.");
            _krnKeyboardDriver = new TSOS.DeviceDriverKeyboard();
            _krnKeyboardDriver.driverEntry();
            this.krnTrace(_krnKeyboardDriver.status);
            this.krnTrace("Enabling the interrupts.");
            this.krnEnableInterrupts();
            this.krnTrace("Creating and Launching the shell.");
            _OsShell = new TSOS.Shell();
            _OsShell.init();
            if (_GLaDOS) {
                _GLaDOS.afterStartup();
            }
        };
        Kernel.prototype.krnShutdown = function () {
            this.krnTrace("begin shutdown OS");
            this.krnTrace("Disabling the interrupts.");
            this.krnDisableInterrupts();
            this.krnTrace("end shutdown OS");
        };
        Kernel.prototype.krnOnCPUClockPulse = function () {
            if (_KernelInterruptQueue.getSize() > 0) {
                var interrupt = _KernelInterruptQueue.dequeue();
                this.krnInterruptHandler(interrupt.irq, interrupt.params);
            }
            else if (_CPU.isExecuting && !_SingleStepMode) {
                _CpuScheduler.schedule();
            }
            else {
                this.krnTrace("Idle");
            }
            TSOS.Control.timeStatusUpdate();
        };
        Kernel.prototype.krnEnableInterrupts = function () {
            TSOS.Devices.hostEnableKeyboardInterrupt();
        };
        Kernel.prototype.krnDisableInterrupts = function () {
            TSOS.Devices.hostDisableKeyboardInterrupt();
        };
        Kernel.prototype.krnInterruptHandler = function (irq, params) {
            this.krnTrace("Handling IRQ~" + irq);
            switch (irq) {
                case TIMER_IRQ:
                    this.krnTimerISR();
                    break;
                case KEYBOARD_IRQ:
                    _krnKeyboardDriver.isr(params);
                    _StdIn.handleInput();
                    break;
                default:
                    this.krnTrapError("Invalid Interrupt Request. irq=" + irq + " params=[" + params + "]");
            }
        };
        Kernel.prototype.krnTimerISR = function () {
        };
        Kernel.prototype.krnTrace = function (msg) {
            if (_Trace) {
                if (msg === "Idle") {
                    if (_OSclock % 10 == 0) {
                        TSOS.Control.hostLog(msg, "OS");
                    }
                }
                else {
                    TSOS.Control.hostLog(msg, "OS");
                }
            }
        };
        Kernel.prototype.krnTrapError = function (msg) {
            TSOS.Control.hostLog("OS ERROR - TRAP: " + msg);
            _Canvas.height = 500;
            _Canvas.width = 500;
            _Console.init();
            _DrawingContext.rect(0, 0, _Canvas.width, _Canvas.height);
            _DrawingContext.fillStyle = "blue";
            _DrawingContext.fill();
            _DrawingContext.font = "30px Courier New";
            _DrawingContext.fillStyle = "white";
            _DrawingContext.fillText('PhazonOS has crashed!', 50, 50);
            _DrawingContext.font = "16px Courier New";
            _DrawingContext.fillText('What the hell did you just do? Seriously, are you', 5, 80);
            _DrawingContext.fillText('trying to melt the computer with your stupidity?. I', 5, 100);
            _DrawingContext.fillText('did not even think this was possible.', 5, 120);
            _DrawingContext.fillText('Check to make sure your machine is not a total', 5, 160);
            _DrawingContext.fillText('piece of garbage. Try soaking the RAM in cheetah', 5, 180);
            _DrawingContext.fillText('blood to make it faster. Your motherboard is so', 5, 200);
            _DrawingContext.fillText('fat, its BIOS has its own MAC address. XD', 5, 220);
            _DrawingContext.fillText('Technical information: ', 5, 260);
            _DrawingContext.fillText('*** STOPTHAT: 0x00000BAD (0x00080F10, 0x0000DEAD)', 5, 280);
            _DrawingContext.fillText('For assistance, please mash your face on keyboard.', 5, 320);
            this.krnShutdown();
            clearInterval(_hardwareClockID);
        };
        return Kernel;
    })();
    TSOS.Kernel = Kernel;
})(TSOS || (TSOS = {}));
