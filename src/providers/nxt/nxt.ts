import {Injectable} from '@angular/core';
import {BluetoothProvider} from "../bluetooth/bluetooth";
import {File} from '@ionic-native/file';

type BigInt = number
declare const BigInt: typeof Number;

@Injectable()
export class NxtProvider {

  //The max number returned by the nxt brick for motor power is four bytes, but the first byte has a mx of 254.
  private static MAX_MOTOR: BigInt = NxtProvider.bytesToLong(new Uint8Array([254, 255, 255, 255]));
  private static MAX_MOTOR_HALF: BigInt = NxtProvider.MAX_MOTOR / BigInt(2);
  public currentRotation: number = 0;
  public lastRotation: number = 0;
  public targetRotation: number = 0;
  public delta: number = 0;
  private trackRotation: boolean;
  public test: number;
  private data: Uint8Array;
  private rxe: Uint8Array;
  private handle: number;

  constructor(public bluetooth: BluetoothProvider, private file: File) {
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
          this.handle = this.data[5];
          this.writeSection();
        } else {
          console.log("Error Opening: " + this.data[4].toString(16));
        }
      }
      if (this.data[2] == 2 && this.data[3] == 0x83) {
        if (this.data[4] == 0) {
          this.writeSection();
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
      this.startProgram("MotorControl22.rxe");
    });

  }

  writeSection() {
    //TODO: show some sort of progress dialog.
    console.log("Remaining Bytes: " + this.rxe.length);
    let packetSize = 64;
    if (this.rxe.length == 0) {
      this.closeFileHandle(this.handle);
      return;
    }
    let size: number = Math.min(packetSize, this.rxe.length);
    let totalSize = size + 5;
    let writeSize = size + 3;
    let toWrite: Uint8Array = new Uint8Array(totalSize);
    toWrite.set([writeSize, writeSize << 8, 0x01, 0x83, this.handle]);
    toWrite.set(this.rxe.slice(0, size), 5);
    this.rxe = this.rxe.slice(size, this.rxe.length);
    this.bluetooth.write(toWrite);
  }

  async writeFile(prog: string) {
    this.file.readAsArrayBuffer(this.file.applicationDirectory, "www/assets/" + prog).then(file => {
      this.rxe = new Uint8Array(file);
      this.openFileHandle(prog, this.rxe.length);
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
    return this.bluetooth.write(new Uint8Array(arr));
  }
  openFileHandle(prog: string, size: number) {
    let arr = [26, 0, 0x01, 0x81];
    for (let i = 0; i < prog.length; i++) {
      arr.push(prog.charCodeAt(i));
    }
    let data:Uint8Array = new Uint8Array(28);
    data.set(arr,0);
    data.set([size, size >> 8, size >> 16, size >> 24], 24);
    return this.bluetooth.write(data);
  }

  closeFileHandle(handle: number) {
    return this.bluetooth.write(new Uint8Array([0x03, 0x00, 0x01, 0x84, handle]));
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
