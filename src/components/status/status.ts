import {Component} from '@angular/core';
import {BluetoothProvider} from "../../providers/bluetooth/bluetooth";
import {ConnectionStatus} from "../../providers/nxt/nxt.model";
import {AlertController} from "ionic-angular";
import {Toast} from '@ionic-native/toast';

/**
 * Generated class for the StatusComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'status',
  templateUrl: 'status.html'
})
export class StatusComponent {
  private _status: ConnectionStatus = ConnectionStatus.DISCONNECTED;

  constructor(private bluetooth: BluetoothProvider, private alertCtrl: AlertController, private toastCtrl: Toast) {
    this.bluetooth.deviceStatus$.subscribe(update => {
      if (update.status == ConnectionStatus.DISCONNECTED && this._status == ConnectionStatus.CONNECTING) {
        this.showAlert(update.statusMessage);
      } else if (this._status) {
        let statusMessage = ConnectionStatus[update.status].toLowerCase();
        statusMessage = statusMessage.charAt(0).toLocaleUpperCase()+statusMessage.substring(1);
        this.toastCtrl.showWithOptions({
          message: "NXT "+statusMessage,
          duration: 1000,
          position: 'bottom',
          addPixelsY: -125
        }).subscribe(() => {});
      }
      this._status = update.status;
    })
  }

  private showAlert(message: string) {
    const alert = this.alertCtrl.create({
      title: 'Error connecting to the selected bluetooth device',
      subTitle: "Error: " + message + "<br>Try connecting to another device, or power cycling the device you are trying to connect to.",
      buttons: ['OK']
    });
    alert.present();
  }
  isConnecting() {
    return this._status == ConnectionStatus.CONNECTING;
  }
  isConnected() {
    return this._status == ConnectionStatus.CONNECTED;
  }
  isDisconnected() {
    return this._status == ConnectionStatus.DISCONNECTED;
  }
}
