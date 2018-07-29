import {Packet} from "../packet";
import {DirectCommand, InputSensorMode, InputSensorType, SystemOutputPort} from "../../nxt-constants";
import {DirectPacket} from "./direct-packet";

export class GetInputValues extends DirectPacket {
  public port: number;
  public valid: boolean;
  public calibrated: boolean;
  public type: InputSensorType;
  public mode: InputSensorMode;
  public rawValue: number;
  public normalizedValue: number;
  public scaledValue: number;
  public calibratedValue: number;

  constructor() {
    super(DirectCommand.GET_INPUT_VALUES);
  }

  public static createPacket(port: number) {
    let packet: GetInputValues = new GetInputValues();
    packet.port = port;
    return packet;
  }

  protected writePacketData(expectResponse: boolean, data: number[]): void {
    super.writePacketData(expectResponse, data);
    data.push(this.port);
  }


  readPacket(data: number[]): void {
    super.readPacket(data);
    this.port = data.shift();
    this.valid = Packet.readBoolean(data);
    this.calibrated = Packet.readBoolean(data);
    this.type = data.shift();
    this.mode = data.shift();
    this.rawValue = Packet.readUWord(data);
    this.normalizedValue = Packet.readUWord(data);
    this.scaledValue = Packet.readSWord(data);
    this.calibratedValue = Packet.readSWord(data);
  }
}
