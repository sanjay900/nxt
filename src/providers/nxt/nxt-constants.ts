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

export enum Command {
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

export enum SystemCommand {
  DELETE_USER_FLASH = 0xA0,
  POLL_COMMAND_LENGTH = 0xA1,
  POLL_COMMAND = 0xA2,
  BLUETOOTH_FACTORY_RESET = 0xA4
}

export enum CommandResponse {
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

export enum NXTFileState {
  OPENING = "Opening File", WRITING = "Writing File", CLOSING = "Closing File", DONE = "Finished", ERROR = "Error", FILE_EXISTS = "File Already Exists"
}

export class NXTFile {
  public uploadStatus$: EventEmitter<NXTFileState> = new EventEmitter<NXTFileState>();
  public name: string;
  public data: Uint8Array;
  public size: number;
  public handle: number;
  private state: NXTFileState = NXTFileState.OPENING;
  private static PACKET_SIZE: number = 64;

  constructor(name: string, data: Uint8Array, length: number) {
    this.name = name;
    this.data = data;
    this.size = length;
  }

  set status(status: NXTFileState) {
    this.state = status;
    this.uploadStatus$.emit(this.state);
  }

  get status() {
    return this.state;
  }

  get percentage(): number {
    return 100 - (this.data.length / this.size * 100);
  }

  isFinished(): boolean {
    return this.data.length == 0;
  }

  nextChunk(): Uint8Array {
    let chunkSize: number = Math.min(NXTFile.PACKET_SIZE, this.data.length);
    let ret: Uint8Array = this.data.slice(0, chunkSize);
    this.data = this.data.slice(chunkSize, this.data.length);
    return ret;
  }

  hasError() {
    return this.state == NXTFileState.ERROR || this.state == NXTFileState.FILE_EXISTS;
  }
}
