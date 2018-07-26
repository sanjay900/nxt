import {EventEmitter, Injectable} from '@angular/core';
import {BluetoothProvider} from "../bluetooth/bluetooth";
import {File} from '@ionic-native/file';
import {ModalController} from 'ionic-angular';
import {FileUploadPage} from "../../pages/file-upload/file-upload";
import {NxtConstants, NXTFile, NXTFileState} from "./nxt-constants";

@Injectable()
export class NxtProvider {

  public currentRotation: number = 0;
  public targetRotation: number = 0;
  private data: Uint8Array;
  private files: Map<number, NXTFile> = new Map();
  private nextFile: NXTFile;

  constructor(public bluetooth: BluetoothProvider, private file: File, public modalCtrl: ModalController) {
    this.bluetooth.bluetoothSerial.subscribeRawData().subscribe(data => {
      this.data = new Uint8Array(data);
      let messageClass: number = this.data[2];
      let messageType: number = this.data[3];
      let status: number = this.data[4];
      if (messageClass == 2) {
        if (messageType == 6) {
          //The last four bytes represent the motor's current tachometer value, as an offset from the last motor reset.
          this.currentRotation = NxtProvider.bytesToLong(this.data.slice(this.data.length - 4, this.data.length));
        }
        if (messageType == 0) {
          if (this.data[4] == 0xc0) {
            this.writeFile("MotorControl22.rxe")
          } else if (this.data[4] != 0) {
            console.log("Error Starting: " + this.data[4].toString(16));
          }
        }
        if (this.data[2] == 2 && this.data[3] == 0x09) {
          if (this.data[4] == 0) {
            console.log("Wrote message!");
          } else {
            console.log("Error Writing msg: " + this.data[4].toString(16));
          }
        }
        if (messageType >= 0x81 && messageType <= 0x84) {
          let handle: number = this.data[5];
          let file: NXTFile = this.files[handle] || this.nextFile;
          if (status == 0) {
            switch (messageType) {
              case 0x81:
                this.nextFile.handle = handle;
                this.files[this.nextFile.handle] = file;
                file.status = NXTFileState.WRITING;
              case 0x83:
                this.writeSection(file);
                break;
              case 0x84:
                file.status = NXTFileState.DONE;
                delete this.files[handle];
                this.startProgram(NxtConstants.MOTOR_PROGRAM);
                break;
            }
          } else if (status == 0x8f) {
            this.nextFile.status = NXTFileState.FILE_EXISTS;
          } else {
            this.nextFile.status = NXTFileState.ERROR;
          }
        }
      }
    });
    this.bluetooth.deviceConnect$.subscribe(() => {
      this.startProgram(NxtConstants.MOTOR_PROGRAM);
    });

  }

  writeSection(file: NXTFile) {
    if (file.isFinished()) {
      this.closeFileHandle(file);
      return;
    }
    let newData: Uint8Array = file.nextChunk();
    let totalSize = newData.length + 5;
    let writeSize = newData.length + 3;
    let toWrite: Uint8Array = new Uint8Array(totalSize);
    toWrite.set([writeSize, writeSize << 8, 0x01, 0x83, file.handle]);
    toWrite.set(newData, 5);
    this.bluetooth.write(toWrite);
  }

  async writeFile(prog: string) {
    this.file.readAsArrayBuffer(this.file.applicationDirectory, "www/assets/" + prog).then(file => {
      this.nextFile = new NXTFile(prog, new Uint8Array(file), file.byteLength);
      this.openFileHandle(this.nextFile);
      let uploadModal = this.modalCtrl.create(FileUploadPage, { file: this.nextFile });
      uploadModal.present();
    });

  }

  /**
   * Write motor commands formatted for the below specs
   * http://www.mindstorms.rwth-aachen.de/trac/wiki/MotorControl
   * @param {string} command the command to write
   * @returns {Promise<any>} a promise that is resolved when the bluetooth plugin has written the data
   */
  writeMotorCommand(command: string) {
    command += "\0";
    let arr = [command.length + 4, 0x00, 0x00, 0x09, 0x01, command.length];
    for (let i = 0; i < command.length; i++) {
      arr.push(command.charCodeAt(i));
    }
    // return this.bluetooth.write(new Uint8Array(arr));
  }
  openFileHandle(file: NXTFile) {
    let arr = [26, 0, 0x01, 0x81];
    for (let i = 0; i < file.name.length; i++) {
      arr.push(file.name.charCodeAt(i));
    }
    let data:Uint8Array = new Uint8Array(28);
    data.set(arr,0);
    data.set([file.size, file.size >> 8, file.size >> 16, file.size >> 24], 24);
    return this.bluetooth.write(data);
  }

  closeFileHandle(file: NXTFile) {
    this.files[file.handle].status = NXTFileState.CLOSING;
    return this.bluetooth.write(new Uint8Array([0x03, 0x00, 0x01, 0x84, file.handle]));
  }

  startProgram(prog: String) {
    prog += "\0";
    let arr = [prog.length + 2, 0, 0x00, 0x00];
    for (let i = 0; i < prog.length; i++) {
      arr.push(prog.charCodeAt(i));
    }
    this.bluetooth.write(new Uint8Array(arr));
  }


  stopMotor(motor: number) {
    return this.bluetooth.write(new Uint8Array([0xC, 0x00, 0x80, 0x04, motor, 0, 0x00, 0x01, 0, 0x20, 0, 0, 0, 0]));
  }

  rotateBy(motor: number, angle: number) {

  }

  requestMotorInfo(motor: number) {
    this.bluetooth.write(new Uint8Array([0x03, 0x00, 0x00, 0x06, motor]));
  }

  rotateTowards(motor: number, angle: number) {
    this.targetRotation = angle;
    console.log("req..");
    // this.requestMotorInfo(0);
  }

  resetCounter(motor: number, relative: boolean) {
    return this.bluetooth.write(new Uint8Array([0x04, 0x00, 0x00, 0x0A, motor, Number(relative)]));
  }

  playTone(hz: number, duration: number) {
    return this.bluetooth.write(new Uint8Array([0x06, 0x00, 0x00, 0x03, hz & 0xff, hz >> 0x08, duration & 0xff, duration >> 0x08]));
  }

  private static bytesToLong(data: Uint8Array) : number {
    return data[0] | (data[1] << 8) | (data[2] << 16) | (data[3] << 24);
  }
}
