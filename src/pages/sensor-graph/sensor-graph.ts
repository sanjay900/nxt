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
  @ViewChild('lineCanvas') lineCanvas;
  private readonly port: number;
  private readonly sensor: string;
  private lineChart: Chart;
  private intervalId: number;
  private packetReciever: Subscription;
  private current: number = 0;

  constructor(public viewCtrl: ViewController, public navCtrl: NavController, public navParams: NavParams, public nxt: NxtProvider) {
    this.port = this.viewCtrl.data.port;
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
    this.lineChart.data.labels.push(this.current++);
    this.lineChart.data.datasets.forEach((dataset) => {
      dataset.data.push(packet.scaledValue);
      if (dataset.data.length > 100) {
        dataset.data.shift();
        this.lineChart.data.labels.shift();
      }
    });
    this.lineChart.update();
  }
  ionViewDidLeave() {
    clearInterval(this.intervalId);
    this.packetReciever.unsubscribe();
  }
  ionViewDidLoad() {
    console.log('ionViewDidLoad SensorGraphPage');
    this.lineChart = new Chart(this.lineCanvas.nativeElement, {
      type: 'line',
      legend: {
        display: false
      },
      tooltips: {
        enabled: false
      },
      data: {
        datasets: [
          {
            label: "Sensor Data",
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
            pointHoverRadius: 5,
            pointHoverBackgroundColor: "rgba(75,192,192,1)",
            pointHoverBorderColor: "rgba(220,220,220,1)",
            pointHoverBorderWidth: 2,
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
