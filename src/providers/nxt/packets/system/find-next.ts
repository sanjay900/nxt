import {SystemPacket} from "./system-packet";
import {SystemCommand} from "../../nxt.model";
import {Packet, PacketConstants} from "../packet";

export class FindNext extends SystemPacket {
  public fileName: string;
  public fileSize: number;
  public handle: number;

  constructor() {
    super(SystemCommand.FIND_NEXT);
  }

  public static createPacket(handle: number) {
    let packet = new FindNext();
    packet.handle = handle;
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
    data.push(this.handle);
  }
}
