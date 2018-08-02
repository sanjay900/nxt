import {Packet} from "../packet";
import {DirectCommand} from "../../nxt-constants";
import {DirectPacket} from "./direct-packet";

export class KeepAlive extends DirectPacket {
  public currentSleepTimeLimit: number;

  constructor() {
    super(DirectCommand.KEEP_ALIVE);
  }

  readPacket(data: number[]): void {
    super.readPacket(data);
    this.currentSleepTimeLimit = Packet.readLong(data);
  }
}
