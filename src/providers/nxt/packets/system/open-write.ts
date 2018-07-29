import {SystemPacket} from "./system-packet";
import {NXTFile, NXTFileMode, NXTFileState, SystemCommand, SystemCommandResponse} from "../../nxt-constants";
import {Packet} from "../packet";

export class OpenWrite extends SystemPacket {
  public file: NXTFile;
  private static lastFile: NXTFile;

  constructor() {
    super(SystemCommand.OPEN_WRITE);
  }

  public static createPacket(file: NXTFile) {
    let packet = new OpenWrite();
    packet.file = file;
    return packet;
  }

  protected writePacketData(expectResponse: boolean, data: number[]): void {
    super.writePacketData(expectResponse, data);
    Packet.writeFileName(this.file.name, data);
    Packet.writeLong(this.file.size, data);
    OpenWrite.lastFile = this.file;
    this.file.mode = NXTFileMode.WRITE;
    this.file.status = NXTFileState.OPENING;
  }

  readPacket(data: number[]): void {
    super.readPacket(data);
    OpenWrite.lastFile.handle = data.shift();
    if (this.status == SystemCommandResponse.FILE_ALREADY_EXISTS) {
      this.file.status = NXTFileState.FILE_EXISTS;
    }
    this.file.response = this.status;
  }
}
