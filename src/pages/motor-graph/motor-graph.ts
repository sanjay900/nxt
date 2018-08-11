import {Component, ViewChild} from '@angular/core';
import {AlertController, IonicPage, ViewController} from 'ionic-angular';
import {Chart} from 'chart.js';
import {
  DirectCommand,
  OutputMode,
  OutputRegulationMode,
  OutputRunState,
  SystemOutputPort
} from "../../providers/nxt/nxt.model";
import {Subscription} from "rxjs";
import {NxtProvider} from "../../providers/nxt/nxt";
import {GetOutputState} from "../../providers/nxt/packets/direct/get-output-state";
import {ChartProvider} from "../../providers/chart/chart";
import {ResetMotorPosition} from "../../providers/nxt/packets/direct/reset-motor-position";
import {Utils} from "../../providers/utils/utils";
import {File} from "@ionic-native/file";
import {BluetoothProvider} from "../../providers/bluetooth/bluetooth";
import {FileOpener} from "@ionic-native/file-opener";

@IonicPage({
  name: "motor-graph"
})
@Component({
  selector: 'page-motor-graph',
  templateUrl: 'motor-graph.html',
})
export class MotorGraphPage {
  private static readonly GRAPH_SIZE: number = 50;
  @ViewChild('powerChartCanvas') powerChartCanvas;
  @ViewChild('rotationCountChartCanvas') rotationCountChartCanvas;
  @ViewChild('countChartCanvas') countChartCanvas;
  @ViewChild('limitChartCanvas') limitChartCanvas;
  @ViewChild('blockCountChartCanvas') blockCountChartCanvas;
  private powerChart: Chart;
  private rotationCountChart: Chart;
  private countChart: Chart;
  private limitChart: Chart;
  private blockCountChart: Chart;
  private readonly formatTitle = Utils.formatTitle;
  private readonly OutputMode = OutputMode;
  private readonly OutputRegulationMode = OutputRegulationMode;
  private readonly OutputRunState = OutputRunState;
  private readonly SystemOutputPort = SystemOutputPort;
  private readonly port: SystemOutputPort;
  private readonly portName: string;
  private intervalId: number;
  private packetReciever: Subscription;
  private current: number = 0;
  private packet: GetOutputState = new GetOutputState();
  private powerData: number[] = [];
  private rotationCountData: number[] = [];
  private limitData: number[] = [];
  private blockCountData: number[] = [];
  private countData: number[] = [];

  constructor(public viewCtrl: ViewController, public nxt: NxtProvider, private file: File, private alertCtrl: AlertController, private fileOpener: FileOpener) {
    this.port = this.viewCtrl.data.port;

  }

  ionViewDidEnter() {
    this.intervalId = setInterval(() => {
      this.nxt.writePacket(true, GetOutputState.createPacket(this.port));
    }, 100);

    this.packetReciever = this.nxt.packetEvent$
      .filter(packet => packet.id == DirectCommand.GET_OUTPUT_STATE)
      .subscribe(this.motorUpdate.bind(this));
  }

  motorUpdate(packet: GetOutputState) {
    ChartProvider.addData(this.powerChart, packet.power, this.current + "", MotorGraphPage.GRAPH_SIZE);
    ChartProvider.addData(this.rotationCountChart, packet.rotationCount, this.current + "", MotorGraphPage.GRAPH_SIZE);
    ChartProvider.addData(this.limitChart, packet.tachoLimit, this.current + "", MotorGraphPage.GRAPH_SIZE);
    ChartProvider.addData(this.blockCountChart, packet.blockTachoCount, this.current + "", MotorGraphPage.GRAPH_SIZE);
    ChartProvider.addData(this.countChart, packet.tachoCount, this.current + "", MotorGraphPage.GRAPH_SIZE);
    this.powerData.push(packet.power);
    this.rotationCountData.push(packet.rotationCount);
    this.limitData.push(packet.tachoLimit);
    this.blockCountData.push(packet.blockTachoCount);
    this.countData.push(packet.tachoCount);

    this.current++;
    this.packet = packet;
  }

  ionViewDidLeave() {
    clearInterval(this.intervalId);
    this.packetReciever.unsubscribe();
    this.powerData = [];
    this.rotationCountData = [];
    this.limitData = [];
    this.blockCountData = [];
    this.countData = [];
  }

  ionViewDidLoad() {
    this.countChart = ChartProvider.createLineChart(this.countChartCanvas.nativeElement);
    this.powerChart = ChartProvider.createLineChart(this.powerChartCanvas.nativeElement);
    this.rotationCountChart = ChartProvider.createLineChart(this.rotationCountChartCanvas.nativeElement);
    this.limitChart = ChartProvider.createLineChart(this.limitChartCanvas.nativeElement);
    this.blockCountChart = ChartProvider.createLineChart(this.blockCountChartCanvas.nativeElement);
  }

  resetMotorStats() {
    this.nxt.writePacket(false, ResetMotorPosition.createPacket(this.packet.port, false));
  }

  export() {
    let data: string = "Power,Rotation Count,Tachometer Limit,Block Tachometer Limit,Tachometer Count";
    for (let i = 0; i < this.powerData.length; i++) {
      data += "\n" + this.powerData[i] + "," + this.rotationCountData[i] + "," + this.limitData[i] + "," + this.blockCountData[i] + "," + this.countData[i];
    }
    let fileName: string = "motor-values-" + this.packet.port + "-" + new Date().getTime() + ".csv";
    this.file.writeFile(this.file.externalRootDirectory, fileName, data).then(() => {
      const alert = this.alertCtrl.create({
        title: 'Successfully exported data',
        subTitle: "File written to: "+fileName,
        buttons: ['OK', {text: 'Open File', handler: ()=>{
          this.fileOpener.open(this.file.externalRootDirectory+"/"+fileName,"text/csv");
        }}]
      });
      alert.present();
    }).catch(reason => {
      const alert = this.alertCtrl.create({
        title: 'Failed to export data',
        subTitle: "Error: "+reason,
        buttons: ['OK']
      });
      alert.present();
    })
  }

}
