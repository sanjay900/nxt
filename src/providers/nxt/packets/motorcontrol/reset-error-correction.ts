import {MessageWrite} from "../direct/message-write";
import {OutputPort} from "../../nxt-constants";
import {MotorControlPacket} from "./motor-control-packet";

export class ResetErrorCorrection extends MotorControlPacket {
  private ports: OutputPort;

  protected writePacketData(expectResponse: boolean, data: number[]): void {
    this.message = "2" + this.ports.toString();
    super.writePacketData(expectResponse, data);
  }

  public static createMotorPacket(ports: OutputPort) {
    let packet: ResetErrorCorrection = new ResetErrorCorrection();
    packet.ports = ports;
    packet.inbox = 1;
    return packet;
  }

}
