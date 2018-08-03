import {Packet, PacketConstants} from "../packet";
import {DirectCommand} from "../../nxt.model";
import {DirectPacket} from "./direct-packet";

export class GetCurrentProgramName extends DirectPacket {
  public programName: string;

  constructor() {
    super(DirectCommand.START_PROGRAM);
  }


  readPacket(data: number[]): void {
    super.readPacket(data);
    this.programName = Packet.readAsciiz(data, PacketConstants.FILE_NAME_LENGTH);
  }
}
