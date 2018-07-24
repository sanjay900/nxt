import { Component } from '@angular/core';
import { NavController, Platform } from 'ionic-angular';
import {BluetoothProvider} from "../../providers/bluetooth/bluetooth";
import * as Controller from "node-pid-controller";
type BigInt = number
declare const BigInt: typeof Number
@Component({
  selector: 'page-main',
  templateUrl: 'main.html'
})
export class MainPage {
  private static LONG: BigInt = MainPage.bytesToLong(new Uint8Array([254,255,255,255]));
  private static HALF: BigInt = MainPage.LONG/BigInt(2);
  private steering: number;
  private throttle: number;
  private currentRotation: BigInt;
  private nextRotation: number;
  //https://github.com/philmod/node-pid-controller
  private pid: Controller = new Controller(0.25, 0.01, 0.01);
  private data: Uint8Array;
  constructor(public navCtrl: NavController, public bluetooth: BluetoothProvider, public plt: Platform) {
    this.plt.ready().then((readySource) => {
      console.log('Platform ready from', readySource);
      (<any>navigator).fusion.setMode(()=>{},()=>{},{mode:1});
      let options = {
        frequency: 100
      }; // Update every 3 seconds
      (<any>navigator).fusion.watchSensorFusion(data=>this.sensorUpdate(data),console.log, options);
    });
    this.bluetooth.bluetoothSerial.subscribeRawData().subscribe(data=>{
      this.data = new Uint8Array(data);
      this.currentRotation = MainPage.bytesToLong(this.data.slice(this.data.length-4,this.data.length));

      if (this.currentRotation > MainPage.HALF) {
        this.currentRotation = this.currentRotation - MainPage.LONG;
      }
      this.nextRotation = this.pid.update(this.currentRotation);
    })
  }
  static bytesToLong(data:Uint8Array): BigInt{
    return BigInt(data[0]) |
      BigInt(data[1]) << BigInt(8) |
      BigInt(data[2]) << BigInt(16) |
      BigInt(data[3]) << BigInt(32);
  }
  sensorUpdate(data) {
    this.steering = data.eulerAngles.pitch;
    // this.steering *= 180/Math.PI;
    this.throttle = (data.eulerAngles.roll + Math.PI/2)*2;
    if (Math.abs(this.throttle) < 0.5) {
      this.stopMotor(1);
      this.stopMotor(2);
    } else {
      if (this.throttle > 1) this.throttle = 1;
      if (this.throttle < -1) this.throttle = -1;
      this.throttle *= -100;
      // this.setMotorSpeed(1,this.throttle, false);
      // this.setMotorSpeed(2,this.throttle, false);

    }
    //Now that we can read the current location, and know what we want to set it to, can we use pid to make this work?
    this.pid.setTarget(this.steering);
    this.bluetooth.write(new Uint8Array([0x03, 0x00, 0x00, 0x06,0x01]));
    this.setMotorSpeed(1, this.nextRotation, false);

  }
  stopMotor(motor: number) {
    this.bluetooth.write(new Uint8Array([0xC, 0x00, 0x80, 0x04, motor, 0, 0x01, 0x00, 100, 0x20, 0x0, 0x0, 0x0, 0x0]));
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

}
