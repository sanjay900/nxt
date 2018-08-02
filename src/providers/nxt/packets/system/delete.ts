import {SystemPacket} from "./system-packet";
import {NXTFile, NXTFileState, SystemCommand, SystemCommandResponse} from "../../nxt-constants";
import {Packet, PacketConstants} from "../packet";

export class Delete extends SystemPacket {
  public file: NXTFile;

  constructor() {
    super(SystemCommand.DELETE);
  }

  public static createPacket(file: NXTFile) {
    let packet = new Delete();
    packet.file = file;
    return packet;
  }

  readPacket(data: number[]): void {
    super.readPacket(data);
    this.file = SystemPacket.filesByName[Packet.readAsciiz(data, PacketConstants.FILE_NAME_LENGTH)];
    this.file.response = this.status;
    if (this.status == SystemCommandResponse.SUCCESS) {
      this.file.status = NXTFileState.DELETED;
    } else {
      this.file.status = NXTFileState.ERROR;
    }
  }

  protected writePacketData(expectResponse: boolean, data: number[]): void {
    super.writePacketData(expectResponse, data);
    Packet.writeFileName(this.file.name, data);
  }
}
