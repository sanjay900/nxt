import {Component, ElementRef, OnDestroy, OnInit} from '@angular/core';
import {BluetoothProvider, ConnectionStatus} from "../../providers/bluetooth/bluetooth";
import {AlertController, NavController, Tabs} from "ionic-angular";
import {Toast} from '@ionic-native/toast';
import {Subscription} from "rxjs";
import {Utils} from "../../utils/utils";

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
export class StatusComponent implements OnInit, OnDestroy{
  private _status?: ConnectionStatus = null;
  private subscription: Subscription;
  constructor(private elementRef: ElementRef, private nav: NavController, private bluetooth: BluetoothProvider, private alertCtrl: AlertController, private toastCtrl: Toast) {
  }

  ngOnInit() {
    this.subscription = this.bluetooth.deviceStatus$.subscribe(update => {
      if (!Utils.isVisible(this.elementRef) && this._status != null) return;
      if (update.status == ConnectionStatus.DISCONNECTED && this._status == ConnectionStatus.CONNECTING) {
        this.showAlert(update.statusMessage);
      } else if (this._status) {
        this.showToast(update.status);
      }
      this._status = update.status;
    })
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
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

  goToSettings() {
    let t: Tabs = this.nav.parent;
    t.select(5);
  }

  private showToast(status: ConnectionStatus) {
    let statusMessage = ConnectionStatus[status].toLowerCase();
    statusMessage = statusMessage.charAt(0).toLocaleUpperCase()+statusMessage.substring(1);
    this.toastCtrl.showWithOptions({
      message: "NXT "+statusMessage,
      duration: 1000,
      position: 'bottom',
      addPixelsY: -125
    }).subscribe(() => {});
  }
}
