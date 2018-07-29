import {Packet} from "../packet";
import {DirectCommand} from "../../nxt-constants";
import {DirectPacket} from "./direct-packet";

export class KeepAlive extends DirectPacket {
  private currentSleepTimeLimit: number;
  constructor() {
    super(DirectCommand.KEEP_ALIVE);
  }

  readPacket(data: number[]): void {
    super.readPacket(data);
    Packet.readLong(data);
  }
}
