import {Packet} from "../packet";
import {DirectPacket} from "./direct-packet";
import {DirectCommand} from "../direct-command";
import {OutputPort, SystemOutputPort, SystemOutputPortUtils} from "../../../motor/output-port";

export class ResetMotorPosition extends DirectPacket {
  private port: SystemOutputPort;
  private relative: boolean;

  constructor() {
    super(DirectCommand.RESET_MOTOR_POSITION);
  }

  public static createPacket(port: SystemOutputPort, relative: boolean) {
    let packet: ResetMotorPosition = new ResetMotorPosition();
    packet.port = port;
    packet.relative = relative;
    return packet;
  }

  public static createMultiple(ports: OutputPort, relative: boolean) {
    let ret: ResetMotorPosition[] = [];
    for (let systemOutputPort of SystemOutputPortUtils.fromOutputPort(ports)) {
      ret.push(ResetMotorPosition.createPacket(systemOutputPort, relative));
    }
    return ret;
  }

  protected writePacketData(expectResponse: boolean, data: number[]): void {
    super.writePacketData(expectResponse, data);
    data.push(this.port);
    Packet.writeBoolean(this.relative, data);
  }
}
