import {DirectCommand, InputSensorMode, InputSensorType, SystemOutputPort} from "../../nxt-constants";
import {DirectPacket} from "./direct-packet";

export class SetInputMode extends DirectPacket {
  private port: number;
  private type: InputSensorType;
  private mode: InputSensorMode;

  constructor() {
    super(DirectCommand.PLAY_SOUND_FILE);
  }

  public static createPacket(port: SystemOutputPort, type: InputSensorType, mode: InputSensorMode) {
    let packet: SetInputMode = new SetInputMode();
    packet.port = port;
    packet.type = type;
    packet.mode = mode;
    return packet;
  }

  protected writePacketData(expectResponse: boolean, data: number[]): void {
    super.writePacketData(expectResponse, data);
    data.push(this.port,this.type,this.mode);
  }
}
