import {EventEmitter} from "@angular/core";


export class NxtConstants {
  public static MOTOR_PROGRAM: string = "MotorControl22.rxe";
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
  BOOT = 0x97,
  SET_BRICK_NAME = 0x98,
  GET_DEVICE_INFO = 0x9B,
  DIRECT_COMMAND = 0x00,
  DELETE_USER_FLASH = 0x01,
  SYSTEM_COMMAND = 0x01

}

export enum ExtendedSystemCommand {
  DELETE_USER_FLASH = 0xA0,
  POLL_COMMAND_LENGTH = 0xA1,
  POLL_COMMAND = 0xA2,
  BLUETOOTH_FACTORY_RESET = 0xA4
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

export enum OutputPort {
  A = "0",
  B = "1",
  C = "2",
  A_B = "3",
  A_C = "4",
  B_C = "5",
  A_B_C = "6"
}

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
  OPENING = "Opening File", WRITING = "Writing File", CLOSING = "Closing File", DONE = "Finished", ERROR = "Error", FILE_EXISTS = "File already exists"
}

export class NXTFile {
  public uploadStatus$: EventEmitter<NXTFileState> = new EventEmitter<NXTFileState>();
  public name: string;
  public size: number;
  public handle: number;
  public errorMessage: string;
  public autoStart: boolean;
  public writtenBytes: number;
  private data: Uint8Array;
  private state: NXTFileState = NXTFileState.OPENING;
  private static PACKET_SIZE: number = 64;

  constructor(name: string, data: Uint8Array, length: number, autoStart: boolean) {
    this.name = name;
    this.data = data;
    this.size = length;
    this.autoStart = autoStart;
  }

  set status(status: NXTFileState) {
    this.state = status;
    this.uploadStatus$.emit(this.state);
  }

  get status() {
    return this.state;
  }

  get percentage(): number {
    return (this.writtenBytes / this.size * 100);
  }

  get formattedErrorMessage(): string {
    if (!this.hasError()) return "No Error";
    let msg: string = this.errorMessage
      .replace(/_/g," ");
    return msg.charAt(0).toLocaleUpperCase()+msg.substring(1);
  }

  isFinished(): boolean {
    return this.data.length == 0;
  }

  nextChunk(): Uint8Array {
    let chunkSize: number = Math.min(NXTFile.PACKET_SIZE, this.data.length);
    let ret: Uint8Array = this.data.slice(0, chunkSize);
    this.data = this.data.slice(chunkSize, this.data.length);
    this.writtenBytes = this.size - this.data.length;
    return ret;
  }

  hasError() {
    return this.state == NXTFileState.ERROR || this.state == NXTFileState.FILE_EXISTS;
  }
}
