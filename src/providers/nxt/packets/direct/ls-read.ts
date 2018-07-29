import {DirectCommand} from "../../nxt-constants";
import {DirectPacket} from "./direct-packet";

export class LsRead extends DirectPacket {
  private static RX_DATA_SIZE: number = 19;
  private port: number;
  public bytesRead: number;
  public rxData: number[];

  constructor() {
    super(DirectCommand.LS_GET_STATUS);
  }

  public static createPacket(port: number) {
    let packet: LsRead = new LsRead();
    packet.port = port;
    return packet;
  }

  protected writePacketData(expectResponse: boolean, data: number[]): void {
    super.writePacketData(expectResponse, data);
    data.push(this.port);
  }

  readPacket(data: number[]): void {
    super.readPacket(data);
    this.bytesRead = data.shift();
    this.rxData = data.splice(0,LsRead.RX_DATA_SIZE);
  }
}
