import {SystemPacket} from "./system-packet"
import {Packet} from "../packet";
import {SystemCommand} from "../system-command";

export class GetDeviceInfo extends SystemPacket {
  public name: string;
  public btAddress: string;
  public btSignalStrength: number;
  public freeSpace: number;

  constructor() {
    super(SystemCommand.GET_DEVICE_INFO);
  }

  public static createPacket() {
    return new GetDeviceInfo();
  }

  readPacket(data: number[]): void {
    super.readPacket(data);
    this.name = Packet.readAsciiz(data, 15);
    this.btAddress = data.splice(0, 6).map(bt => bt.toString(16).padStart(2, '0')).join(":");
    this.btSignalStrength = Packet.readLong(data);
    this.freeSpace = Packet.readLong(data);
  }
}
