import {Packet} from "../packet";
import {DirectCommand} from "../direct-command";
import {DirectPacket} from "./direct-packet";

export class GetCurrentProgramName extends DirectPacket {
  public programName: string;

  constructor() {
    super(DirectCommand.GET_CURRENT_PROGRAM_NAME);
  }


  readPacket(data: number[]): void {
    super.readPacket(data);
    this.programName = Packet.readAsciiz(data, Packet.FILE_NAME_LENGTH);
  }
}
