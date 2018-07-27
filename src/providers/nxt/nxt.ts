import {Injectable, NgZone} from '@angular/core';
import {BluetoothProvider} from "../bluetooth/bluetooth";
import {File} from '@ionic-native/file';
import {AlertController, ModalController} from 'ionic-angular';
import {FileUploadPage} from "../../pages/file-upload/file-upload";
import {
  DirectCommand,
  DirectCommandResponse,
  NxtConstants,
  NXTFile,
  NXTFileState,
  OutputPort,
  OutputRegulationMode,
  OutputRunState,
  SystemCommand,
  SystemCommandResponse,
  TelegramType
} from "./nxt-constants";

@Injectable()
export class NxtProvider {

  public currentRotation: number = 0;
  public targetRotation: number = 0;
  private data: Uint8Array;
  private files: Map<number, NXTFile> = new Map();
  private nextFile: NXTFile;
  private currentProgram: string = null;
  private programToStart: string;

  constructor(public bluetooth: BluetoothProvider, private file: File, public modalCtrl: ModalController, public alertCtrl: AlertController, private zone: NgZone) {
    this.bluetooth.deviceDisconnect$.subscribe(() => {
      this.files.clear();
      this.nextFile = null;
      this.currentRotation = 0;
      this.targetRotation = 0;
      this.currentProgram = null;
    });
    this.bluetooth.bluetoothSerial.subscribeRawData().subscribe(data => {
      this.data = new Uint8Array(data);
      let telegramType: number = this.data[2];
      let messageType: number = this.data[3];
      let status: number = this.data[4];
      if (telegramType == TelegramType.REPLY) {
        if (messageType == DirectCommand.GET_OUTPUT_STATE) {
          //The last four bytes represent the motor's current tachometer value, as an offset from the last motor reset.
          this.currentRotation = NxtProvider.bytesToLong(this.data.slice(this.data.length - 4, this.data.length));
        }
        if (messageType == DirectCommand.START_PROGRAM) {
          //Out of range is sent back if the file was not found on the brick.
          if (status == DirectCommandResponse.SUCCESS) {
            this.currentProgram = this.programToStart;
          } else if (status == DirectCommandResponse.OUT_OF_RANGE) {
            //File not found, so lets upload it.
            this.askUserToUploadFile();
          } else if (status != DirectCommandResponse.SUCCESS) {
            console.log("Error Starting: " + status.toString(16));
          }
        }
        if (messageType == DirectCommand.MESSAGE_WRITE) {
          if (status != 0) {
            console.log("Error Writing msg: " + status.toString(16));
          }
        }
        if (messageType >= SystemCommand.OPEN_WRITE && messageType <= SystemCommand.CLOSE) {
          let handle: number = this.data[5];
          let file: NXTFile = this.files[handle] || this.nextFile;
          file.errorMessage = SystemCommandResponse[status];
          if (status == 0) {
            switch (messageType) {
              case SystemCommand.OPEN_WRITE:
                this.nextFile.handle = handle;
                this.files[this.nextFile.handle] = file;
                file.status = NXTFileState.WRITING;
              case SystemCommand.WRITE:
                this.writeSection(file);
                break;
              case SystemCommand.CLOSE:
                file.status = NXTFileState.DONE;
                delete this.files[handle];
                if (file.autoStart) {
                  this.startProgram(NxtConstants.MOTOR_PROGRAM);
                }
                break;
            }
          } else if (status == SystemCommandResponse.FILE_ALREADY_EXISTS) {
            file.status = NXTFileState.FILE_EXISTS;
          } else {
            file.status = NXTFileState.ERROR;
          }
        }
      }
    });
    this.bluetooth.deviceConnect$.subscribe(() => {
      this.startProgram(NxtConstants.MOTOR_PROGRAM);
    });

  }

