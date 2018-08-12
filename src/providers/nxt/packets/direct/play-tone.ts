import {Packet} from "../packet";
import {DirectCommand} from "../direct-command";
import {DirectPacket} from "./direct-packet";

export class PlayTone extends DirectPacket {
  private frequency: number;
  private duration: number;

  constructor() {
    super(DirectCommand.PLAY_TONE);
  }

  public static createPacket(frequency: number, duration: number) {
    let packet: PlayTone = new PlayTone();
    packet.frequency = frequency;
    packet.duration = duration;
    return packet;
  }

  protected writePacketData(expectResponse: boolean, data: number[]): void {
    super.writePacketData(expectResponse, data);
    Packet.writeWord(this.frequency, data);
    Packet.writeWord(this.duration, data);
  }
}
