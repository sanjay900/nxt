import {Injectable} from '@angular/core';
import {BluetoothProvider} from "../bluetooth/bluetooth";
import {File} from '@ionic-native/file';
import {App, ModalController} from 'ionic-angular';
import {FileUploadPage} from "../../pages/file-upload/file-upload";

type BigInt = number
declare const BigInt: typeof Number;

@Injectable()
export class NxtProvider {

  //The max number returned by the nxt brick for motor power is four bytes, but the first byte has a mx of 254.
  private static MAX_MOTOR: BigInt = NxtProvider.bytesToLong(new Uint8Array([254, 255, 255, 255]));
  private static MAX_MOTOR_HALF: BigInt = NxtProvider.MAX_MOTOR / BigInt(2);
  private static MOTOR_PROGRAM: string = "MotorControl22.rxe";
  public currentRotation: number = 0;
  public targetRotation: number = 0;
  private data: Uint8Array;
  private files: Map<number, NXTFile> = new Map();
  private nextFile: NXTFile;

  constructor(public bluetooth: BluetoothProvider, private file: File, public modalCtrl: ModalController) {
    this.bluetooth.bluetoothSerial.subscribeRawData().subscribe(data => {
      this.data = new Uint8Array(data);
      if (this.data[2] == 2 && this.data[3] == 6) {
        //The last four bytes represent the motor's current tachometer value, as an offset from the last motor reset.
        let rotation: BigInt = NxtProvider.bytesToLong(this.data.slice(this.data.length - 4, this.data.length));

        if (rotation > NxtProvider.MAX_MOTOR_HALF) {
          rotation -= NxtProvider.MAX_MOTOR;
        }
        this.currentRotation = Number(rotation);
      }
      if (this.data[2] == 2 && this.data[3] == 0) {
        if (this.data[4] == 0xc0) {
          this.writeFile("MotorControl22.rxe")
        } else if (this.data[4] != 0) {
          console.log("Error Starting: " + this.data[4].toString(16));
        }
        this.writeMotorCommand("120990010002")
      }
      if (this.data[2] == 2 && this.data[3] == 0x81) {
        if (this.data[4] == 0) {
          this.nextFile.handle = this.data[5];
          this.files[this.nextFile.handle] = this.nextFile;
          this.writeSection(this.files[this.data[5]]);
        } else {
          console.log("Error Opening: " + this.data[4].toString(16));
        }
      }
      if (this.data[2] == 2 && this.data[3] == 0x83) {
        if (this.data[4] == 0) {
          this.writeSection(this.files[this.data[5]]);
        } else {
          console.log("Error Writing: " + this.data[4].toString(16));
        }
      }
      if (this.data[2] == 2 && this.data[3] == 0x09) {
        if (this.data[4] == 0) {
          console.log("Wrote message!");
        } else {
          console.log("Error Writing msg: " + this.data[4].toString(16));
        }
      }
      if (this.data[2] == 2 && this.data[3] == 0x84) {
        if (this.data[4] == 0) {
          console.log("Wrote file!");
        } else {
          console.log("Error Writing: " + this.data[4].toString(16));
        }
      }

    });
    this.bluetooth.deviceConnect$.subscribe(() => {
      this.startProgram(NxtProvider.MOTOR_PROGRAM);
    });

  }

  writeSection(file: NXTFile) {
    if (file.isFinished) {
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

  static bytesToLong(data: Uint8Array): BigInt {
    return BigInt(data[0]) |
      BigInt(data[1]) << BigInt(8) |
      BigInt(data[2]) << BigInt(16) |
      BigInt(data[3]) << BigInt(24);
  }


  stopMotor(motor: number) {
    return this.bluetooth.write(new Uint8Array([0xC, 0x00, 0x80, 0x04, motor, 0, 0x00, 0x01, 0, 0x20, 0, 0, 0, 0]));
  }

  rotateBy(motor: number, angle: number) {

  }

  requestMotorInfo(motor: number) {
    // this.bluetooth.write(new Uint8Array([0x03, 0x00, 0x00, 0x06, motor]));
  }

  rotateTowards(motor: number, angle: number) {
    this.targetRotation = angle;
    this.requestMotorInfo(0);
  }

  resetCounter(motor: number, relative: boolean) {
    return this.bluetooth.write(new Uint8Array([0x04, 0x00, 0x00, 0x0A, motor, Number(relative)]));
  }

  playTone(hz: number, duration: number) {
    return this.bluetooth.write(new Uint8Array([0x06, 0x00, 0x00, 0x03, hz & 0xff, hz >> 0x08, duration & 0xff, duration >> 0x08]));
  }
}

export class NXTFile {
  public name: string;
  public data: Uint8Array;
  public size: number;
  public handle: number;
  private static PACKET_SIZE: number = 64;

  constructor(name: string, data: Uint8Array, length: number) {
    this.name = name;
    this.data = data;
    this.size = length;
  }

  get percentage(): number {
    return 100-(this.data.length/this.size*100);
  }

  get isFinished(): boolean {
    return this.data.length == 0;
  }

  nextChunk(): Uint8Array {
    let chunkSize: number = Math.min(NXTFile.PACKET_SIZE, this.data.length);
    let ret: Uint8Array  = this.data.slice(0, chunkSize);
    this.data = this.data.slice(chunkSize, this.data.length);
    return ret;
  }
}
