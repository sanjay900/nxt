import {OutputPort} from "../../nxt.model";
import {MotorControlPacket} from "./motor-control-packet";

export class ClassicMotorCommand extends MotorControlPacket {
  private ports: OutputPort;
  private power: number;
  private tachoLimit: number;
  private speedRegulation: boolean;

  public static createMotorPacket(ports: OutputPort, power: number, tachoLimit: number, speedRegulation: boolean) {
    let packet: ClassicMotorCommand = new ClassicMotorCommand();
    packet.ports = ports;
    packet.power = power;
    packet.tachoLimit = tachoLimit;
    packet.speedRegulation = speedRegulation;
    packet.inbox = 1;
    return packet;
  }

  protected writePacketData(expectResponse: boolean, data: number[]): void {
    this.power = MotorControlPacket.convertPower(this.power);
    this.message = "4" + this.ports.toString() + MotorControlPacket.padDigits(this.power, 3) +
      MotorControlPacket.padDigits(this.tachoLimit, 6) + (this.speedRegulation ? "1" : "0");
    super.writePacketData(expectResponse, data);
  }

}
