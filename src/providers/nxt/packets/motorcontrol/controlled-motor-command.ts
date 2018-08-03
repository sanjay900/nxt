import {OutputPort} from "../../nxt.model";
import {MotorControlPacket} from "./motor-control-packet";

export class ControlledMotorCommand extends MotorControlPacket {
  private ports: OutputPort;
  private power: number;
  private tachoLimit: number;
  private mode: number;

  public static createMotorPacket(ports: OutputPort, power: number, tachoLimit: number, mode: number) {
    let packet: ControlledMotorCommand = new ControlledMotorCommand();
    packet.ports = ports;
    packet.power = power;
    packet.tachoLimit = tachoLimit;
    packet.mode = mode;
    packet.inbox = 1;
    return packet;
  }

  protected writePacketData(expectResponse: boolean, data: number[]): void {
    this.power = MotorControlPacket.convertPower(this.power);
    this.message = "1" + this.ports.toString() + MotorControlPacket.padDigits(Math.round(this.power), 3) +
      MotorControlPacket.padDigits(this.tachoLimit, 6) + this.mode.toString();
    super.writePacketData(expectResponse, data);
  }

}
