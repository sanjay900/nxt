import {Packet} from "../packet";
import {DirectCommand} from "../../nxt.model";
import {DirectPacket} from "./direct-packet";

export class MessageWrite extends DirectPacket {
  protected inbox: number;
  protected message: string;

  constructor() {
    super(DirectCommand.MESSAGE_WRITE);
  }

  public static createPacket(inbox: number, message: string) {
    let packet: MessageWrite = new MessageWrite();
    packet.inbox = inbox;
    packet.message = message;
    return packet;
  }

  protected writePacketData(expectResponse: boolean, data: number[]): void {
    super.writePacketData(expectResponse, data);
    data.push(this.inbox, this.message.length);
    Packet.writeAsciiz(this.message, data);
  }
}
