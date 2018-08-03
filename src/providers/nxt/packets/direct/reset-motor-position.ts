import {Packet} from "../packet";
import {DirectCommand, NxtModel, OutputPort, SystemOutputPort} from "../../nxt.model";
import {DirectPacket} from "./direct-packet";

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
    for (let systemOutputPort of NxtModel.outputToSystemOutput(ports)) {
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
