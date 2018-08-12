import {DirectCommand} from "./direct-command";
import {SystemCommand} from "./system-command";
import {StartProgram} from "./direct/start-program";
import {StopProgram} from "./direct/stop-program";
import {PlaySoundFile} from "./direct/play-sound-file";
import {PlayTone} from "./direct/play-tone";
import {SetOutputState} from "./direct/set-output-state";
import {SetInputMode} from "./direct/set-input-mode";
import {GetOutputState} from "./direct/get-output-state";
import {GetInputValues} from "./direct/get-input-values";
import {ResetInputScaledValue} from "./direct/reset-input-scaled-value";
import {ResetMotorPosition} from "./direct/reset-motor-position";
import {GetBatteryLevel} from "./direct/get-battery-level";
import {StopSoundPlayback} from "./direct/stop-sound-playback";
import {KeepAlive} from "./direct/keep-alive";
import {LsGetStatus} from "./direct/ls-get-status";
import {LsRead} from "./direct/ls-read";
import {LsWrite} from "./direct/ls-write";
import {GetCurrentProgramName} from "./direct/get-current-program-name";
import {MessageWrite} from "./direct/message-write";
import {MessageRead} from "./direct/message-read";
import {OpenRead} from "./system/open-read";
import {OpenWrite} from "./system/open-write";
import {Write} from "./system/write";
import {Close} from "./system/close";
import {Delete} from "./system/delete";
import {FindFirst} from "./system/find-first";
import {FindNext} from "./system/find-next";
import {GetFirmwareVersion} from "./system/get-firmware-version";
import {SetBrickName} from "./system/set-brick-name";
import {GetDeviceInfo} from "./system/get-device-info";
import {Packet} from "./packet";

export class PacketFactory {
  public static COMMAND_MAP: Map<DirectCommand | SystemCommand, new () => Packet> = new Map(
    <[DirectCommand | SystemCommand, new () => Packet][]> [
      [DirectCommand.START_PROGRAM, StartProgram],
      [DirectCommand.STOP_PROGRAM, StopProgram],
      [DirectCommand.PLAY_SOUND_FILE, PlaySoundFile],
      [DirectCommand.PLAY_TONE, PlayTone],
      [DirectCommand.SET_OUTPUT_STATE, SetOutputState],
      [DirectCommand.SET_INPUT_MODE, SetInputMode],
      [DirectCommand.GET_OUTPUT_STATE, GetOutputState],
      [DirectCommand.GET_INPUT_VALUES, GetInputValues],
      [DirectCommand.RESET_INPUT_SCALED_VALUE, ResetInputScaledValue],
      [DirectCommand.RESET_MOTOR_POSITION, ResetMotorPosition],
      [DirectCommand.GET_BATTERY_LEVEL, GetBatteryLevel],
      [DirectCommand.STOP_SOUND_PLAYBACK, StopSoundPlayback],
      [DirectCommand.KEEP_ALIVE, KeepAlive],
      [DirectCommand.LS_GET_STATUS, LsGetStatus],
      [DirectCommand.LS_READ, LsRead],
      [DirectCommand.LS_WRITE, LsWrite],
      [DirectCommand.GET_CURRENT_PROGRAM_NAME, GetCurrentProgramName],
      [DirectCommand.MESSAGE_WRITE, MessageWrite],
      [DirectCommand.MESSAGE_READ, MessageRead],
      [SystemCommand.OPEN_READ, OpenRead],
      [SystemCommand.OPEN_WRITE, OpenWrite],
      [SystemCommand.WRITE, Write],
      [SystemCommand.CLOSE, Close],
      [SystemCommand.DELETE, Delete],
      [SystemCommand.FIND_FIRST, FindFirst],
      [SystemCommand.FIND_NEXT, FindNext],
      [SystemCommand.GET_FIRMWARE_VERSION, GetFirmwareVersion],
      [SystemCommand.SET_BRICK_NAME, SetBrickName],
      [SystemCommand.GET_DEVICE_INFO, GetDeviceInfo]
    ]);


  public static readPacket(data: number[]): Packet {
    let messageType: number = data.shift();
    let packetCtor: new () => Packet = PacketFactory.COMMAND_MAP.get(messageType);
    if (!packetCtor) {
      console.log("Unable to parse packet of type: 0x"+messageType.toString(16));
      return null;
    }
    let packet: Packet = new packetCtor();
    packet.readPacket(data);
    return packet;
  }
}
