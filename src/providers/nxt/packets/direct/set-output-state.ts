import {Packet} from "../packet";
import {DirectPacket} from "./direct-packet";
import {DirectCommand} from "../direct-command";
import {OutputRegulationMode} from "../../../motor/output-regulation-mode";
import {OutputRunState} from "../../../motor/output-run-state";
import {SystemOutputPort} from "../../../motor/output-port";

export class SetOutputState extends DirectPacket {
  private port: SystemOutputPort;
  private power: number;
  private mode: number;
  private regulationMode: OutputRegulationMode;
  private turnRatio: number;
  private runState: OutputRunState;
  private tachoLimit: number;

  constructor() {
    super(DirectCommand.SET_OUTPUT_STATE);
  }

  public static createPacket(port: SystemOutputPort, power: number, mode: number, regulationMode: OutputRegulationMode,
                             turnRatio: number, runState: OutputRunState, tachoLimit: number) {
    let packet: SetOutputState = new SetOutputState();
    packet.port = port;
    packet.power = power;
    packet.mode = mode;
    packet.regulationMode = regulationMode;
    packet.turnRatio = turnRatio;
    packet.runState = runState;
    packet.tachoLimit = tachoLimit;
    return packet;
  }

  protected writePacketData(expectResponse: boolean, data: number[]): void {
    super.writePacketData(expectResponse, data);
    data.push(this.port, this.power, this.mode, this.regulationMode, this.turnRatio, this.runState);
    Packet.writeLong(this.tachoLimit, data);
  }
}
