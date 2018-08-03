import {SystemPacket} from "./system-packet";
import {NXTFile, NXTFileMode, NXTFileState, SystemCommand} from "../../nxt.model";
import {Packet} from "../packet";

export class OpenRead extends SystemPacket {
  private static lastFile: NXTFile;
  public file: NXTFile;

  constructor() {
    super(SystemCommand.OPEN_READ);
  }

  public static createPacket(file: NXTFile) {
    let packet = new OpenRead();
    packet.file = file;
    return packet;
  }

  readPacket(data: number[]): void {
    super.readPacket(data);
    OpenRead.lastFile.handle = data.shift();
    this.file = OpenRead.lastFile;
    this.file.size = Packet.readLong(data);
    this.file.response = this.status;
    SystemPacket.filesByHandle[this.file.handle] = this.file;
  }

  protected writePacketData(expectResponse: boolean, data: number[]): void {
    super.writePacketData(expectResponse, data);
    Packet.writeFileName(this.file.name, data);
    OpenRead.lastFile = this.file;
    this.file.mode = NXTFileMode.READ;
    this.file.status = NXTFileState.OPENING;
  }
}
