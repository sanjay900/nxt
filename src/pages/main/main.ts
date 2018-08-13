import {Component, ElementRef, ViewChild} from '@angular/core';
import {NxtPacketProvider} from "../../providers/nxt/nxt-packet";
import {MotorProvider} from "../../providers/motor/motor";
import nipplejs from 'nipplejs';

@Component({
  selector: 'page-main',
  templateUrl: 'main.html'
})
export class MainPage {
  private steering: number = 0;
  private throttle: number = 0;
  private auxiliary: number = 0;
  private watchId: number;
  private tiltActive: boolean;
  private joysticks: any[] = new Array(2);
  @ViewChild('leftJoystick') leftJoystick;
  @ViewChild('rightJoystick') rightJoystick;

  constructor(public nxt: NxtPacketProvider, public motor: MotorProvider) {
  }

  ionViewDidLoad() {
    this.createJoy(1, this.rightJoystick.nativeElement, this.setAux.bind(this), this.endAux.bind(this));
    this.setTilt(localStorage.getItem("tilt.active") == "true");
  }

  endAux() {
    this.motor.setAux(0);
    this.auxiliary = 0;
  }

  setAux(evt) {
    let pos = evt.target.instance.frontPosition;
    this.auxiliary = pos.y/(evt.target.instance.options.size/2)*100;
    this.motor.setAux(this.auxiliary);
  }

  endDrive() {
    this.motor.setSteering(0);
    this.motor.setThrottle(0);
    this.steering = this.throttle = 0;
  }

  setDrive(evt) {
    let pos = evt.target.instance.frontPosition;
    this.steering = pos.x/(evt.target.instance.options.size/2);
    this.throttle = pos.y/(evt.target.instance.options.size/2)*100;
    this.motor.setSteering(this.steering);
    this.motor.setThrottle(this.throttle);
  }

  createJoy(index: number, element: ElementRef, move: Function, end: Function) {
    let options = {
      zone: element,
      mode: 'static',
      position: {left: '50%', top: '75%'},
      color: 'black'
    };

    this.joysticks[index] = nipplejs.create(options)[0];
    this.joysticks[index].on("move", move);
    this.joysticks[index].on("end", end);
  }
  listenToTilt() {
    if (this.tiltActive) {
      (<any>navigator).fusion.setMode(() => {}, () => {}, {mode: 1});
      this.watchId = (<any>navigator).fusion.watchSensorFusion(this.sensorUpdate.bind(this), ()=>{}, {frequency: 100});
    }
  }
  ionViewDidEnter() {
    this.listenToTilt();
  }

  ionViewDidLeave() {
    if (this.watchId) {
      (<any>navigator).fusion.clearWatch(this.watchId);
    }
    this.motor.setThrottle(0);
  }

  sensorUpdate(data) {
    this.steering = data.eulerAngles.pitch;
    this.throttle = (data.eulerAngles.roll + Math.PI / 2) * 2;
    if (Math.abs(this.throttle) < 0.5) {
      this.motor.setThrottle(0);
    } else {
      if (this.throttle > 1) this.throttle = 1;
      if (this.throttle < -1) this.throttle = -1;
      this.throttle *= -100;
      this.motor.setThrottle(this.throttle);
    }
    this.motor.setSteering(this.steering);

  }

  setTilt(tilt: boolean) {
    this.tiltActive = tilt;
    localStorage.setItem("tilt.active", tilt + "");
    if (this.watchId) {
      (<any>navigator).fusion.clearWatch(this.watchId);
      this.watchId = null;
    }
    if (this.tiltActive) {
      this.listenToTilt();
      this.joysticks[0].destroy();
    } else {
      this.createJoy(0, this.leftJoystick.nativeElement, this.setDrive.bind(this), this.endDrive.bind(this));
    }
  }
}
