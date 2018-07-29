import {DirectCommand} from "../../nxt-constants";
import {DirectPacket} from "./direct-packet";

export class ResetInputScaledValue extends DirectPacket {
  private port: number;

  constructor() {
    super(DirectCommand.PLAY_TONE);
  }

  public static createPacket(port: number) {
    let packet: ResetInputScaledValue = new ResetInputScaledValue();
    packet.port = port;
    return packet;
  }

  protected writePacketData(expectResponse: boolean, data: number[]): void {
    super.writePacketData(expectResponse, data);
    data.push(this.port);
  }
}
