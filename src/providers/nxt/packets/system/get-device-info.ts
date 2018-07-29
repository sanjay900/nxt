import {SystemPacket} from "./system-packet";
import {NXTFile, NXTFileState, SystemCommand, SystemCommandResponse} from "../../nxt-constants";
import {Packet, PacketConstants} from "../packet";

export class GetDeviceInfo extends SystemPacket {
  public name: string;
  public btAddress: string;
  public btSignalStrength: number;
  public freeSpace: number;

  constructor() {
    super(SystemCommand.GET_FIRMWARE_VERSION);
  }

  public static createPacket(handle: number) {
    return new GetDeviceInfo();
  }

  readPacket(data: number[]): void {
    super.readPacket(data);
    this.name = Packet.readAsciiz(data, 15);
    this.btAddress = "";
    for (let i =0; i < 6; i++) {
      this.btAddress += data.pop().toString(16);
    }
    this.btSignalStrength = Packet.readLong(data);
    this.freeSpace = Packet.readLong(data);
  }
}
