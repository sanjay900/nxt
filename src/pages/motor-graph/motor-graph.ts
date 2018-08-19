import {Component, ViewChild} from '@angular/core';
import {AlertController, IonicPage, ViewController} from 'ionic-angular';
import {Chart} from 'chart.js';
import {Subscription} from "rxjs";
import {NxtPacketProvider} from "../../providers/nxt/nxt-packet";
import {GetOutputState} from "../../providers/nxt/packets/direct/get-output-state";
import {ResetMotorPosition} from "../../providers/nxt/packets/direct/reset-motor-position";
import {Utils} from "../../utils/utils";
import {File} from "@ionic-native/file";
import {FileOpener} from "@ionic-native/file-opener";
import {DirectCommand} from "../../providers/nxt/packets/direct-command";
import {
  OutputMode,
  OutputRegulationMode,
  OutputRunState,
  SystemOutputPort
} from "../../providers/motor/motor-constants";

@IonicPage({
  name: "motor-graph"
})
@Component({
  selector: 'page-motor-graph',
  templateUrl: 'motor-graph.html',
})
export class MotorGraphPage {
  private readonly GRAPH_SIZE: number = 50;
  @ViewChild('powerChart') powerChart;
  @ViewChild('rotationCountChart') rotationCountChart;
  @ViewChild('countChart') countChart;
  @ViewChild('limitChart') limitChart;
  @ViewChild('blockCountChart') blockCountChart;
  private readonly formatTitle = Utils.formatTitle;
  private readonly OutputMode = OutputMode;
  private readonly OutputRegulationMode = OutputRegulationMode;
  private readonly OutputRunState = OutputRunState;
  private readonly SystemOutputPort = SystemOutputPort;
  private readonly port: SystemOutputPort;
  private readonly portName: string;
  private intervalId: number;
  private packetReciever: Subscription;
  private packet: GetOutputState = new GetOutputState();
  private powerData: number[] = [];
  private rotationCountData: number[] = [];
  private limitData: number[] = [];
  private blockCountData: number[] = [];
  private countData: number[] = [];

  constructor(public viewCtrl: ViewController, public nxt: NxtPacketProvider, private file: File, private alertCtrl: AlertController, private fileOpener: FileOpener) {
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
    this.powerChart.addData(packet.power);
    this.rotationCountChart.addData(packet.rotationCount);
    this.limitChart.addData(packet.tachoLimit);
    this.blockCountChart.addData(packet.blockTachoCount);
    this.countChart.addData(packet.tachoCount);
    this.powerData.push(packet.power);
    this.rotationCountData.push(packet.rotationCount);
    this.limitData.push(packet.tachoLimit);
    this.blockCountData.push(packet.blockTachoCount);
    this.countData.push(packet.tachoCount);
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
