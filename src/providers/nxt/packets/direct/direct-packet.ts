import {Packet} from "../packet";
import {TelegramType} from "../../nxt-packet";

export abstract class DirectPacket extends Packet {
  protected writePacketData(expectResponse: boolean, data: number[]) {
    data.push(expectResponse ? TelegramType.DIRECT_COMMAND_RESPONSE : TelegramType.DIRECT_COMMAND_NO_RESPONSE);
    data.push(this.id);
  }
}
