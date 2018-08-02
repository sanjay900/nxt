import {SystemPacket} from "./system-packet";
import {NXTFile, SystemCommand} from "../../nxt-constants";
import {Packet, PacketConstants} from "../packet";

export class FindNext extends SystemPacket {
  public file: NXTFile;
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
    this.file = new NXTFile(Packet.readAsciiz(data, PacketConstants.FILE_NAME_LENGTH));
    this.file.size = Packet.readLong(data);
  }

  protected writePacketData(expectResponse: boolean, data: number[]): void {
    super.writePacketData(expectResponse, data);
    data.push(this.handle);
  }
}
