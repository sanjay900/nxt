import {SystemPacket} from "./system-packet";
import {NXTFile, NXTFileState} from "../../nxt-file";
import {SystemCommand} from "../system-command";
import {SystemCommandResponse} from "../system-command-response";

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

  protected writePacketData(expectResponse: boolean, data: number[]): void {
    super.writePacketData(expectResponse, data);
    data.push(this.file.handle);
    this.file.status = NXTFileState.CLOSING;
  }
}
