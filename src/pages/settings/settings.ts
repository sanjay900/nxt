import {Component} from '@angular/core';
import {BluetoothProvider} from "../../providers/bluetooth/bluetooth";
import {NxtProvider} from "../../providers/nxt/nxt";
import {NxtConstants} from "../../providers/nxt/nxt-constants";
import {PlayTone} from "../../providers/nxt/packets/direct/play-tone";
import {StartProgram} from "../../providers/nxt/packets/direct/start-program";

/**
 * Generated class for the SettingsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html',
})
export class SettingsPage {
  constructor(public bluetooth: BluetoothProvider, public nxt: NxtProvider) {

  }

  startMotorProgram() {
    this.nxt.writePacket(false, StartProgram.createPacket(NxtConstants.MOTOR_PROGRAM));
    // this.nxt.startProgram(NxtConstants.MOTOR_PROGRAM);
  }

  playTone(frequency: number, duration: number) {
    this.nxt.writePacket(false, PlayTone.createPacket(frequency, duration));
  }
}
