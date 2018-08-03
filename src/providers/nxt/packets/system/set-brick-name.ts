import {SystemPacket} from "./system-packet";
import {SystemCommand} from "../../nxt.model";
import {Packet} from "../packet";

export class SetBrickName extends SystemPacket {
  private name: string;

  constructor() {
    super(SystemCommand.SET_BRICK_NAME);
  }

  public static createPacket(name: string) {
    let packet = new SetBrickName();
    packet.name = name;
    return packet;
  }

  protected writePacketData(expectResponse: boolean, data: number[]): void {
    super.writePacketData(expectResponse, data);
    Packet.writeAsciiz(this.name.padEnd(16, "\0"), data);
  }
}
