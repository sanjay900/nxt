import {SystemPacket} from "./system-packet";
import {SystemCommand} from "../../nxt.model";
import {Packet, PacketConstants} from "../packet";

export class FindFirst extends SystemPacket {
  public fileName: string;
  public fileSize: number;
  public handle: number;
  private search: string;

  constructor() {
    super(SystemCommand.FIND_FIRST);
  }

  public static createPacket(search: string) {
    let packet = new FindFirst();
    packet.search = search;
    return packet;
  }

  readPacket(data: number[]): void {
    super.readPacket(data);
    this.handle = data.shift();
    this.fileName = Packet.readAsciiz(data, PacketConstants.FILE_NAME_LENGTH);
    this.fileSize = Packet.readLong(data);
  }

  protected writePacketData(expectResponse: boolean, data: number[]): void {
    super.writePacketData(expectResponse, data);
    Packet.writeFileName(this.search, data);
  }
}
