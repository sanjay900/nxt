import {Component, ViewChild} from '@angular/core';
import {IonicPage, NavController, NavParams, ViewController} from 'ionic-angular';
import { Chart } from 'chart.js';
import {GetInputValues} from "../../providers/nxt/packets/direct/get-input-values";
import {DirectCommand, InputSensorType} from "../../providers/nxt/nxt-constants";
import {Subscription} from "rxjs";
import {NxtProvider} from "../../providers/nxt/nxt";

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
  private readonly sensor: string;
  private scaledChart: Chart;
  private rawChart: Chart;
  private intervalId: number;
  private packetReciever: Subscription;
  private current: number = 0;

  constructor(public viewCtrl: ViewController, public navCtrl: NavController, public navParams: NavParams, public nxt: NxtProvider) {
    this.port = this.viewCtrl.data.port+1;
    this.sensor = this.viewCtrl.data.sensor;

  }
  ionViewDidEnter() {
    //Start up a thread for requesting the state of all motors
    this.intervalId = setInterval(() => {
      this.nxt.writePacket(true, GetInputValues.createPacket(this.port),
      );
    }, 100);

    this.packetReciever = this.nxt.packetEvent$
      .filter(packet => packet.id == DirectCommand.GET_INPUT_VALUES)
      .subscribe(this.sensorUpdate.bind(this));
  }
  sensorUpdate(packet: GetInputValues) {
    this.scaledChart.data.labels.push(this.current);
    this.scaledChart.data.datasets.forEach((dataset) => {
      dataset.data.push(packet.scaledValue);
      if (dataset.data.length > 100) {
        dataset.data.shift();
        this.scaledChart.data.labels.shift();
      }
    });
    this.scaledChart.update();

    this.rawChart.data.labels.push(this.current++);
    this.rawChart.data.datasets.forEach((dataset) => {
      dataset.data.push(packet.rawValue);
      if (dataset.data.length > 100) {
        dataset.data.shift();
        this.rawChart.data.labels.shift();
      }
    });
    this.rawChart.update();
  }
  ionViewDidLeave() {
    clearInterval(this.intervalId);
    this.packetReciever.unsubscribe();
  }
  ionViewDidLoad() {
    this.scaledChart = new Chart(this.scaledChartCanvas.nativeElement, {
      type: 'line',
      options: {
        legend: {
          display: false
        }, tooltips: {
          enabled: false
        }
      }, data: {
        datasets: [
          {
            fill: false,
            lineTension: 0.1,
            backgroundColor: "rgba(75,192,192,0.4)",
            borderColor: "rgba(75,192,192,1)",
            borderCapStyle: 'butt',
            borderDash: [],
            borderDashOffset: 0.0,
            borderJoinStyle: 'miter',
            pointBorderColor: "rgba(75,192,192,1)",
            pointBackgroundColor: "#fff",
            pointBorderWidth: 1,
            pointRadius: 1,
            pointHitRadius: 10,
            data: [],
            spanGaps: false,
          }
        ]
      }
    });
    this.rawChart = new Chart(this.rawChartCanvas.nativeElement, {
      type: 'line',
      options: {
        legend: {
          display: false
        }, tooltips: {
          enabled: false
        }
      }, data: {
        datasets: [
          {
            fill: false,
            lineTension: 0.1,
            backgroundColor: "rgba(75,192,192,0.4)",
            borderColor: "rgba(75,192,192,1)",
            borderCapStyle: 'butt',
            borderDash: [],
            borderDashOffset: 0.0,
            borderJoinStyle: 'miter',
            pointBorderColor: "rgba(75,192,192,1)",
            pointBackgroundColor: "#fff",
            pointBorderWidth: 1,
            pointRadius: 1,
            pointHitRadius: 10,
            data: [],
            spanGaps: false,
          }
        ]
      }
    });
  }

}
