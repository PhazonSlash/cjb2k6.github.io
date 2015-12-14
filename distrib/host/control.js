var TSOS;
(function (TSOS) {
    var Control = (function () {
        function Control() {
        }
        Control.hostInit = function () {
            _Canvas = document.getElementById('display');
            _DrawingContext = _Canvas.getContext("2d");
            TSOS.CanvasTextFunctions.enable(_DrawingContext);
            document.getElementById("taHostLog").value = "";
            document.getElementById("btnStartOS").focus();
            if (typeof Glados === "function") {
                _GLaDOS = new Glados();
                _GLaDOS.init();
            }
            this.timeStatusUpdate();
        };
        Control.hostLog = function (msg, source) {
            if (source === void 0) { source = "?"; }
            var clock = _OSclock;
            var now = new Date().getTime();
            var str = "({ clock:" + clock + ", source:" + source + ", msg:" + msg + ", now:" + now + " })" + "\n";
            var taLog = document.getElementById("taHostLog");
            taLog.value = str + taLog.value;
        };
        Control.hostBtnStartOS_click = function (btn) {
            btn.disabled = true;
            document.getElementById("btnHaltOS").disabled = false;
            document.getElementById("btnReset").disabled = false;
            document.getElementById("btnSSToggle").disabled = false;
            document.getElementById("display").focus();
            _CPU = new TSOS.Cpu();
            _CPU.init();
            _MemoryManager = new TSOS.MemoryManager();
            _HardDrive = new TSOS.HardDrive();
            _ReadyQueue = new TSOS.Queue();
            _ResidentList = new TSOS.ResidentList();
            _CpuScheduler = new TSOS.CpuScheduler();
            _hardwareClockID = setInterval(TSOS.Devices.hostClockPulse, CPU_CLOCK_INTERVAL);
            _Kernel = new TSOS.Kernel();
            _Kernel.krnBootstrap();
            this.updateMemoryTable();
            this.updateCpuTable();
        };
        Control.hostBtnHaltOS_click = function (btn) {
            Control.hostLog("Emergency halt", "host");
            Control.hostLog("Attempting Kernel shutdown.", "host");
            _Kernel.krnShutdown();
            clearInterval(_hardwareClockID);
        };
        Control.hostBtnReset_click = function (btn) {
            location.reload(true);
        };
        Control.hostBtnSSToggle_click = function (btn) {
            _SingleStepMode = !_SingleStepMode;
            if (_SingleStepMode) {
                _Kernel.krnTrace("Single Step Mode: ACTIVATED");
                document.getElementById("btnSSToggle").innerHTML = "Single Step: ON  ";
                document.getElementById("btnStep").disabled = false;
            }
            else {
                _Kernel.krnTrace("Single Step Mode: DEACTIVATED");
                document.getElementById("btnSSToggle").innerHTML = "Single Step: OFF";
                document.getElementById("btnStep").disabled = true;
            }
        };
        Control.hostBtnStep_click = function (btn) {
            _CpuScheduler.schedule();
        };
        Control.timeStatusUpdate = function () {
            var currentDate = new Date();
            var hours = currentDate.getHours().toString();
            var minutes = currentDate.getMinutes().toString();
            if (minutes.length < 2) {
                minutes = "0" + minutes;
            }
            document.getElementById("dateTimeLabel").innerHTML = "Time: " + hours + ":" + minutes + " " + currentDate.toLocaleDateString()
                + " | Status: " + _Status;
        };
        Control.updateMemoryTable = function () {
            var table = "<tbody>";
            var rowHeader = "0x";
            var rowNumber = 0;
            var currRow = "";
            var memoryIndex = 0;
            for (var i = 0; i < TOTAL_MEMORY_SIZE / 8; i++) {
                table += "<tr>";
                currRow = rowNumber.toString(16);
                while (currRow.length < 3) {
                    currRow = "0" + currRow;
                }
                currRow = currRow.toUpperCase();
                table += "<td style=\"font-weight:bold\">" + rowHeader + currRow + "</td>";
                for (var j = 0; j < 8; j++) {
                    table += "<td>" + _MemoryManager.getByteFromAddr(memoryIndex).getHex().toUpperCase() + "</td>";
                    memoryIndex++;
                }
                table += "</tr>";
                rowNumber = rowNumber + 8;
            }
            table += "</tbody>";
            document.getElementById("memoryTable").innerHTML = table;
        };
        Control.updateHDDTable = function () {
            var table = "";
            var data = "";
            var tsb = "";
            for (var t = 0; t < TRACKS; t++) {
                for (var s = 0; s < SECTORS; s++) {
                    for (var b = 0; b < BLOCKS; b++) {
                        tsb = "" + t + s + b;
                        data = _HardDrive.read(tsb);
                        table += "<tr><td>" + tsb + "</td><td>" + data + "</td></tr>";
                    }
                }
            }
            document.getElementById("hddTableBody").innerHTML = table;
        };
        Control.updateCpuTable = function () {
            var table = "";
            table += "<td>" + _CPU.PC + "</td>";
            table += "<td>" + _CPU.Acc + "</td>";
            table += "<td>" + _CPU.IR.getHex().toUpperCase() + "</td>";
            table += "<td>" + _CPU.Xreg + "</td>";
            table += "<td>" + _CPU.Yreg + "</td>";
            table += "<td>" + _CPU.Zflag + "</td>";
            document.getElementById("cpuTableBody").innerHTML = table;
        };
        Control.updatePcbTable = function () {
            var pcb;
            var table = "";
            if (_CurrentPCB === null) {
                console.log("No PCB to put in table");
            }
            else {
                pcb = _CurrentPCB;
                table += this.buildPcbRow(pcb);
                if (!_ReadyQueue.isEmpty()) {
                    for (var i = 0; i < _ReadyQueue.getSize(); i++) {
                        pcb = _ReadyQueue.peek(i);
                        table += this.buildPcbRow(pcb);
                    }
                }
            }
            document.getElementById("pcbTableBody").innerHTML = table;
        };
        Control.buildPcbRow = function (pcb) {
            var table = "";
            var state = "";
            switch (pcb.processState) {
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
            table += "<td>" + pcb.location + "</td>";
            table += "<td>" + pcb.priority + "</td>";
            table += "</tr>";
            return table;
        };
        return Control;
    })();
    TSOS.Control = Control;
})(TSOS || (TSOS = {}));
