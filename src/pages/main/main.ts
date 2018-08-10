import {Component, ViewChild} from '@angular/core';
import {NxtProvider} from "../../providers/nxt/nxt";
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
  private leftJoy: any;
  private rightJoy: any;
  @ViewChild('leftJoystick') leftJoystick;
  @ViewChild('rightJoystick') rightJoystick;

  constructor(public nxt: NxtProvider, public motor: MotorProvider) {
  }

  ionViewDidLoad() {
    let options = {
      zone: this.rightJoystick.nativeElement,
      mode: 'static',
      position: {left: '50%', top: '75%'},
      color: 'black'
    };

    this.rightJoy = nipplejs.create(options)[0];
    this.rightJoy.on("move", evt=>{
      let pos = evt.target.instance.frontPosition;
      this.auxiliary = pos.y/(evt.target.instance.options.size/2)*100;
      this.motor.setAux(this.auxiliary);
    });
    this.rightJoy.on("end", ()=>{
      this.motor.setAux(0);
      this.auxiliary = 0;
    });

    this.setTilt(localStorage.getItem("tile.active") == "true");
  }

  createLeftJoy() {

    let options = {
      zone: this.leftJoystick.nativeElement,
      mode: 'static',
      position: {left: '50%', top: '75%'},
      color: 'black'
    };

    this.leftJoy = nipplejs.create(options)[0];
    this.leftJoy.on("move", evt=>{
      let pos = evt.target.instance.frontPosition;
      this.steering = pos.x/(evt.target.instance.options.size/2);
      this.throttle = pos.y/(evt.target.instance.options.size/2)*100;
      this.motor.setSteering(this.steering);
      this.motor.setThrottle(this.throttle);
    });
    this.leftJoy.on("end", () => {
      this.motor.setSteering(0);
      this.motor.setThrottle(0);
      this.steering = this.throttle = 0;
    });
  }

  ionViewDidEnter() {


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
      (<any>navigator).fusion.setMode(() => {}, () => {}, {mode: 1});
      this.watchId = (<any>navigator).fusion.watchSensorFusion(data => this.sensorUpdate(data), console.log, {
        frequency: 100
      });
      this.leftJoy.destroy();
    } else {
      this.createLeftJoy();
    }
  }
}