  askUserToUploadFile() {
    let alert = this.alertCtrl.create({
      title: 'Motor Control Program Missing',
      message: `The program for controlling NXT motors is missing on your NXT Device.<br/>
                Would you like to upload the NXT motor control program?<br/>
                Note that without this program, motor control will not work.`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Upload',
          handler: () => {
            this.writeFile(this.programToStart, true);
          }
        }
      ]
    });
    alert.present();
  }

  static appendBefore(array: Uint8Array, toAppend: Uint8Array) {
    let ret: Uint8Array = new Uint8Array(array.length + toAppend.length);
    ret.set(toAppend, 0);
    ret.set(array, toAppend.length);
    return ret;
  }

  writePacket(data: Uint8Array) {
    this.bluetooth.write(NxtProvider.appendBefore(data, new Uint8Array([data.length, data.length << 8])));
  }

  writeSection(file: NXTFile) {
    if (file.isFinished()) {
      this.closeFileHandle(file);
      return;
    }
    let header: Uint8Array = new Uint8Array([TelegramType.SYSTEM_COMMAND_RESPONSE, SystemCommand.WRITE, file.handle]);
    this.writePacket(NxtProvider.appendBefore(file.nextChunk(), header));
  }

  writeFile(prog: string, autoStart: boolean) {
    this.file.readAsArrayBuffer(this.file.applicationDirectory, "www/assets/" + prog).then(file => {
      this.nextFile = new NXTFile(prog, new Uint8Array(file), file.byteLength, autoStart, this.zone);
      this.openFileHandle(this.nextFile, false);
      let uploadModal = this.modalCtrl.create(FileUploadPage, {file: this.nextFile});
      uploadModal.present();
    });

  }

  static padDigits(number, digits) {
    return Array(Math.max(digits - String(number).length + 1, 0)).join('0') + number;
  }


  /**
   * Write motor commands formatted for the below specs
   * http://www.mindstorms.rwth-aachen.de/trac/wiki/MotorControl
   * @returns {Promise<any>} a promise that is resolved when the bluetooth plugin has written the data
   * @param port
   * @param power
   * @param tachoLimit
   * @param mode
   */
  controlledMotorCommand(port: OutputPort, power: number, tachoLimit: number, mode: number) {
    this.writeMessage("1" + port.toString() + NxtProvider.padDigits(power, 3) +
      NxtProvider.padDigits(tachoLimit, 6) + mode.toString(), 1)
  }


  /**
   * Write motor commands formatted for the below specs
   * http://www.mindstorms.rwth-aachen.de/trac/wiki/MotorControl
   * @returns {Promise<any>} a promise that is resolved when the bluetooth plugin has written the data
   * @param port
   * @param power
   * @param tachoLimit
   * @param speedRegulation
   */
  classicMotorCommand(port: OutputPort, power: number, tachoLimit: number, speedRegulation: boolean) {
    this.writeMessage("4" + port.toString() + NxtProvider.padDigits(power, 3) +
      NxtProvider.padDigits(tachoLimit, 6) + (speedRegulation ? "1" : "0"), 1)
  }


  /**
   * Write motor commands formatted for the below specs
   * http://www.mindstorms.rwth-aachen.de/trac/wiki/MotorControl
   * @returns {Promise<any>} a promise that is resolved when the bluetooth plugin has written the data
   * @param port
   */
  resetTachoLimit(port: OutputPort) {
    this.writeMessage("2" + port.toString(), 1);
  }

  static stringToAscii(message: string): number[] {
    let data = [];
    for (let i = 0; i < message.length; i++) {
      data.push(message.charCodeAt(i));
    }
    return data;
  }

  writeMessage(message: string, mailbox: number) {
    if (this.currentProgram == null) return;
    message += '\0';
    this.writePacket(new Uint8Array([
      TelegramType.DIRECT_COMMAND_NO_RESPONSE, DirectCommand.MESSAGE_WRITE,
      mailbox, message.length, ...NxtProvider.stringToAscii(message)
    ]));
  }

  openFileHandle(file: NXTFile, read: boolean) {
    let data = [TelegramType.SYSTEM_COMMAND_RESPONSE, read ? SystemCommand.OPEN_READ : SystemCommand.OPEN_WRITE];
    data.push(...NxtProvider.stringToAscii(file.name));
    //We need to write 21 chars, so pad with null terminators.
    data.push(...new Array(22 - data.length));
    console.log(data.length);
    console.log(data);
    data.push(file.size, file.size >> 8, file.size >> 16, file.size >> 24);
    return this.writePacket(new Uint8Array(data));
  }

  closeFileHandle(file: NXTFile) {
    this.files[file.handle].status = NXTFileState.CLOSING;
    this.writePacket(new Uint8Array([TelegramType.SYSTEM_COMMAND_RESPONSE, SystemCommand.CLOSE, file.handle]));
  }

  startProgram(prog: string) {
    this.programToStart = prog;
    let data = [TelegramType.DIRECT_COMMAND_RESPONSE, DirectCommand.START_PROGRAM];
    //push a null terminator
    data.push(...NxtProvider.stringToAscii(prog), 0);
    this.writePacket(new Uint8Array(data));
  }

  setOutputState(motor: number, power: number, mode: number, regulationMode: OutputRegulationMode, turnRatio: number, runState: OutputRunState, tachoLimit: number) {
    return this.writePacket(new Uint8Array([
      TelegramType.DIRECT_COMMAND_NO_RESPONSE, DirectCommand.SET_OUTPUT_STATE,
      motor, power, mode, regulationMode, turnRatio, runState, tachoLimit
    ]));
  }

  stopMotor(motor: number) {
    this.setOutputState(motor, 0, 0, OutputRegulationMode.IDLE, 0, OutputRunState.IDLE, 0);
  }

  requestMotorInfo(motor: number) {
    this.writePacket(new Uint8Array([TelegramType.DIRECT_COMMAND_RESPONSE, DirectCommand.GET_OUTPUT_STATE, motor]));
  }

  rotateTowards(motor: OutputPort, angle: number) {
    this.targetRotation = angle;
  }

  playTone(hz: number, duration: number) {
    this.writePacket(new Uint8Array([
      TelegramType.DIRECT_COMMAND_NO_RESPONSE, DirectCommand.PLAY_TONE,
      hz & 0xff, hz >> 0x08, duration & 0xff, duration >> 0x08
    ]));
  }

  private static bytesToLong(data: Uint8Array): number {
    return data[0] | (data[1] << 8) | (data[2] << 16) | (data[3] << 24);
  }
}
