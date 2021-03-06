import {Component, ElementRef} from '@angular/core';
import {NxtPacketProvider} from "../../providers/nxt/nxt-packet";
import {MotorProvider} from "../../providers/motor/motor";
import {Utils} from "../../utils/utils";

@Component({
  selector: 'page-main',
  templateUrl: 'main.html'
})
export class MainPage {
  private steering: number = 0;
  private throttle: number = 0;
  private _auxiliary: number = 0;
  private watchId: number;
  private tiltActive: boolean;

  constructor(private elementRef: ElementRef, public nxt: NxtPacketProvider, public motor: MotorProvider) {
  }

  ionViewDidLoad() {
    this.setTilt(localStorage.getItem("tilt.active") == "true");
  }

  get auxiliary(): number {
    return this._auxiliary;
  }

  set auxiliary(value: number) {
    this._auxiliary = value;
    //TODO: make it so that the aux slider is in a nicer position and add a label.
    this.motor.setAux(this._auxiliary);
  }

  endThrottle() {
    this.motor.setThrottle(0);
    this.throttle = 0;
  }

  endSteering() {
    this.motor.setSteering(0);
    this.steering = 0;
  }

  setSteering(evt) {
    let pos = evt.target.instance.frontPosition;
    this.steering = pos.x / (evt.target.instance.options.size / 2);
    this.motor.setSteering(this.steering);
  }

  setThrottle(evt) {
    let pos = evt.target.instance.frontPosition;
    this.throttle = pos.y / (evt.target.instance.options.size / 2) * 100;
    this.motor.setThrottle(this.throttle);
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
    if (!this.tiltActive || !Utils.isVisible(this.elementRef)) return;
    this.throttle = (data.eulerAngles.roll + Math.PI / 2) * 2;
    if (Math.abs(this.throttle) < 0.5) {
      this.motor.setThrottle(0);
    } else {
      if (this.throttle > 1) this.throttle = 1;
      if (this.throttle < -1) this.throttle = -1;
      this.throttle *= -100;
      this.motor.setThrottle(this.throttle);
    }
    this.steering = data.eulerAngles.pitch * -1;
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
      this.watchId = (<any>navigator).fusion.watchSensorFusion(this.sensorUpdate.bind(this), () => {}, {frequency: 100});
    }
  }
}
