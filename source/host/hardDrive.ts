///<reference path="../globals.ts" />

/* ------------
     hardDrive.ts

     Requires global.ts.
     Routines for memory hardware simulation.
     ------------ */

module TSOS {

    export class HardDrive {

        constructor(public supported: boolean = false) {
          this.init();
        }

        public init(){
          //Modernizr.sessionstorage
          if (true) {
               this.supported = true;
           }
        }

        public write(tsb: string, data: string) {
          sessionStorage.setItem(tsb, data);
        }

        public read(tsb: string): string {
          return sessionStorage[tsb];
        }
    }
}
