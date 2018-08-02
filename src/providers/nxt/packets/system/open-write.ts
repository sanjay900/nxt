import {SystemPacket} from "./system-packet";
import {NXTFile, NXTFileMode, NXTFileState, SystemCommand, SystemCommandResponse} from "../../nxt-constants";
import {Packet} from "../packet";

export class OpenWrite extends SystemPacket {
  private static lastFile: NXTFile;
  public file: NXTFile;

  constructor() {
    super(SystemCommand.OPEN_WRITE);
  }

  public static createPacket(file: NXTFile) {
    let packet = new OpenWrite();
    packet.file = file;
    return packet;
  }

  readPacket(data: number[]): void {
    super.readPacket(data);
    this.file = OpenWrite.lastFile;
    this.file.handle = data.shift();
    if (this.status == SystemCommandResponse.FILE_ALREADY_EXISTS) {
      this.file.status = NXTFileState.FILE_EXISTS;
    }
    this.file.response = this.status;
    SystemPacket.filesByHandle[this.file.handle] = this.file;
  }

  protected writePacketData(expectResponse: boolean, data: number[]): void {
    super.writePacketData(expectResponse, data);
    Packet.writeFileName(this.file.name, data);
    //For whatever reason, an extra null terminator is required that is not documented anywhere.
    data.push(0);
    Packet.writeLong(this.file.size, data);
    OpenWrite.lastFile = this.file;
    this.file.mode = NXTFileMode.WRITE;
    this.file.status = NXTFileState.OPENING;
  }
}
