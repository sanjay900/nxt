import {Component} from '@angular/core';
import {NavController, Platform} from 'ionic-angular';
import {NxtProvider} from "../../providers/nxt/nxt";
import {BluetoothProvider} from "../../providers/bluetooth/bluetooth";

@Component({
  selector: 'page-main',
  templateUrl: 'main.html'
})
export class MainPage {
  private steering: number;
  private throttle: number;
  constructor(public navCtrl: NavController, public nxt: NxtProvider, public plt: Platform, public bluetooth: BluetoothProvider) {
    this.plt.ready().then((readySource) => {
      console.log('Platform ready from', readySource);
      (<any>navigator).fusion.setMode(()=>{},()=>{},{mode:1});
      let options = {
        frequency: 100
      };
      (<any>navigator).fusion.watchSensorFusion(data=>this.sensorUpdate(data),console.log, options);
    });

  }
  sensorUpdate(data) {
    this.steering = data.eulerAngles.pitch;
    this.steering *= 180/Math.PI;
    this.throttle = (data.eulerAngles.roll + Math.PI/2)*2;
    if (Math.abs(this.throttle) < 0.5) {
      this.nxt.stopMotor(1);
      this.nxt.stopMotor(2);
    } else {
      if (this.throttle > 1) this.throttle = 1;
      if (this.throttle < -1) this.throttle = -1;
      this.throttle *= -100;
      this.nxt.setMotorSpeed(1,this.throttle, false);
      this.nxt.setMotorSpeed(2,this.throttle, false);

    }
    this.nxt.rotateTowards(0, this.steering);

  }

}
