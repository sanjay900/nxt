import {Component, ViewChild} from '@angular/core';
import {IonicPage, NavController, NavParams, ViewController} from 'ionic-angular';
import { Chart } from 'chart.js';
import {GetInputValues} from "../../providers/nxt/packets/direct/get-input-values";
import {DirectCommand, InputSensorType} from "../../providers/nxt/nxt-constants";
import {Subscription} from "rxjs";
import {NxtProvider} from "../../providers/nxt/nxt";
import {ChartProvider} from "../../providers/chart/chart";
import {SensorProvider, SensorType} from "../../providers/sensor/sensor";

/**
 * Generated class for the SensorGraphPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage({
  name:"sensor-graph"
})
@Component({
  selector: 'page-sensor-graph',
  templateUrl: 'sensor-graph.html',
})
export class SensorGraphPage {
  @ViewChild('scaledChartCanvas') scaledChartCanvas;
  @ViewChild('rawChartCanvas') rawChartCanvas;
  private readonly port: number;
  private readonly sensor: SensorType;
  private scaledChart: Chart;
  private rawChart: Chart;
  private packetReciever: Subscription;
  private current: number = 0;
  private static readonly GRAPH_SIZE: number = 50;

  constructor(public viewCtrl: ViewController, public nxt: NxtProvider, private sensorProvider: SensorProvider) {
    this.port = this.viewCtrl.data.port;
    this.sensor = this.viewCtrl.data.sensor;

  }
  ionViewDidEnter() {
    this.packetReciever = this.sensorProvider.sensorEvent$
      .subscribe(this.sensorUpdate.bind(this));
    this.sensorProvider.setSensorType(this.sensor, this.port);
  }
  sensorUpdate(packet: GetInputValues) {
    ChartProvider.addData(this.scaledChart, packet.scaledValue, this.current+"", SensorGraphPage.GRAPH_SIZE);
    ChartProvider.addData(this.rawChart, packet.rawValue, this.current+"", SensorGraphPage.GRAPH_SIZE);
    this.current++;
  }
  ionViewDidLeave() {
    this.packetReciever.unsubscribe();
  }
  ionViewDidLoad() {
    this.scaledChart = ChartProvider.createLineChart(this.scaledChartCanvas.nativeElement);
    this.rawChart = ChartProvider.createLineChart(this.rawChartCanvas.nativeElement);
  }

}
