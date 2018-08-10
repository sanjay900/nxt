import {Component} from '@angular/core';
import {Subscription} from "rxjs";
import {NavController} from "ionic-angular";
import {SensorData, SensorProvider, SensorType} from "../../providers/sensor/sensor";

@Component({
  selector: 'sensor-page',
  templateUrl: 'sensor.html'
})
export class SensorPage {
  public sensors: SensorDataModel[] = [
    new SensorDataModel(0, this.sensor),
    new SensorDataModel(1, this.sensor),
    new SensorDataModel(2, this.sensor),
    new SensorDataModel(3, this.sensor)
  ];
  private SensorType = Object.values(SensorType);
  private packetReciever: Subscription;

  constructor(public navCtrl: NavController, private sensor: SensorProvider) {
  }

  ionViewDidEnter() {
    this.packetReciever = this.sensor.sensorEvent$
      .subscribe(sensorData => {
        this.sensors[sensorData.port].data = sensorData
      });
    this.sensors.forEach(model => {
      this.sensor.setSensorType(model.type, model.data.port);
    });
  }

  ionViewWillLeave() {
    this.sensor.disableAllSensors();
    this.packetReciever.unsubscribe();
  }

  showGraph(sensor: SensorData) {
    this.navCtrl.push("sensor-graph", {
      port: sensor.port,
      sensor: sensor.type
    });
  }
}

class SensorDataModel {
  data: SensorData;
  private readonly _port: number;
  private sensor: SensorProvider;

  constructor(port: number, sensor: SensorProvider) {
    this.sensor = sensor;
    this.data = new SensorData(port, 0, 0, SensorType.NONE);
    this._port = port;
  }

  private _type: SensorType = SensorType.NONE;

  get type(): SensorType {
    return this._type;
  }

  set type(value: SensorType) {
    this._type = value;
    this.sensor.setSensorType(this._type, this._port);
  }
}
