import {Component} from '@angular/core';
import {NxtProvider} from "../../providers/nxt/nxt";
import {MotorProvider} from "../../providers/motor/motor";
import {OutputPort} from "../../providers/nxt/nxt.model";

@Component({
  selector: 'page-main',
  templateUrl: 'main.html'
})
export class MainPage {
  private steering: number;
  private throttle: number;
  private watchId: number;

  constructor(public nxt: NxtProvider, public motor: MotorProvider) {
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
    this.motor.setMotorPower(OutputPort.A_B_C, 0);
  }

  sensorUpdate(data) {
    this.steering = data.eulerAngles.pitch;
    this.steering *= 180 / Math.PI;
    this.steering *= -5;
    this.throttle = (data.eulerAngles.roll + Math.PI / 2) * 2;
    if (Math.abs(this.throttle) < 0.5) {
      this.motor.setMotorPower(OutputPort.B_C, 0);
    } else {
      if (this.throttle > 1) this.throttle = 1;
      if (this.throttle < -1) this.throttle = -1;
      this.throttle *= -99;
      this.motor.setMotorPower(OutputPort.B_C, Math.round(this.throttle));
    }
    this.motor.rotateTowards(OutputPort.A, Math.round(this.steering));

  }

}
