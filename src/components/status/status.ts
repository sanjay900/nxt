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
      if (Utils.isVisible(this.elementRef)) {
        if (update.status == ConnectionStatus.DISCONNECTED && this._status == ConnectionStatus.CONNECTING) {
          this.showAlert(update.statusMessage);
        } else if (this._status) {
          this.showToast(update.status);
        }
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

  getStatus() {
    return ConnectionStatus[this._status].toLowerCase();
  }

  goToSettings() {
    let t: Tabs = this.nav.parent;
    t.select(5);
  }

  private showToast(status: ConnectionStatus) {
    let statusMessage = Utils.formatTitle(ConnectionStatus[status]);
    this.toastCtrl.showWithOptions({
      message: "NXT "+statusMessage,
      duration: 1000,
      position: 'bottom',
      addPixelsY: -125
    }).subscribe(() => {});
  }
}
