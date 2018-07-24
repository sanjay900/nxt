import {Component} from '@angular/core';
import {ActionSheetController, IonicPage, NavController, NavParams} from 'ionic-angular';
import {BluetoothProvider} from "../../providers/bluetooth/bluetooth";

/**
 * Generated class for the SettingsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html',
})
export class SettingsPage {
  constructor(public navCtrl: NavController, public actionSheetCtrl: ActionSheetController, public navParams: NavParams, public bluetooth: BluetoothProvider) {

  }

  sendTone() {
    this.bluetooth.write(new Uint8Array([0x06, 0x00, 0x80, 0x03, 0x0B, 0x02, 0xF4, 0x01]));
  }

  resetPosition() {
    this.bluetooth.write(new Uint8Array([0x04, 0x00, 0x00, 0x0A,0x01,0x00]));
  }
}
