import {Packet} from "../packet";
import {DirectPacket} from "./direct-packet";
import {DirectCommand} from "../direct-command";
import {OutputPort, OutputRegulationMode, SystemOutputPort} from "../../../motor/motor";
import {OutputRunState} from "../../../motor/motor";
import {SystemOutputPortUtils} from "../../../motor/motor";

export class GetOutputState extends DirectPacket {
  public port: SystemOutputPort;
  public power: number;
  public mode: number;
  public regulationMode: OutputRegulationMode;
  public turnRatio: number;
  public runState: OutputRunState;
  public tachoLimit: number;
  public tachoCount: number;
  public blockTachoCount: number;
  public rotationCount: number;

  constructor() {
    super(DirectCommand.GET_OUTPUT_STATE);
  }

  public static createPacket(port: SystemOutputPort) {
    let packet: GetOutputState = new GetOutputState();
    packet.port = port;
    return packet;
  }

  public static createMultiple(ports: OutputPort): GetOutputState[] {
    let ret: GetOutputState[] = [];
    for (let systemOutputPort of SystemOutputPortUtils.fromOutputPort(ports)) {
      ret.push(GetOutputState.createPacket(systemOutputPort));
    }
    return ret;
  }

  readPacket(data: number[]): void {
    super.readPacket(data);
    this.port = data.shift();
    this.power = data.shift();
    this.mode = data.shift();
    this.regulationMode = data.shift();
    this.turnRatio = data.shift();
    this.runState = data.shift();
    this.tachoLimit = Packet.readLong(data);
    this.tachoCount = Packet.readLong(data);
    this.blockTachoCount = Packet.readLong(data);
    this.rotationCount = Packet.readLong(data);
  }

  protected writePacketData(expectResponse: boolean, data: number[]): void {
    super.writePacketData(expectResponse, data);
    data.push(this.port);
  }
}
