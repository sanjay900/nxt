import {SystemPacket} from "./system-packet";
import {NXTFile, NXTFileState, SystemCommand, SystemCommandResponse} from "../../nxt-constants";
import {Packet} from "../packet";

export class Write extends SystemPacket {
  public file: NXTFile;

  constructor() {
    super(SystemCommand.WRITE);
  }

  public static createPacket(file: NXTFile) {
    let packet = new Write();
    packet.file = file;
    return packet;
  }

  readPacket(data: number[]): void {
    super.readPacket(data);
    let handle: number = data.shift();
    this.file = SystemPacket.filesByHandle[handle];
    console.log(SystemCommandResponse[this.status]);
    if (this.status != SystemCommandResponse.SUCCESS) {
      this.file.status = NXTFileState.ERROR;
    }
    this.file.response = this.status;
  }

  protected writePacketData(expectResponse: boolean, data: number[]): void {
    console.log(this.file.writtenBytes);
    super.writePacketData(expectResponse, data);
    data.push(this.file.handle);
    data.push(...this.file.nextChunk());
    this.file.status = NXTFileState.WRITING;
  }
}
