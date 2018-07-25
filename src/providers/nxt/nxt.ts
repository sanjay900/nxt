import {Injectable} from '@angular/core';
import * as Controller from "node-pid-controller";
import {BluetoothProvider} from "../bluetooth/bluetooth";

type BigInt = number
declare const BigInt: typeof Number;
@Injectable()
export class NxtProvider {
  //The max number returned by the nxt brick for motor power is four bytes, but the first byte has a mx of 254.
  private static MAX_MOTOR: BigInt = NxtProvider.bytesToLong(new Uint8Array([254,255,255,255]));
  private static MAX_MOTOR_HALF: BigInt = NxtProvider.MAX_MOTOR/BigInt(2);
  public currentRotation: number;
  public targetRotation: number;
  private data: Uint8Array;
  constructor(public bluetooth: BluetoothProvider) {
    this.bluetooth.bluetoothSerial.subscribeRawData().subscribe(data=>{
      this.data = new Uint8Array(data);
      //The last four bytes represent the motor's current tachometer value, as an offset from the last motor reset.
      let rotation:BigInt = NxtProvider.bytesToLong(this.data.slice(this.data.length-4,this.data.length));

      if (rotation > NxtProvider.MAX_MOTOR_HALF) {
        rotation -= NxtProvider.MAX_MOTOR;
      }
      this.currentRotation = Number(rotation);
      if (Math.abs(this.currentRotation - this.targetRotation) < 20) {
        this.stopMotor(0);
      } else if (this.currentRotation < this.targetRotation) {
        this.setMotorSpeed(0, 50, false);
        this.bluetooth.write(new Uint8Array([0x03, 0x00, 0x00, 0x06, 0]));
      } else {
        this.setMotorSpeed(0, -50, false);
        this.bluetooth.write(new Uint8Array([0x03, 0x00, 0x00, 0x06, 0]));
      }
    })
  }

  static bytesToLong(data:Uint8Array): BigInt{
    return BigInt(data[0]) |
      BigInt(data[1]) << BigInt(8) |
      BigInt(data[2]) << BigInt(16) |
      BigInt(data[3]) << BigInt(32);
  }


  stopMotor(motor: number) {
    this.bluetooth.write(new Uint8Array([0xC, 0x00, 0x80, 0x04, motor, 0, 0x01 | 0x02 | 0x04, 0x01, 0, 0x20, 0, 0, 0, 0]));
  }
  setMotorSpeed(motor: number, speed:number, sync: boolean = false) {
    this.bluetooth.write(new Uint8Array([0xC, 0x00, 0x80, 0x04, motor, speed, 0x01, sync?0x04:0x0, 100, 0x20, 0x0, 0x0, 0x0, 0x0]));
  }
  setMotorAngle(motor: number, angle:number) {
    angle = Math.floor(angle);
    let dir:number = Math.sign(angle);
    angle = Math.abs(angle);
    this.bluetooth.write(new Uint8Array([0xC, 0x00, 0x80, 0x04, motor, 100*dir,0x01,0x01,100,0x20,angle, angle >> 8, angle >> 16, angle >> 24]));
  }

  rotateTowards(motor: number, angle: number) {
    this.targetRotation = angle;
    this.bluetooth.write(new Uint8Array([0x03, 0x00, 0x00, 0x06, motor]));
  }
}
