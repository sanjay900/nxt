import {SystemPacket} from "./system-packet";
import {NXTFile, NXTFileState, SystemCommand, SystemCommandResponse} from "../../nxt-constants";

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

  protected writePacketData(expectResponse: boolean, data: number[]): void {
    super.writePacketData(expectResponse, data);
    data.push(this.file.handle);
    data.push(...this.file.nextChunk());
    this.file.status = NXTFileState.WRITING;
  }

  readPacket(data: number[]): void {
    super.readPacket(data);
    let handle:number = data.shift();
    this.file = SystemPacket.filesByHandle[handle];
    if (this.status != SystemCommandResponse.SUCCESS) {
      this.file.status = NXTFileState.ERROR;
    }
    this.file.response = this.status;
  }
}
