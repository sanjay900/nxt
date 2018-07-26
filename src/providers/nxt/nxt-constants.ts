import {NxtProvider} from "./nxt";
import {EventEmitter} from "@angular/core";


export class NxtConstants {
  public static MOTOR_PROGRAM: string = "MotorControl22.rxe";
}

export enum NXTFileState {
  OPENING = "Opening File", WRITING = "Writing File", CLOSING="Closing File", DONE="Finished", ERROR="Error", FILE_EXISTS="File Already Exists"
}
export class NXTFile {
  public uploadStatus$: EventEmitter<NXTFileState> = new EventEmitter<NXTFileState>();
  public name: string;
  public data: Uint8Array;
  public size: number;
  public handle: number;
  private state: NXTFileState = NXTFileState.OPENING;
  private static PACKET_SIZE: number = 64;

  constructor(name: string, data: Uint8Array, length: number) {
    this.name = name;
    this.data = data;
    this.size = length;
  }

  set status(status: NXTFileState) {
    this.state = status;
    this.uploadStatus$.emit(this.state);
  }
  get status() {
    return this.state;
  }

  get percentage(): number {
    return 100-(this.data.length/this.size*100);
  }

  isFinished(): boolean {
    return this.data.length == 0;
  }

  nextChunk(): Uint8Array {
    let chunkSize: number = Math.min(NXTFile.PACKET_SIZE, this.data.length);
    let ret: Uint8Array  = this.data.slice(0, chunkSize);
    this.data = this.data.slice(chunkSize, this.data.length);
    return ret;
  }

  hasError() {
    return this.state == NXTFileState.ERROR || this.state == NXTFileState.FILE_EXISTS;
  }
}
