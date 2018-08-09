import {EventEmitter} from "@angular/core";
import {Packet} from "./packets/packet";
import {StartProgram} from "./packets/direct/start-program";
import {StopProgram} from "./packets/direct/stop-program";
import {PlaySoundFile} from "./packets/direct/play-sound-file";
import {PlayTone} from "./packets/direct/play-tone";
import {SetOutputState} from "./packets/direct/set-output-state";
import {SetInputMode} from "./packets/direct/set-input-mode";
import {GetOutputState} from "./packets/direct/get-output-state";
import {GetInputValues} from "./packets/direct/get-input-values";
import {ResetInputScaledValue} from "./packets/direct/reset-input-scaled-value";
import {MessageWrite} from "./packets/direct/message-write";
import {ResetMotorPosition} from "./packets/direct/reset-motor-position";
import {GetBatteryLevel} from "./packets/direct/get-battery-level";
import {StopSoundPlayback} from "./packets/direct/stop-sound-playback";
import {KeepAlive} from "./packets/direct/keep-alive";
import {LsGetStatus} from "./packets/direct/ls-get-status";
import {LsRead} from "./packets/direct/ls-read";
import {LsWrite} from "./packets/direct/ls-write";
import {GetCurrentProgramName} from "./packets/direct/get-current-program-name";
import {MessageRead} from "./packets/direct/message-read";
import {OpenRead} from "./packets/system/open-read";
import {OpenWrite} from "./packets/system/open-write";
import {Write} from "./packets/system/write";
import {Close} from "./packets/system/close";
import {Delete} from "./packets/system/delete";
import {FindFirst} from "./packets/system/find-first";
import {FindNext} from "./packets/system/find-next";
import {GetFirmwareVersion} from "./packets/system/get-firmware-version";
import {SetBrickName} from "./packets/system/set-brick-name";
import {GetDeviceInfo} from "./packets/system/get-device-info";
export enum ConnectionStatus {
  CONNECTED, CONNECTING, DISCONNECTED
}
export class ConnectionUpdate {
  readonly status: ConnectionStatus;
  readonly statusMessage: string;

  constructor(status: ConnectionStatus, statusMessage?: string) {
    this.status = status;
    this.statusMessage = statusMessage;
  }
}
export enum DirectCommand {
  START_PROGRAM = 0x00,
  STOP_PROGRAM = 0x01,
  PLAY_SOUND_FILE = 0x02,
  PLAY_TONE = 0x03,
  SET_OUTPUT_STATE = 0x04,
  SET_INPUT_MODE = 0x05,
  GET_OUTPUT_STATE = 0x06,
  GET_INPUT_VALUES = 0x07,
  RESET_INPUT_SCALED_VALUE = 0x08,
  MESSAGE_WRITE = 0x09,
  RESET_MOTOR_POSITION = 0x0A,
  GET_BATTERY_LEVEL = 0x0B,
  STOP_SOUND_PLAYBACK = 0x0C,
  KEEP_ALIVE = 0x0D,
  LS_GET_STATUS = 0x0E,
  LS_WRITE = 0x0F,
  LS_READ = 0x10,
  GET_CURRENT_PROGRAM_NAME = 0x11,
  MESSAGE_READ = 0x13
}

export enum TelegramType {
  DIRECT_COMMAND_RESPONSE = 0x00,
  SYSTEM_COMMAND_RESPONSE = 0x01,
  REPLY = 0x02,
  DIRECT_COMMAND_NO_RESPONSE = 0x80,
  SYSTEM_COMMAND_NO_RESPONSE = 0x81
}

export enum DirectCommandResponse {
  SUCCESS = 0x00,
  PENDING = 0x20,
  QUEUE_EMPTY = 0x40,
  REQUEST_FAILED = 0xBD,
  UNKNOWN_OP_CODE = 0xBE,
  INSANE_PACKET = 0xBF,
  OUT_OF_RANGE = 0xC0,
  COMMUNATION_ERROR = 0xDD,
  BUFFER_OUT_OF_MEMORY = 0xDE,
  INVALID_CHANNEL_CONNECTION = 0xDF,
  BUSY_CHANNEL_CONNECTION = 0xE0,
  NO_ACTIVE_PROGRAM = 0xEC,
  ILLEGAL_SIZE = 0xED,
  ILLEGAL_MAILBOX_QUEUE = 0xEE,
  INVALID_FIELD_OF_STRUCTUR = 0xEF,
  BAD_INPUT_OUTPUT = 0xF0,
  OUT_OF_MEMORY = 0xFB,
  BAD_ARGUMENTS = 0xFF
}

