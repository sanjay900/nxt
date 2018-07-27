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
  OutputMode,
  OutputPort,
  OutputRegulationMode,
  OutputRunState,
  SystemCommand,
  SystemCommandResponse,
  SystemOutputPort,
  TelegramType
} from "./nxt-constants";


/**
 * This provide handles communication with a NXT device, and provides helper methods for uploading files and NXT I/O.
 */
@Injectable()
export class NxtProvider {

  private data: Uint8Array;
  private files: Map<number, NXTFile> = new Map();
  private nextFile: NXTFile;
  private currentProgram: string = null;
  private programToStart: string;
  private ports: Map<OutputPort, number> = new Map();
  private ready: Map<OutputPort, boolean> = new Map();
  public currentRotation: Map<OutputPort, number> = new Map();
  public lastRotation: Map<OutputPort, number> = new Map();
  constructor(public bluetooth: BluetoothProvider, private file: File, public modalCtrl: ModalController, public alertCtrl: AlertController, private zone: NgZone) {
    //Clear state for the current device when it is disconnected.
    this.bluetooth.deviceDisconnect$.subscribe(() => {
      this.files.clear();
      this.nextFile = null;
      this.currentRotation = new Map();
      this.lastRotation = new Map();
      this.currentProgram = null;
      this.ports = new Map();
    });
    setInterval(()=>{
      this.requestMotorInfo(OutputPort.A_B_C);
    },100);
    //Listen to and handle responses from the NXT
    this.bluetooth.bluetoothSerial.subscribeRawData().subscribe(data => {
      //Slice the length from the front of the packet
      this.readPacket(new Uint8Array(data).slice(2));
    });
    this.bluetooth.deviceConnect$.subscribe(() => {
      this.startProgram(NxtConstants.MOTOR_PROGRAM);
    });

  }

