import {Component, ViewChild} from '@angular/core';
import {NxtProvider} from "../../providers/nxt/nxt";
import {MotorProvider} from "../../providers/motor/motor";
import nipplejs from 'nipplejs';

@Component({
  selector: 'page-main',
  templateUrl: 'main.html'
})
export class MainPage {
  private steering: number;
  private throttle: number;
  private watchId: number;
  @ViewChild('leftJoystick') leftJoystick;
  @ViewChild('rightJoystick') rightJoystick;

  constructor(public nxt: NxtProvider, public motor: MotorProvider) {
  }

  ionViewDidLoad() {
    let options = {
      zone: this.leftJoystick.nativeElement,
      mode: 'static',
      position: {left: '50%', top: '75%'},
      color: 'black'
    };

    nipplejs.create(options);
    options.zone = this.rightJoystick.nativeElement;

    nipplejs.create(options);
  }
  ionViewDidEnter() {
    (<any>navigator).fusion.setMode(() => {
    }, () => {
    }, {mode: 1});
    let options = {
      frequency: 100
    };
    this.watchId = (<any>navigator).fusion.watchSensorFusion(data => this.sensorUpdate(data), console.log, options);

  }

  ionViewDidLeave() {
    (<any>navigator).fusion.clearWatch(this.watchId);
    this.motor.setThrottle(0);
  }

  sensorUpdate(data) {
    this.steering = data.eulerAngles.pitch;
    //Scale this euler angle from -PI -> PI to -1 -> 1
    this.steering /= Math.PI;
    this.throttle = (data.eulerAngles.roll + Math.PI / 2) * 2;
    if (Math.abs(this.throttle) < 0.5) {
      this.motor.setThrottle(0);
    } else {
      if (this.throttle > 1) this.throttle = 1;
      if (this.throttle < -1) this.throttle = -1;
      this.throttle *= -100;
      this.motor.setThrottle(Math.round(this.throttle));
    }
    this.motor.setSteering(this.steering);

  }

}
