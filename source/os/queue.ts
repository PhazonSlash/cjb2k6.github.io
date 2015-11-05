/* ------------
   Queue.ts

   A simple Queue, which is really just a dressed-up JavaScript Array.
   See the Javascript Array documentation at
   https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array
   Look at the push and shift methods, as they are the least obvious here.

   ------------ */

module TSOS {
    export class Queue <T> {
        constructor(public q = new Array<T>()) {
        }

        public getSize(): number {
            return this.q.length;
        }

        public isEmpty(): boolean{
            return (this.q.length == 0);
        }

        public enqueue(element: T): void {
            this.q.push(element);
        }

        public dequeue(): T {
            var retVal: T = null;
            if (this.q.length > 0) {
                retVal = this.q.shift();
            }
            return retVal;
        }

        public peek(index: number): T {
          return(this.q[index]);
        }

        public toString(): string {
            var retVal:string = "";
            for (var i in this.q) {
                retVal += "[" + this.q[i] + "] ";
            }
            return retVal;
        }
    }
}
