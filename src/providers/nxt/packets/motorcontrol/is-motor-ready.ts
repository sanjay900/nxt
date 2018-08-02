import {OutputPort} from "../../nxt-constants";
import {MotorControlPacket} from "./motor-control-packet";

export class IsMotorReady extends MotorControlPacket {
  public port: OutputPort;
  public ready: boolean;

  public static createMotorPacket(port: OutputPort) {
    let packet: IsMotorReady = new IsMotorReady();
    packet.port = port;
    packet.inbox = 1;
    return packet;
  }

  readPacket(data: number[]): void {
    super.readPacket(data);
    this.port = this.message.charAt(0) as OutputPort;
    this.ready = this.message.charAt(1) == "1";
  }

  protected writePacketData(expectResponse: boolean, data: number[]): void {
    this.message = "3" + this.port + this.ready ? "1" : "0";
    super.writePacketData(expectResponse, data);
  }
}