  readPacket(data: Uint8Array) {
    let telegramType: number = data[0];
    let messageType: number = data[1];
    let status: number = data[2];
    let remaining: Uint8Array;
    if (telegramType == TelegramType.REPLY) {
      if (NxtConstants.COMMAND_RESPONSE_LENGTH.has(messageType)) {
        let packetSize: number = NxtConstants.COMMAND_RESPONSE_LENGTH.get(messageType)+1;
        this.data = data.slice(0,packetSize);
        remaining = data.slice(packetSize);
      }

      if (messageType == DirectCommand.GET_OUTPUT_STATE) {
        let port: number = this.data[3];
        let portN: OutputPort = OutputPort.A;
        if (port == 1) portN = OutputPort.B;
        if (port == 2) portN = OutputPort.C;
        this.lastRotation[portN] = this.currentRotation[portN];
        this.currentRotation[portN] = NxtProvider.bytesToLong(this.data.slice(this.data.length - 4, this.data.length));
      }
      if (messageType == SystemCommand.READ) {
        let size: number = data[3] | data[4] << 8;
        //TODO: this
        let packetSize = 8+size;
        this.data = data.slice(0,packetSize);
        remaining = data.slice(packetSize);
      }
      if (messageType == DirectCommand.MESSAGE_READ) {
        if (status == DirectCommandResponse.SUCCESS) {
          let messageBox: number = this.data[3];
          let size: number = this.data[4];
          let response: string = NxtProvider.asciiToString(this.data.slice(5,5+size-1));
          if (messageBox == 1) {
            if (response.charAt(0) == "0") {
              this.ready[OutputPort.A] = response.charAt(1) == '1';
            }
            if (response.charAt(0) == "1") {
              this.ready[OutputPort.B] = response.charAt(1) == '1';
            }
            if (response.charAt(0) == "2") {
              this.ready[OutputPort.C] = response.charAt(1) == '1';
            }
          }
        }else if (status != DirectCommandResponse.SUCCESS) {
          console.log("Error Recieving: " + status.toString(16));
        }
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
        let handle: number = this.data[3];
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
    //If there is extra data remaining, we probably recieved two packets together, so parse the next packet
    if (remaining && remaining.length > 0) {
      this.readPacket(remaining);
    }
  }
  /**
   * Pop up a dialog asking the user if they would like to upload the motor control program to the NXT
   */
  private askUserToUploadFile() {
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

  /**
   * Append an array to another
   * @param {Uint8Array} array the original array
   * @param {Uint8Array} toAppend the array to place before the original array
   * @returns {Uint8Array} both arrays combined together as a new array
   */
  private static appendBefore(array: Uint8Array, toAppend: Uint8Array) {
    let ret: Uint8Array = new Uint8Array(array.length + toAppend.length);
    ret.set(toAppend, 0);
    ret.set(array, toAppend.length);
    return ret;
  }


  /**
   * Write a file to the NXT device
   * @param {string} fileName the file to write
   * @param {boolean} autoStart if true, the file will be started on the NXT if it is a program once uploaded.
   */
  writeFile(fileName: string, autoStart: boolean) {
    this.file.readAsArrayBuffer(this.file.applicationDirectory, "www/assets/" + fileName).then(file => {
      this.nextFile = new NXTFile(fileName, new Uint8Array(file), file.byteLength, autoStart, this.zone);
      this.openFileHandle(this.nextFile, false);
      let uploadModal = this.modalCtrl.create(FileUploadPage, {file: this.nextFile});
      uploadModal.present();
    });

  }

  /**
   * Write a packet to the nxt. the length of the packet is automatically prepended to the packet.
   * @param {Uint8Array} data the packet to write.
   */
  writePacket(data: Uint8Array) {
    this.bluetooth.write(NxtProvider.appendBefore(data, new Uint8Array([data.length, data.length << 8])));
  }

  /**
   * Write a section of a file to the NXT device
   * @param {NXTFile} file the file to write a section for
   */
  private writeSection(file: NXTFile) {
    if (file.size == file.writtenBytes) {
      this.closeFileHandle(file);
      return;
    }
    let header: Uint8Array = new Uint8Array([TelegramType.SYSTEM_COMMAND_RESPONSE, SystemCommand.WRITE, file.handle]);
    this.writePacket(NxtProvider.appendBefore(file.nextChunk(), header));
  }

  /**
   * Request a message from the NXT device
   * @param localMessageBox the local message box to write to (0-9)
   * @param remoteMessageBox the remote message box to read from (0-9)
   * @param removeMessage true to remove the message from the remote device, false to leave it in the queue
   */
  private requestMessage(localMessageBox: number, remoteMessageBox: number, removeMessage: boolean) {
    this.writePacket(new Uint8Array([
      TelegramType.DIRECT_COMMAND_RESPONSE, DirectCommand.MESSAGE_READ,
      remoteMessageBox, localMessageBox, removeMessage ? 1 : 0
    ]));
  }

  /**
   * Pad a number with leading zeros
   * @param number the number to pad
   * @param digits the number of digits to pad to
   * @returns {string} the padded number
   */
  private static padDigits(number, digits) {
    return Array(Math.max(digits - String(number).length + 1, 0)).join('0') + number;
  }

  private static convertPower(power: number): number {
    power = Math.round(power);
    if (power < 0) power = 100 + Math.abs(power);
    power = Math.max(power, 0);
    power = Math.min(power, 200);
    return power;
  }

  /**
   * Write a controlled motor command to the MotorControl program
   * @see http://www.mindstorms.rwth-aachen.de/trac/wiki/MotorControl
   * @param ports the ports to update
   * @param power the power to apply to the specified ports
   * @param tachoLimit the angle to rotate the specified motors by, or 0 if none is required
   * @param mode a bitmask combining different output modes together to apply to the specified ports
   */
  controlledMotorCommand(ports: OutputPort, power: number, tachoLimit: number, mode: number) {
    power = NxtProvider.convertPower(power);
    this.writeMessage("1" + ports.toString() + NxtProvider.padDigits(Math.round(power), 3) +
      NxtProvider.padDigits(tachoLimit, 6) + mode.toString(), 1)
  }


  /**
   * Write a classic motor command to the MotorControl program
   * @see http://www.mindstorms.rwth-aachen.de/trac/wiki/MotorControl
   * @param ports the ports to update
   * @param power the power to apply to the specified ports
   * @param tachoLimit the angle to rotate the specified motors by, or 0 if none is required
   * @param speedRegulation true to enable speed regulation, false to disable it
   */
  classicMotorCommand(ports: OutputPort, power: number, tachoLimit: number, speedRegulation: boolean) {
    power = NxtProvider.convertPower(power);
    if (this.ports[ports] == power) return;
    this.ports[ports] = power;
    this.writeMessage("4" + ports.toString() + NxtProvider.padDigits(power, 3) +
      NxtProvider.padDigits(tachoLimit, 6) + (speedRegulation ? "1" : "0"), 1)
  }


  /**
   * Reset the tachometer limit for a set of output ports.
   * @see http://www.mindstorms.rwth-aachen.de/trac/wiki/MotorControl
   * @param ports the ports to reset the tachometer limit for
   */
  resetTachoLimit(ports: OutputPort) {
    this.writeMessage("2" + ports.toString(), 1);
  }

  /**
   * Convert a string to an ascii array
   * @param {string} message the message to convert to ascii
   * @returns {number[]} the message encoded into a byte array
   */
  private static stringToAscii(message: string): number[] {
    let data = [];
    for (let i = 0; i < message.length; i++) {
      data.push(message.charCodeAt(i));
    }
    return data;
  }

  /**
   * Convert an ascii array into a string
   * @param {Uint8Array} message the message to convert to a string
   * @returns {number[]} the message decoded into a string
   */
  private static asciiToString(message: Uint8Array): string {
    let data: string = "";
    for (let i = 0; i < message.length; i++) {
      data += String.fromCharCode(message[i]);
    }
    return data;
  }

  /**
   * Write a message to a program's mailbox. Note that this will do nothing if the app has not started an application on
   * the NXT device.
   * @param {string} message the message to send, a null terminator is added by this function
   * @param {number} mailbox the mailbox to send the message to
   */
  writeMessage(message: string, mailbox: number) {
    if (this.currentProgram == null) return;
    message += '\0';
    this.writePacket(new Uint8Array([
      TelegramType.DIRECT_COMMAND_NO_RESPONSE, DirectCommand.MESSAGE_WRITE,
      mailbox, message.length, ...NxtProvider.stringToAscii(message)
    ]));
  }

  /**
   * Open a file handle on the NXT device
   * @param {NXTFile} file the file to open a handle for
   * @param {boolean} read true to open a READ file handle, false to open a WRITE file handle
   */
  private openFileHandle(file: NXTFile, read: boolean) {
    let data = [TelegramType.SYSTEM_COMMAND_RESPONSE, read ? SystemCommand.OPEN_READ : SystemCommand.OPEN_WRITE];
    data.push(...NxtProvider.stringToAscii(file.name));
    //We need to write 21 chars, so pad with null terminators.
    data.push(...new Array(22 - data.length));
    data.push(file.size, file.size >> 8, file.size >> 16, file.size >> 24);
    return this.writePacket(new Uint8Array(data));
  }

  /**
   * Close a file handle on the NXT device
   * @param {NXTFile} file the file to close a handle for
   */
  private closeFileHandle(file: NXTFile) {
    this.files[file.handle].status = NXTFileState.CLOSING;
    this.writePacket(new Uint8Array([TelegramType.SYSTEM_COMMAND_RESPONSE, SystemCommand.CLOSE, file.handle]));
  }

  /**
   * Start a program on the NXT device
   * @param {string} program the program to start
   */
  startProgram(program: string) {
    this.programToStart = program;
    let data = [TelegramType.DIRECT_COMMAND_RESPONSE, DirectCommand.START_PROGRAM];
    //push a null terminator
    data.push(...NxtProvider.stringToAscii(program), 0);
    this.writePacket(new Uint8Array(data));
  }

  /**
   * Send a SetOutputState packet to the NXT device
   * @param {SystemOutputPort} port the output port that should be modified
   * @param {number} power the power to set on the specified port
   * @param {OutputMode} mode a bitmask combing all OutputModes that you would like to set on the specified port
   * @param {OutputRegulationMode} regulationMode the power regulation mode you would like to set on the specified port
   * @param {number} turnRatio the turn ratio to set on the specified port
   * @param {OutputRunState} runState the run state to set on the specified port
   * @param {number} tachoLimit a number from 0-999999 that states how far the motor connected to the port should rotate.
   * Use 0 for no limit.
   */
  private setOutputState(port: SystemOutputPort, power: number, mode: number, regulationMode: OutputRegulationMode, turnRatio: number, runState: OutputRunState, tachoLimit: number) {
    return this.writePacket(new Uint8Array([
      TelegramType.DIRECT_COMMAND_NO_RESPONSE, DirectCommand.SET_OUTPUT_STATE,
      port, power, mode, regulationMode, turnRatio, runState, tachoLimit
    ]));
  }

  /**
   * Stop a set of motors
   * @param {OutputPort} motor the ports that should be told to stop rotating.
   */
  stopMotors(motor: OutputPort) {
    for (let systemOutputPort of NxtConstants.outputToSystemOutput(motor)) {
      this.setOutputState(systemOutputPort, 0, 0, OutputRegulationMode.IDLE, 0, OutputRunState.IDLE, 0);
    }
  }

  /**
   * Request that the nxt sends back the current status of a motor
   * @param {number} motor the motor to request status information about
   */
  requestMotorInfo(motor: OutputPort) {
    for (let systemOutputPort of NxtConstants.outputToSystemOutput(motor)) {
      this.writePacket(new Uint8Array([TelegramType.DIRECT_COMMAND_RESPONSE, DirectCommand.GET_OUTPUT_STATE, systemOutputPort]));
    }
  }

  private checkIfMotorReady(motor: OutputPort) {
    this.writeMessage("3"+motor, 1);
    this.requestMessage(1,0,true);
  }

  /**
   * Rotate a motor to a specific angle
   * @param {OutputPort} motor the motors that you would like to control
   * @param {number} angle the angle to rotate towards
   */
  rotateTowards(motor: OutputPort, angle: number) {
    //TODO: as a proof of concept, this works.
    //TODO: we need to think of a way to do this fast, with the ability to stop the motor.
    //TODO: Also, we have issues with driving forward and backwards.
    let diff: number = Math.round(angle - this.currentRotation[motor]);
    this.controlledMotorCommand(OutputPort.A, 100 * Math.sign(diff), Math.abs(diff), 0);
  }

  /**
   * Play a tone out of the NXT device
   * @param {number} hz the frequency of the tone
   * @param {number} duration the duration of the tone
   */
  playTone(hz: number, duration: number) {
    this.writePacket(new Uint8Array([
      TelegramType.DIRECT_COMMAND_NO_RESPONSE, DirectCommand.PLAY_TONE,
      hz, hz >> 0x08, duration, duration >> 0x08
    ]));
  }

  /**
   * Read a SLong from the NXT device, and convert it to a javascript number
   * @param {Uint8Array} data a 4 byte array containing an NXT SLong
   * @returns {number} the resulting number that this SLong represents.
   */
  private static bytesToLong(data: Uint8Array): number {
    return data[0] | (data[1] << 8) | (data[2] << 16) | (data[3] << 24);
  }
}
