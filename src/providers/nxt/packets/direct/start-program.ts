import {Packet} from "../packet";
import {DirectCommand} from "../../nxt.model";
import {DirectPacket} from "./direct-packet";

export class StartProgram extends DirectPacket {
  private programName: string;

  constructor() {
    super(DirectCommand.START_PROGRAM);
  }

  public static createPacket(programName: string) {
    let packet: StartProgram = new StartProgram();
    packet.programName = programName;
    return packet;
  }

  protected writePacketData(expectResponse: boolean, data: number[]): void {
    super.writePacketData(expectResponse, data);
    Packet.writeFileName(this.programName, data);
  }
}
