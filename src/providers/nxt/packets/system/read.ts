import {SystemPacket} from "./system-packet";
import {SystemCommand} from "../system-command";
import {Packet} from "../packet";
import {NXTFile} from "../../nxt-file";

export class Read extends SystemPacket {
  public file: NXTFile;

  constructor() {
    super(SystemCommand.READ);
  }

  public static createPacket(file: NXTFile) {
    let packet = new Read();
    packet.file = file;
    return packet;
  }

  readPacket(data: number[]): void {
    super.readPacket(data);
    let length: number = Packet.readUWord(data);
    this.file.readData(data.splice(0, length));
    this.file.response = this.status;
  }

  protected writePacketData(expectResponse: boolean, data: number[]): void {
    super.writePacketData(expectResponse, data);
    Packet.writeFileName(this.file.name, data);
    data.push(this.file.handle);
    Packet.writeWord(NXTFile.PACKET_SIZE, data);
  }
}
