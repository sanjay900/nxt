import {Packet} from "../packet";
import {NXTFile, TelegramType} from "../../nxt-constants";

export abstract class SystemPacket extends Packet {
  public static filesByHandle: Map<number, NXTFile> = new Map();
  public static filesByName: Map<string, NXTFile> = new Map();
  protected writePacketData(expectResponse: boolean, data: number[]) {
    data.push(expectResponse ? TelegramType.SYSTEM_COMMAND_RESPONSE : TelegramType.SYSTEM_COMMAND_NO_RESPONSE);
    data.push(this.id);
  }
}
