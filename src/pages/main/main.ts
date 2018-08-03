import {Component} from '@angular/core';
import {NxtProvider} from "../../providers/nxt/nxt";

@Component({
  selector: 'page-main',
  templateUrl: 'main.html'
})
export class MainPage {
  private steering: number;
  private throttle: number;
  private watchId: number;

  constructor(public nxt: NxtProvider) {
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
    // this.nxt.stopMotors(OutputPort.A_B_C);
  }

  sensorUpdate(data) {
    this.steering = data.eulerAngles.pitch;
    this.steering *= 180 / Math.PI;
    this.steering *= -5;
    this.throttle = (data.eulerAngles.roll + Math.PI / 2) * 2;
    if (Math.abs(this.throttle) < 0.5) {
      // this.nxt.stopMotors(OutputPort.B_C);
    } else {
      if (this.throttle > 1) this.throttle = 1;
      if (this.throttle < -1) this.throttle = -1;
      this.throttle *= -99;
      // this.nxt.classicMotorCommand(OutputPort.B_C, this.throttle, 0, false);
    }
    // this.nxt.rotateTowards(OutputPort.A, this.steering);

  }

}
