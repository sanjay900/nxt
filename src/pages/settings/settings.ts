import {Component} from '@angular/core';
import {BluetoothProvider} from "../../providers/bluetooth/bluetooth";
import {NxtProvider} from "../../providers/nxt/nxt";
import {NxtModel} from "../../providers/nxt/nxt.model";
import {PlayTone} from "../../providers/nxt/packets/direct/play-tone";
import {StartProgram} from "../../providers/nxt/packets/direct/start-program";

@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html',
})
export class SettingsPage {
  constructor(public bluetooth: BluetoothProvider, public nxt: NxtProvider) {

  }

  startMotorProgram() {
    this.nxt.writePacket(false, StartProgram.createPacket(NxtModel.MOTOR_PROGRAM));
  }

  playTone(frequency: number, duration: number) {
    this.nxt.writePacket(false, PlayTone.createPacket(frequency, duration));
  }
}
