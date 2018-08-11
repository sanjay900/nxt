import {EventEmitter} from "@angular/core";
import {Subscription} from "rxjs";
import {NxtProvider} from "./nxt";
import {OpenWrite} from "./packets/system/open-write";
import {Write} from "./packets/system/write";
import {Utils} from "../utils/utils";
import {Close} from "./packets/system/close";
import {StartProgram} from "./packets/direct/start-program";
import {DirectCommandResponse, SystemCommand, SystemCommandResponse} from "./nxt.model";


export enum NXTFileState {
  OPENING = "Opening File",
  WRITING = "Writing File",
  CLOSING = "Closing File",
  WRITTEN = "Written File",
  DELETED = "Deleted File",
  READ = "Read File",
  ERROR = "Error",
  FILE_EXISTS = "File already exists"
}

export enum NXTFileMode {
  READ, WRITE
}
export class NXTFile {
  public static PACKET_SIZE: number = 64;
  public uploadStatus$: EventEmitter<NXTFileState> = new EventEmitter<NXTFileState>();
  public handle: number;
  private _response: DirectCommandResponse | SystemCommandResponse;
  private writtenBytes: number = 0;
  public mode: NXTFileMode;
  public size: number;
  public autoStart: boolean;
  private state: NXTFileState = NXTFileState.OPENING;
  private data: number[] = [];
  private writeSubscription: Subscription;

  constructor(public name: string, private nxt: NxtProvider) {
  }

  get response(): DirectCommandResponse | SystemCommandResponse {
    return this._response;
  }

  set response(value: DirectCommandResponse | SystemCommandResponse) {
    this._response = value;
  }
  get status() {
    return this.state;
  }

  set status(status: NXTFileState) {
    this.state = status;
    this.uploadStatus$.emit(this.state);
  }

  get percentage(): number {
    if (this.writtenBytes == 0) return 0;
    return (this.writtenBytes / this.size * 100);
  }

  get formattedErrorMessage(): string {
    if (!this.hasError()) return "No Error";
    return Utils.formatTitle(DirectCommandResponse[this._response] || SystemCommandResponse[this._response]);
  }

  nextChunk(): number[] {
    if (this.mode == NXTFileMode.READ) return;
    let chunkSize: number = Math.min(NXTFile.PACKET_SIZE, this.data.length);
    let ret: number[] = this.data.slice(0, chunkSize);
    this.data = this.data.slice(chunkSize, this.data.length);
    this.writtenBytes = this.size - this.data.length;
    return ret;
  }

  hasError() {
    return this.state == NXTFileState.ERROR || this.state == NXTFileState.FILE_EXISTS;
  }

  readData(number: number[]) {
    this.data.push(...number);
  }
  beginTransfer() {
    let subscription: Subscription = this.nxt.packetEvent$
      .filter(packet => packet.id == SystemCommand.OPEN_WRITE)
      .filter((packet: OpenWrite) => packet.file == this)
      .subscribe(packet => {
        subscription.unsubscribe();
        if (packet.status != SystemCommandResponse.SUCCESS) {
          return;
        }
        this.writeSubscription = this.nxt.packetEvent$
          .filter(packet => packet.id == SystemCommand.WRITE)
          .filter((packet: Write) => packet.file == this)
          .subscribe(this.write.bind(this));
        this.write();
      });
    this.nxt.writePacket(true, OpenWrite.createPacket(this));
  }
  private write() {
    if (this.size == this.writtenBytes) {
      this.writeSubscription.unsubscribe();
      this.nxt.writePacket(true, Close.createPacket(this));
      let subscription: Subscription = this.nxt.packetEvent$
        .filter(packet => packet.id == SystemCommand.CLOSE)
        .filter((packet: Close) => packet.file == this)
        .subscribe(() => {
          subscription.unsubscribe();
          if (this.autoStart) {
            this.nxt.writePacket(true, StartProgram.createPacket(this.name));
          }
        });
      return;
    }
    this.nxt.writePacket(true, Write.createPacket(this));
  }
}
