import {DirectCommandResponse} from "./direct-command-response";
import {SystemCommandResponse} from "./system-command-response";
import {SystemCommand} from "./system-command";
import {DirectCommand} from "./direct-command";
import {Close} from "./system/close";
import {GetFirmwareVersion} from "./system/get-firmware-version";
import {KeepAlive} from "./direct/keep-alive";
import {LsWrite} from "./direct/ls-write";
import {MessageWrite} from "./direct/message-write";
import {LsRead} from "./direct/ls-read";
import {FindNext} from "./system/find-next";
import {GetInputValues} from "./direct/get-input-values";
import {GetBatteryLevel} from "./direct/get-battery-level";
import {LsGetStatus} from "./direct/ls-get-status";
import {SetInputMode} from "./direct/set-input-mode";
import {GetDeviceInfo} from "./system/get-device-info";
import {Delete} from "./system/delete";
import {MessageRead} from "./direct/message-read";
import {OpenRead} from "./system/open-read";
import {GetOutputState} from "./direct/get-output-state";
import {SetBrickName} from "./system/set-brick-name";
import {StartProgram} from "./direct/start-program";
import {GetCurrentProgramName} from "./direct/get-current-program-name";
import {FindFirst} from "./system/find-first";
import {Write} from "./system/write";
import {ResetMotorPosition} from "./direct/reset-motor-position";
import {StopProgram} from "./direct/stop-program";
import {OpenWrite} from "./system/open-write";
import {PlaySoundFile} from "./direct/play-sound-file";
import {ResetInputScaledValue} from "./direct/reset-input-scaled-value";
import {PlayTone} from "./direct/play-tone";
import {StopSoundPlayback} from "./direct/stop-sound-playback";
import {SetOutputState} from "./direct/set-output-state";

export class PacketConstants {
  static FILE_NAME_LENGTH: number = 20;
  static S_WORD_LENGTH: number = 20;
}

export abstract class Packet {
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
  public status: DirectCommandResponse | SystemCommandResponse;

  protected constructor(protected _id: SystemCommand | DirectCommand) {
  }

  get id(): SystemCommand | DirectCommand {
    return this._id;
  }

  protected static readSWord(data: number[]): number {
    return Packet.readUWord(data) - PacketConstants.S_WORD_LENGTH;
  }

  protected static readUWord(data: number[]): number {
    return data.shift() | data.shift() << 8;
  }

  protected static writeWord(short: number, data: number[]) {
    data.push(short, short >> 8);
  }

  protected static writeLong(long: number, data: number[]) {
    data.push(long, long >> 8, long >> 16, long >> 24);
  }

  protected static readLong(data: number[]): number {
    return data.shift() | data.shift() << 8 | data.shift() << 16 | data.shift() << 24;
  }

  protected static writeBoolean(bool: boolean, data: number[]) {
    data.push(bool ? 1 : 0);
  }

  protected static readBoolean(data: number[]): boolean {
    return data.shift() == 1;
  }

  protected static readAsciiz(data: number[], size: number): string {
    let message: string = "";
    for (let i = 0; i < size; i++) {
      message += String.fromCharCode(data.shift());
    }
    return message;
  }

  protected static writeAsciiz(message: string, data: number[]) {
    for (let i = 0; i < message.length; i++) {
      data.push(message.charCodeAt(i));
    }
    data.push(0);
  }

  protected static writeFileName(fileName: string, data: number[]) {
    fileName.padEnd(PacketConstants.FILE_NAME_LENGTH, '\0');
    this.writeAsciiz(fileName, data);
  }

  public readPacket(data: number[]) {
    this.status = data.shift();
  }

  public writePacket(expectResponse: boolean): Uint8Array {
    let data: number[] = [];
    this.writePacketData(expectResponse, data);
    let header: number[] = [];
    Packet.writeWord(data.length, header);
    data.unshift(...header);
    return new Uint8Array(data);
  }

  protected abstract writePacketData(expectResponse: boolean, data: number[]);
}
