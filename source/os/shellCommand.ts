module TSOS {
    export class ShellCommand {
        constructor(public func: any,
                    public command = "",
                    public description = "") {
        }

        public toString() {
            return this.command;
        }
    }
}
