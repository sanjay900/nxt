import {DirectCommand} from "../direct-command";
import {DirectPacket} from "./direct-packet";

export class StopSoundPlayback extends DirectPacket {
  constructor() {
    super(DirectCommand.STOP_SOUND_PLAYBACK);
  }

  public static createPacket() {
    return new StopSoundPlayback();
  }
}
