import {SystemPacket} from "./system-packet";
import {NXTFile, NXTFileState, SystemCommand, SystemCommandResponse} from "../../nxt-constants";
import {Packet, PacketConstants} from "../packet";

export class FindFirst extends SystemPacket {
  public file: NXTFile;
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

  protected writePacketData(expectResponse: boolean, data: number[]): void {
    super.writePacketData(expectResponse, data);
    Packet.writeFileName(this.search, data);
  }

  readPacket(data: number[]): void {
    super.readPacket(data);
    this.handle = data.shift();
    this.file = new NXTFile(Packet.readAsciiz(data, PacketConstants.FILE_NAME_LENGTH));
    this.file.size = Packet.readLong(data);
  }
}
