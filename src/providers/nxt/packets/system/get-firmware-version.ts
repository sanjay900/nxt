import {SystemPacket} from "./system-packet";
import {SystemCommand} from "../system-command";

export class GetFirmwareVersion extends SystemPacket {
  public protocolVersion: string;
  public firmwareVersion: string;

  constructor() {
    super(SystemCommand.GET_FIRMWARE_VERSION);
  }

  public static createPacket() {
    return new GetFirmwareVersion();
  }

  readPacket(data: number[]): void {
    super.readPacket(data);
    let protocolMinor: number = data.shift();
    let protocolMajor: number = data.shift();
    let firmwareMinor: number = data.shift();
    let firmwareMajor: number = data.shift();
    this.protocolVersion = protocolMajor + "." + protocolMinor;
    this.firmwareVersion = firmwareMajor + "." + firmwareMinor;
  }
}
