import {DirectCommand} from "../../nxt-constants";
import {DirectPacket} from "./direct-packet";

export class LsWrite extends DirectPacket {
  private port: number;
  private txData: number[];
  private rxDataLength: number;

  constructor() {
    super(DirectCommand.LS_GET_STATUS);
  }

  public static createPacket(port: number, txData: number[], rxDataLength: number) {
    let packet: LsWrite = new LsWrite();
    packet.port = port;
    packet.txData = txData;
    packet.rxDataLength = rxDataLength;
    return packet;
  }

  protected writePacketData(expectResponse: boolean, data: number[]): void {
    super.writePacketData(expectResponse, data);
    data.push(this.port);
    data.push(this.txData.length);
    data.push(this.rxDataLength);
    data.push(...this.txData);
  }
}
