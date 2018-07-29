import {DirectCommand} from "../../nxt-constants";
import {DirectPacket} from "./direct-packet";

export class LsGetStatus extends DirectPacket {
  private port: number;
  public bytesReady: number;

  constructor() {
    super(DirectCommand.LS_GET_STATUS);
  }

  public static createPacket(port: number) {
    let packet: LsGetStatus = new LsGetStatus();
    packet.port = port;
    return packet;
  }

  protected writePacketData(expectResponse: boolean, data: number[]): void {
    super.writePacketData(expectResponse, data);
    data.push(this.port);
  }


  readPacket(data: number[]): void {
    super.readPacket(data);
    this.bytesReady = data.shift();
  }
}
