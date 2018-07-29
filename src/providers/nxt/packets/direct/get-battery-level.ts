import {Packet} from "../packet";
import {DirectCommand} from "../../nxt-constants";
import {DirectPacket} from "./direct-packet";

export class GetBatteryLevel extends DirectPacket {
  public voltage: number;

  constructor() {
    super(DirectCommand.GET_BATTERY_LEVEL);
  }

  readPacket(data: number[]): void {
    super.readPacket(data);
    this.voltage = Packet.readUWord(data);
  }
}
