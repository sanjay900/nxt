import {Component} from '@angular/core';
import {BluetoothProvider} from "../../providers/bluetooth/bluetooth";
import {NxtProvider} from "../../providers/nxt/nxt";
import {MultiOutputPort, SingleOutputPort} from "../../providers/nxt/nxt.model";
import {PlayTone} from "../../providers/nxt/packets/direct/play-tone";
import {MotorProvider, SteeringConfig} from "../../providers/motor/motor";
import {Utils} from "../../providers/utils/utils";

@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html',
})
export class SettingsPage {
  public STEERING_CONFIGS = Utils.enumToMap(SteeringConfig);
  public SINGLE_PORT = Utils.enumToMap(SingleOutputPort);
  public MULTIPLE_PORT = Utils.enumToMap({...SingleOutputPort, ...MultiOutputPort}, " and ")
    .filter(port => port.value != MultiOutputPort.A_B_C);
  //The auxiliary port is optional.
  public AUXILIARY_PORT = Utils.enumToMap({...SingleOutputPort, ...{none: "None"}}, " ");

  constructor(public bluetooth: BluetoothProvider, public nxt: NxtProvider, public motor: MotorProvider) {}

  playTone(frequency: number, duration: number) {
    this.nxt.writePacket(false, PlayTone.createPacket(frequency, duration));
  }


  isTankControlled() {
    return this.motor.steeringConfig == SteeringConfig.TANK;
  }
}