export enum SystemCommand {
  OPEN_READ = 0x80,
  OPEN_WRITE = 0x81,
  READ = 0x82,
  WRITE = 0x83,
  CLOSE = 0x84,
  DELETE = 0x85,
  FIND_FIRST = 0x86,
  FIND_NEXT = 0x87,
  GET_FIRMWARE_VERSION = 0x88,
  OPEN_WRITE_LINEAR = 0x89,
  OPEN_READ_LINEAR = 0x8A,
  OPEN_WRITE_DATA = 0x8B,
  OPEN_APPEND_DATA = 0x8C,
  SET_BRICK_NAME = 0x98,
  GET_DEVICE_INFO = 0x9B
}

export enum SystemCommandResponse {
  SUCCESS = 0x00,
  NO_MORE_HANDLES = 0x81,
  NO_SPACE = 0x82,
  NO_MORE_FILES = 0x83,
  END_OF_FILE_EXPECTED = 0x84,
  END_OF_FILE_REACHED = 0x85,
  NOT_LINEAR_FILE = 0x86,
  FILE_NOT_FOUND = 0x87,
  HANDLE_ALREADY_CLOSED = 0x88,
  NO_LINEAR_SPACE_AVAILABLE = 0x89,
  UNDEFINED_ERROR = 0x8A,
  FILE_IS_BUSY = 0x8B,
  NO_WRITE_BUFFERS = 0x8C,
  APPEND_NOT_POSSIBLE = 0x8D,
  FILE_IS_FULL = 0x8E,
  FILE_ALREADY_EXISTS = 0x8F,
  MODULE_NOT_FOUND = 0x90,
  MODULE_OUT_OF_BOUNDS = 0x91,
  ILLEGAL_FILE_NAME = 0x92,
  ILLEGAL_FILE_HANDLE = 0x93
}

export enum I2CSensorCommands {
  READ_VERSION = 0x00,
  READ_PRODUCT_ID = 0x08,
  READ_SENSOR_TYPE = 0x10,
}

export enum UltrasonicSensorRegisters {
  FACTORY_ZERO = 0x11,
  FACTORY_SCALE_FACTOR = 0x12,
  FACTORY_SCALE_DIVISOR = 0x13,
  MEASUREMENT_UNITS = 0x14,
  CONTIUNOUS_MEASUREMENT_INTERVAL = 0x40,
  COMMAND = 0x41,
  MEASUREMENT_BYTE_0 = 0x42,
  MEASUREMENT_BYTE_1 = 0x43,
  MEASUREMENT_BYTE_2 = 0x44,
  MEASUREMENT_BYTE_3 = 0x45,
  MEASUREMENT_BYTE_4 = 0x46,
  MEASUREMENT_BYTE_5 = 0x47,
  MEASUREMENT_BYTE_6 = 0x48,
  MEASUREMENT_BYTE_7 = 0x49,
  ACTUAL_ZERO = 0x4a,
  ACTUAL_SCALE_FACTOR = 0x4b,
  ACTUAL_SCALE_DIVISOR = 0x4c
}

export enum UltrasonicSensorCommands {
  OFF = 0x00,
  /**
   * In this mode the ultrasonic sensor will only make a new measurement every time the command byte is send to the sensor. The sensor will measure distances for up to 8 objects and save the
   distances within the “Read measurement byte 0 – 7”.
   * @type {number}
   */
  SINGLE_SHOT = 0x01,
  /**
   * This is the default mode, where the sensor continuously makes new measurement with the specified interval.
   * @type {number}
   */
  CONTINUOUS_MEASUREMENT = 0x02,
  /**
   * Within this mode the sensor will measure whether any other ultrasonic sensors are within the vicinity. With this information a program can evaluate when it is best to make a new
   measurement which will not conflict with other ultrasonic sensors.
   * @type {number}
   */
  EVENT_CAPTURE = 0x03,
  REQUEST_WARM_RESET = 0x04
}


export enum OutputMode {
  MOTOR_ON = 0x01,
  BRAKE = 0x02,
  REGULATED = 0x04
}

export enum OutputRegulationMode {
  IDLE = 0x00,
  MOTOR_SPEED = 0x01,
  MOTOR_SYNC = 0x02
}

