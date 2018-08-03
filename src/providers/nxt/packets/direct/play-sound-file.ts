import {Packet} from "../packet";
import {DirectCommand} from "../../nxt.model";
import {DirectPacket} from "./direct-packet";

export class PlaySoundFile extends DirectPacket {
  private loop: boolean;
  private soundFileName: string;

  constructor() {
    super(DirectCommand.PLAY_SOUND_FILE);
  }

  public static createPacket(loop: boolean, soundFileName: string) {
    let packet: PlaySoundFile = new PlaySoundFile();
    packet.loop = loop;
    packet.soundFileName = soundFileName;
    return packet;
  }

  protected writePacketData(expectResponse: boolean, data: number[]): void {
    super.writePacketData(expectResponse, data);
    Packet.writeBoolean(this.loop, data);
    Packet.writeFileName(this.soundFileName, data);
  }
}
