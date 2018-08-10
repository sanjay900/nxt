import {Component, ViewChild} from '@angular/core';
import {AlertController, IonicPage, ViewController} from 'ionic-angular';
import {Chart} from 'chart.js';
import {GetInputValues} from "../../providers/nxt/packets/direct/get-input-values";
import {Subscription} from "rxjs";
import {NxtProvider} from "../../providers/nxt/nxt";
import {ChartProvider} from "../../providers/chart/chart";
import {SensorProvider, SensorType} from "../../providers/sensor/sensor";
import {BluetoothProvider} from "../../providers/bluetooth/bluetooth";
import {File} from "@ionic-native/file";
import {FileOpener} from "@ionic-native/file-opener";

@IonicPage({
  name: "sensor-graph"
})
@Component({
  selector: 'page-sensor-graph',
  templateUrl: 'sensor-graph.html',
})
export class SensorGraphPage {
  private static readonly GRAPH_SIZE: number = 50;
  @ViewChild('scaledChartCanvas') scaledChartCanvas;
  @ViewChild('rawChartCanvas') rawChartCanvas;
  private readonly port: number;
  private readonly sensor: SensorType;
  private scaledChart: Chart;
  private rawChart: Chart;
  private packetReceiver: Subscription;
  private current: number = 0;
  private scaledData: number[] = [];
  private rawData: number[] = [];

  constructor(public viewCtrl: ViewController, public nxt: NxtProvider, private sensorProvider: SensorProvider, public bluetooth: BluetoothProvider, private alertCtrl: AlertController, private file: File, private fileOpener: FileOpener) {
    this.port = this.viewCtrl.data.port;
    this.sensor = this.viewCtrl.data.sensor;

  }

  ionViewDidEnter() {
    this.packetReceiver = this.sensorProvider.sensorEvent$
      .subscribe(this.sensorUpdate.bind(this));
    this.sensorProvider.setSensorType(this.sensor, this.port);
  }

  sensorUpdate(packet: GetInputValues) {
    ChartProvider.addData(this.scaledChart, packet.scaledValue, this.current + "", SensorGraphPage.GRAPH_SIZE);
    ChartProvider.addData(this.rawChart, packet.rawValue, this.current + "", SensorGraphPage.GRAPH_SIZE);
    this.scaledData.push(packet.scaledValue);
    this.rawData.push(packet.rawValue);
    this.current++;
  }

  ionViewDidLeave() {
    this.packetReceiver.unsubscribe();
    this.rawData = [];
    this.scaledData = [];
  }

  ionViewDidLoad() {
    this.scaledChart = ChartProvider.createLineChart(this.scaledChartCanvas.nativeElement);
    this.rawChart = ChartProvider.createLineChart(this.rawChartCanvas.nativeElement);
  }

  export() {
    let data: string = "Raw Value, Scaled Value";
    for (let i = 0; i < this.scaledData.length; i++) {
      data += "\n" + this.rawData[i] + "," + this.scaledData[i];
    }
    let fileName: string = "sensor-values-" + this.port + "-" + this.sensor + " - " + new Date().getTime() + ".csv";
    this.file.writeFile(this.file.externalRootDirectory, fileName, data).then(() => {
      const alert = this.alertCtrl.create({
        title: 'Successfully exported data',
        subTitle: "File written to: " + fileName,
        buttons: ['OK', {
          text: 'Open File', handler: () => {
            this.fileOpener.open(this.file.externalRootDirectory + "/" + fileName, "text/csv");
          }
        }]
      });
      alert.present();
    }).catch(reason => {
      const alert = this.alertCtrl.create({
        title: 'Failed to export data',
        subTitle: "Error: " + reason,
        buttons: ['OK']
      });
      alert.present();
    })
  }

}