export enum OutputRunState {
  IDLE = 0x00,
  RAMP_UP = 0x10,
  RUNNING = 0x20,
  RAMP_DOWN = 0x40
}

export enum SystemOutputPort {
  A = 0x00,
  B = 0x01,
  C = 0x02,
  ALL = 0xFF
}
export enum SingleOutputPort {
  A = "1",
  B = "2",
  C = "3"
}
export enum MultiOutputPort {
  A_B = "4",
  A_C = "5",
  B_C = "6",
  A_B_C = "7"
}
export type OutputPort = SingleOutputPort | MultiOutputPort;

export enum InputSensorType {
  NO_SENSOR = 0x00,
  TOUCH = 0x01,
  TEMPERATURE = 0x02,
  REFLECTION = 0x03,
  ANGLE = 0x04,
  LIGHT_ACTIVE = 0x05,
  LIGHT_INACTIVE = 0x06,
  SOUND_DB = 0x07,
  SOUND_DBA = 0x08,
  CUSTOM = 0x09,
  LOW_SPEED = 0x0A,
  LOW_SPEED_9V = 0x0B,
  NUMBER_OF_SENSOR_TYPES = 0x0C
}

export enum InputSensorMode {
  RAW = 0x00,
  BOOLEAN = 0x20,
  TRANSITION_COUNT = 0x40,
  PERIOD_COUNT = 0x60,
  PERIOD_COUNT_FULL_SCALE = 0x80,
  CELSIUS = 0xA0,
  FAHRENHEIT = 0xC0,
  ANGLE_STEPS = 0xE0
}

export enum NXTFileState {
  OPENING = "Opening File",
  WRITING = "Writing File",
  CLOSING = "Closing File",
  WRITTEN = "Written File",
  DELETED = "Deleted File",
  READ = "Read File",
  ERROR = "Error",
  FILE_EXISTS = "File already exists"
}

export enum NXTFileMode {
  READ, WRITE
}

export class NXTFile {
  public static PACKET_SIZE: number = 64;
  public uploadStatus$: EventEmitter<NXTFileState> = new EventEmitter<NXTFileState>();
  public handle: number;
  public response: DirectCommandResponse | SystemCommandResponse;
  public writtenBytes: number;
  public mode: NXTFileMode;
  public size: number;
  public autoStart: boolean;
  private state: NXTFileState = NXTFileState.OPENING;
  private data: number[] = [];

  constructor(public name: string) {
  }

  get status() {
    return this.state;
  }

  set status(status: NXTFileState) {
    this.state = status;
    this.uploadStatus$.emit(this.state);
  }

  get percentage(): number {
    return (this.writtenBytes / this.size * 100);
  }

  get formattedErrorMessage(): string {
    if (!this.hasError()) return "No Error";
    let msg: string = DirectCommandResponse[this.response] || SystemCommandResponse[this.response];
    msg = msg.replace(/_/g, " ");
    return msg.charAt(0).toLocaleUpperCase() + msg.substring(1);
  }

  nextChunk(): number[] {
    if (this.mode == NXTFileMode.READ) return;
    let chunkSize: number = Math.min(NXTFile.PACKET_SIZE, this.data.length);
    let ret: number[] = this.data.slice(0, chunkSize);
    this.data = this.data.slice(chunkSize, this.data.length);
    this.writtenBytes = this.size - this.data.length;
    return ret;
  }

  hasError() {
    return this.state == NXTFileState.ERROR || this.state == NXTFileState.FILE_EXISTS;
  }

  readData(number: number[]) {
    this.data.push(...number);
  }
}


export class NxtModel {
  public static MOTOR_PROGRAM: string = "SteeringControl.rxe";
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

  public static outputToSystemOutput(port: OutputPort): SystemOutputPort[] {
    let ports: SystemOutputPort[] = [];
    if (port == SingleOutputPort.A || port == MultiOutputPort.A_B || port == MultiOutputPort.A_C || port == MultiOutputPort.A_B_C) {
      ports.push(SystemOutputPort.A);
    }
    if (port == SingleOutputPort.B || port == MultiOutputPort.A_B || port == MultiOutputPort.B_C || port == MultiOutputPort.A_B_C) {
      ports.push(SystemOutputPort.B);
    }
    if (port == SingleOutputPort.C || port == MultiOutputPort.A_C || port == MultiOutputPort.B_C || port == MultiOutputPort.A_B_C) {
      ports.push(SystemOutputPort.C);
    }
    return ports;
  }
}
