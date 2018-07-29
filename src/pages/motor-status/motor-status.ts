import {ChangeDetectionStrategy, Component, NgZone} from '@angular/core';
import {NavController, NavParams} from 'ionic-angular';
import {NxtProvider} from "../../providers/nxt/nxt";
import {GetOutputState} from "../../providers/nxt/packets/direct/get-output-state";
import {DirectCommand, OutputPort, SystemOutputPort} from "../../providers/nxt/nxt-constants";
import {Subscription} from "rxjs";
import {ResetMotorPosition} from "../../providers/nxt/packets/direct/reset-motor-position";

/**
 * Generated class for the MotorStatusPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-motor-status',
  templateUrl: 'motor-status.html'
})
export class MotorStatusPage {
  public motors: GetOutputState[] = [new GetOutputState(), new GetOutputState(), new GetOutputState()];
  private intervalId: number;
  private packetReciever: Subscription;
  constructor(public nxt: NxtProvider, private zone: NgZone) {

  }

  motorUpdate(packet: GetOutputState) {
    this.zone.run(()=>{
      this.motors[packet.port] = packet;
    });
  }

  ionViewDidEnter() {
    //Start up a thread for requesting the state of all motors
    this.intervalId = setInterval(() => {
      this.nxt.writePacket(true, ...GetOutputState.createMultiple(OutputPort.A_B_C));
    }, 100);

    this.packetReciever = this.nxt.packetEvent$
      .filter(packet => packet.id == DirectCommand.GET_OUTPUT_STATE)
      .subscribe(this.motorUpdate.bind(this));

    console.log('ionViewDidLoad MotorStatusPage');
  }

  ionViewDidLeave() {
    clearInterval(this.intervalId);
    this.packetReciever.unsubscribe();
  }

  getMotorName(port: SystemOutputPort) {
    return SystemOutputPort[port];
  }

  resetMotorStats(motor: GetOutputState) {
    this.nxt.writePacket(false, ResetMotorPosition.createPacket(motor.port,false));
  }
}
