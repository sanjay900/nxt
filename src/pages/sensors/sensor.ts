import {Component} from '@angular/core';
import {NxtProvider} from "../../providers/nxt/nxt";
import {DirectCommand, InputSensorMode, InputSensorType} from "../../providers/nxt/nxt-constants";
import {Subscription} from "rxjs";
import {GetInputValues} from "../../providers/nxt/packets/direct/get-input-values";
import {SetInputMode} from "../../providers/nxt/packets/direct/set-input-mode";
import {NavController} from "ionic-angular";

@Component({
  selector: 'sensor-page',
  templateUrl: 'sensor.html'
})
export class SensorPage {
  public sensors: SensorStatus[] = [
    new SensorStatus(this.nxt, 0),
    new SensorStatus(this.nxt, 1),
    new SensorStatus(this.nxt, 2),
    new SensorStatus(this.nxt, 3)
  ];
  private intervalId: number;
  private packetReciever: Subscription;

  constructor(public nxt: NxtProvider, public navCtrl: NavController) {}

  sensorUpdate(packet: GetInputValues) {
    this.sensors[packet.port].lastPacket = packet;
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
  ionViewDidLeave() {
    clearInterval(this.intervalId);
    this.packetReciever.unsubscribe();
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

  showGraph(sensor: SensorStatus) {
    this.navCtrl.push("sensor-graph", {
      port: sensor.lastPacket.port,
      sensor: this.formatEnum(InputSensorType[sensor.lastPacket.type])
    });
  }
}

export class SensorStatus {
  private _lastPacket: GetInputValues = new GetInputValues();
  private _type: InputSensorType;
  private _mode: InputSensorMode;

  constructor(private nxt: NxtProvider, public port: number) {};


  get lastPacket(): GetInputValues {
    return this._lastPacket;
  }

  set lastPacket(value: GetInputValues) {
    this._lastPacket = value;
    this._type = this._lastPacket.type;
    this._mode = this._lastPacket.mode;
    this.port = this._lastPacket.port;
  }

  get mode(): InputSensorMode {
    return this._mode;
  }

  get type(): InputSensorType {
    return this._type;
  }

  set mode(value: InputSensorMode) {
    this._mode = value;
    this.nxt.writePacket(true, SetInputMode.createPacket(this.port, this._type, this._mode));
  }

  set type(value: InputSensorType) {
    this._type = value;
    this.nxt.writePacket(true, SetInputMode.createPacket(this.port, this._type, this._mode));
  }
}
