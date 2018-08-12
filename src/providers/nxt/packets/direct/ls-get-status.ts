import {DirectCommand} from "../direct-command";
import {DirectPacket} from "./direct-packet";

export class LsGetStatus extends DirectPacket {
  public bytesReady: number;
  private port: number;

  constructor() {
    super(DirectCommand.LS_GET_STATUS);
  }

  public static createPacket(port: number) {
    let packet: LsGetStatus = new LsGetStatus();
    packet.port = port;
    return packet;
  }

  readPacket(data: number[]): void {
    super.readPacket(data);
    this.bytesReady = data.shift();
  }

  protected writePacketData(expectResponse: boolean, data: number[]): void {
    super.writePacketData(expectResponse, data);
    data.push(this.port);
  }
}
