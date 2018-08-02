import {Packet} from "../packet";
import {DirectCommand} from "../../nxt-constants";
import {DirectPacket} from "./direct-packet";

export class MessageRead extends DirectPacket {
  private static MESSAGE_LENGTH: number = 58;
  public localInbox: number;
  public message: string;
  private remoteInbox: number;
  private removeFromDevice: boolean;

  constructor() {
    super(DirectCommand.MESSAGE_READ);
  }

  public static createPacket(localInbox: number, remoteInbox: number, removeFromDevice: boolean) {
    let packet: MessageRead = new MessageRead();
    packet.localInbox = localInbox;
    packet.remoteInbox = remoteInbox;
    packet.removeFromDevice = removeFromDevice;
    return packet;
  }

  readPacket(data: number[]): void {
    super.readPacket(data);
    this.localInbox = data.shift();
    let messageSize: number = data.shift();
    this.message = Packet.readAsciiz(data, MessageRead.MESSAGE_LENGTH);
    this.message = this.message.substring(0, messageSize);
  }

  protected writePacketData(expectResponse: boolean, data: number[]): void {
    super.writePacketData(expectResponse, data);
    data.push(this.remoteInbox, this.localInbox);
    Packet.writeBoolean(this.removeFromDevice, data);
  }
}
