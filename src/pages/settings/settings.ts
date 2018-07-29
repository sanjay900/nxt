import {Component} from '@angular/core';
import {BluetoothProvider} from "../../providers/bluetooth/bluetooth";
import {NxtProvider} from "../../providers/nxt/nxt";
import {NxtConstants} from "../../providers/nxt/nxt-constants";

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
    // this.nxt.startProgram(NxtConstants.MOTOR_PROGRAM);
  }
}
