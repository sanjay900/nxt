import {Component, NgZone} from '@angular/core';
import {NxtProvider} from "../../providers/nxt/nxt";
import {DirectCommand, InputSensorMode, InputSensorType} from "../../providers/nxt/nxt-constants";
import {Subscription} from "rxjs";
import {GetInputValues} from "../../providers/nxt/packets/direct/get-input-values";
import {SetInputMode} from "../../providers/nxt/packets/direct/set-input-mode";

/**
 * Generated class for the MotorStatusPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'sensor-page',
  templateUrl: 'sensor.html'
})
export class SensorPage {
  public sensors: GetInputValues[] = [new GetInputValues(), new GetInputValues(), new GetInputValues(), new GetInputValues()];
  private intervalId: number;
  private packetReciever: Subscription;

  constructor(public nxt: NxtProvider, private zone: NgZone) {}

  sensorUpdate(packet: GetInputValues) {
    this.zone.run(() => {
      this.sensors[packet.port] = packet;
    });
  }

  ionViewDidEnter() {
    //Start up a thread for requesting the state of all motors
    this.intervalId = setInterval(() => {
      this.nxt.writePacket(true, GetInputValues.createPacket(0),
        GetInputValues.createPacket(1),
        GetInputValues.createPacket(2),
        GetInputValues.createPacket(3)
      );
    }, 100);

    this.packetReciever = this.nxt.packetEvent$
      .filter(packet => packet.id == DirectCommand.GET_INPUT_VALUES)
      .subscribe(this.sensorUpdate.bind(this));
  }
  public getSensorTypes() {
    return Object.keys(InputSensorType).filter(key => !isNaN(Number(key))).map(id => {
      return {
        id: Number(id),
        name: this.formatEnum(InputSensorType[id])
      }
    });
  }
  private formatEnum(enumLabel: string) {
    enumLabel = enumLabel.toLowerCase().replace(/_/g, " ");
    return enumLabel.charAt(0).toLocaleUpperCase() + enumLabel.substring(1);
  }
  public getSensorModes() {
    return Object.keys(InputSensorMode).filter(key => !isNaN(Number(key))).map(id => {
      return {
        id: Number(id),
        name: this.formatEnum(InputSensorMode[id])
      }
    });
  }
  ionViewDidLeave() {
    clearInterval(this.intervalId);
    this.packetReciever.unsubscribe();
  }

  setType(packet: GetInputValues, type: number) {
    console.log(packet);
    console.log(type);
    this.nxt.writePacket(true, SetInputMode.createPacket(packet.port, type, packet.mode));
  }

  setMode(packet: GetInputValues, mode: number) {
    console.log(packet);
    console.log(mode);
    this.nxt.writePacket(true, SetInputMode.createPacket(packet.port, packet.type, mode));
  }
}
