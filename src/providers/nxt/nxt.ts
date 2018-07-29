import {Injectable, NgZone} from '@angular/core';
import {BluetoothProvider} from "../bluetooth/bluetooth";
import {File} from '@ionic-native/file';
import {AlertController, ModalController} from 'ionic-angular';
import {
  DirectCommand,
  NxtConstants,
  NXTFile,
  NXTFileState,
  OutputMode,
  OutputPort,
  OutputRegulationMode,
  OutputRunState,
  SystemCommand,
  SystemOutputPort,
  TelegramType
} from "./nxt-constants";
import {Packet} from "./packets/packet";
import {GetOutputState} from "./packets/direct/get-output-state";
import {StartProgram} from "./packets/direct/start-program";
import {Subject} from "rxjs";


/**
 * This provide handles communication with a NXT device, and provides helper methods for uploading files and NXT I/O.
 */
@Injectable()
export class NxtProvider {
  public packetEvent$: Subject<Packet> = new Subject<Packet>();
  private files: Map<number, NXTFile> = new Map();
  private nextFile: NXTFile;
  private currentProgram: string = null;
  private programToStart: string;
  private buffer: number[] = [];

  constructor(public bluetooth: BluetoothProvider, private file: File, public modalCtrl: ModalController, public alertCtrl: AlertController, private zone: NgZone) {
    //Clear state for the current device when it is disconnected.
    this.bluetooth.deviceDisconnect$.subscribe(() => {
      this.files.clear();
      this.nextFile = null;
      this.currentProgram = null;
    });
    //Start up a thread for reading packets
    setInterval(() => {
      let len: number = this.buffer[0] | this.buffer[1] << 8;
      if (this.buffer.length == 0 || this.buffer.length < len) {
        return;
      }
      this.buffer.splice(0, 2);
      this.readPacket();
    });
    //Listen to and handle responses from the NXT
    this.bluetooth.bluetoothSerial.subscribeRawData().subscribe(data => {
      this.buffer.push(...Array.from(new Uint8Array(data)));
    });
    // this.bluetooth.deviceConnect$.subscribe(() => {
    //   this.writePacket(true, StartProgram.createPacket(NxtConstants.MOTOR_PROGRAM));
    // });

  }

  readPacket() {
    let telegramType: number = this.buffer.shift();
    let messageType: number = this.buffer.shift();
    if (telegramType == TelegramType.REPLY) {
      //Look up this packet, and construct it from the available data.
      let packetCtor: new () => Packet = NxtConstants.COMMAND_MAP.get(messageType);
      let packet: Packet = new packetCtor();
      if (packet) {
        packet.readPacket(this.buffer);
        this.packetEvent$.next(packet);
      } else {
        console.log("Unknown packet id: " + messageType.toString(16));
      }
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
            // this.writeFile(this.programToStart, true);
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

  //
  // /**
  //  * Write a file to the NXT device
  //  * @param {string} fileName the file to write
  //  * @param {boolean} autoStart if true, the file will be started on the NXT if it is a program once uploaded.
  //  */
  // writeFile(fileName: string, autoStart: boolean) {
  //   this.file.readAsArrayBuffer(this.file.applicationDirectory, "www/assets/" + fileName).then(file => {
  //     this.nextFile = new NXTFile(fileName, new Uint8Array(file), file.byteLength, autoStart, this.zone);
  //     this.openFileHandle(this.nextFile, false);
  //     let uploadModal = this.modalCtrl.create(FileUploadPage, {file: this.nextFile});
  //     uploadModal.present();
  //   });
  //
  // }

  /**
   * Write a packet to the nxt. the length of the packet is automatically prepended to the packet.
   * @param {Uint8Array} data the packet to write.
   */
  writePacketOld(data: Uint8Array) {
    // this.bluetooth.write(NxtProvider.appendBefore(data, new Uint8Array([data.length, data.length << 8])));
  }

  writePacket(expectResponse: boolean, ...packets: Packet[]) {
    for (let packet of packets) {
      this.bluetooth.write(new Uint8Array(packet.writePacket(expectResponse)));
    }
  }

  // /**
  //  * Write a section of a file to the NXT device
  //  * @param {NXTFile} file the file to write a section for
  //  */
  // private writeSection(file: NXTFile) {
  //   if (file.size == file.writtenBytes) {
  //     this.closeFileHandle(file);
  //     return;
  //   }
  //   let header: Uint8Array = new Uint8Array([TelegramType.SYSTEM_COMMAND_RESPONSE, SystemCommand.WRITE, file.handle]);
  //   this.writePacketOld(NxtProvider.appendBefore(file.nextChunk(), header));
  // }


  /**
   * Open a file handle on the NXT device
   * @param {NXTFile} file the file to open a handle for
   * @param {boolean} read true to open a READ file handle, false to open a WRITE file handle
   */
  // private openFileHandle(file: NXTFile, read: boolean) {
  //   let data = [TelegramType.SYSTEM_COMMAND_RESPONSE, read ? SystemCommand.OPEN_READ : SystemCommand.OPEN_WRITE];
  //   data.push(...NxtProvider.stringToAscii(file.name));
  //   //We need to write 21 chars, so pad with null terminators.
  //   data.push(...new Array(22 - data.length));
  //   data.push(file.size, file.size >> 8, file.size >> 16, file.size >> 24);
  //   return this.writePacketOld(new Uint8Array(data));
  // }

  /**
   * Close a file handle on the NXT device
   * @param {NXTFile} file the file to close a handle for
   */
  private closeFileHandle(file: NXTFile) {
    this.files[file.handle].status = NXTFileState.CLOSING;
    this.writePacketOld(new Uint8Array([TelegramType.SYSTEM_COMMAND_RESPONSE, SystemCommand.CLOSE, file.handle]));
  }

  // /**
  //  * Start a program on the NXT device
  //  * @param {string} program the program to start
  //  */
  // startProgram(program: string) {
  //   this.programToStart = program;
  //   let data = [TelegramType.DIRECT_COMMAND_RESPONSE, DirectCommand.START_PROGRAM];
  //   //push a null terminator
  //   data.push(...NxtProvider.stringToAscii(program), 0);
  //   this.writePacketOld(new Uint8Array(data));
  // }

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
    return this.writePacketOld(new Uint8Array([
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
      // this.setOutputState(systemOutputPort, 0, 0, OutputRegulationMode.IDLE, 0, OutputRunState.IDLE, 0);
    }
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
    // let diff: number = Math.round(angle - this.currentRotation[motor]);
    // this.controlledMotorCommand(OutputPort.A, 100 * Math.sign(diff), Math.abs(diff), 0);
  }
}
