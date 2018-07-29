import {DirectCommand} from "../../nxt-constants";
import {DirectPacket} from "./direct-packet";

export class StopProgram extends DirectPacket {
  constructor() {
    super(DirectCommand.STOP_PROGRAM);
  }

  public static createPacket() {
    return new StopProgram();
  }
}
