import {DirectCommand} from "../direct-command";
import {DirectPacket} from "./direct-packet";

export class StopProgram extends DirectPacket {
  constructor() {
    super(DirectCommand.STOP_PROGRAM);
  }

  public static createPacket() {
    return new StopProgram();
  }
}
