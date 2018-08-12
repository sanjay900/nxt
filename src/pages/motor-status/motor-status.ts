import {Component} from '@angular/core';
import {NavController} from 'ionic-angular';
import {NxtPacketProvider} from "../../providers/nxt/nxt-packet";
import {GetOutputState} from "../../providers/nxt/packets/direct/get-output-state";
import {Subscription} from "rxjs";
import {BluetoothProvider} from "../../providers/bluetooth/bluetooth";
import {DirectCommand} from "../../providers/nxt/packets/direct-command";
import {MultiOutputPort, SystemOutputPort} from "../../providers/motor/output-port";

@Component({
  selector: 'page-motor-status',
  templateUrl: 'motor-status.html'
})
export class MotorStatusPage {
  public motors: GetOutputState[] = [new GetOutputState(), new GetOutputState(), new GetOutputState()];
  private intervalId: number;
  private packetReciever: Subscription;
  private readonly SystemOutputPort = SystemOutputPort;

  constructor(public nxt: NxtPacketProvider, public navCtrl: NavController, public bluetooth: BluetoothProvider) {
    this.motors[0].port = SystemOutputPort.A;
    this.motors[1].port = SystemOutputPort.B;
    this.motors[2].port = SystemOutputPort.C;
  }

  motorUpdate(packet: GetOutputState) {
    this.motors[packet.port] = packet;
  }

  ionViewDidEnter() {
    //Start up a thread for requesting the state of all motors
    this.intervalId = setInterval(() => {
      this.nxt.writePacket(true, ...GetOutputState.createMultiple(MultiOutputPort.A_B_C));
    }, 100);

    this.packetReciever = this.nxt.packetEvent$
      .filter(packet => packet.id == DirectCommand.GET_OUTPUT_STATE)
      .subscribe(this.motorUpdate.bind(this));
  }

  ionViewDidLeave() {
    clearInterval(this.intervalId);
    this.packetReciever.unsubscribe();
  }

  showMotorGraph(motor: GetOutputState) {
    this.navCtrl.push("motor-graph", {port: motor.port})
  }
}
