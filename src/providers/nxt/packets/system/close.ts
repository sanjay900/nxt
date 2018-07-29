import {SystemPacket} from "./system-packet";
import {NXTFile, NXTFileState, SystemCommand, SystemCommandResponse} from "../../nxt-constants";

export class Close extends SystemPacket {
  public file: NXTFile;

  constructor() {
    super(SystemCommand.CLOSE);
  }

  public static createPacket(file: NXTFile) {
    let packet = new Close();
    packet.file = file;
    return packet;
  }

  protected writePacketData(expectResponse: boolean, data: number[]): void {
    super.writePacketData(expectResponse, data);
    data.push(this.file.handle);
    this.file.status = NXTFileState.CLOSING;
  }

  readPacket(data: number[]): void {
    super.readPacket(data);
    this.file = SystemPacket.filesByHandle[data.shift()];
    this.file.response = this.status;
    if (this.status != SystemCommandResponse.SUCCESS) {
      this.file.status = NXTFileState.ERROR;
    } else {
      this.file.status = NXTFileState.WRITTEN;
    }
  }
}
