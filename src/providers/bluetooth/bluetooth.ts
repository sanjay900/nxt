import {EventEmitter, Injectable} from '@angular/core';
import {BluetoothSerial} from "@ionic-native/bluetooth-serial";
import {AppPreferences} from "@ionic-native/app-preferences";
import {Subscription} from "rxjs/Subscription";
import {AlertController} from "ionic-angular";

/**
 * This provider facilitates connections over bluetooth, handling emitting connect and disconnect events, and
 * provides an alert dialog to the user if the bluetooth device is disconnected.
 */
@Injectable()
export class BluetoothProvider {

  public deviceConnect$: EventEmitter<String> = new EventEmitter<String>();
  public deviceDisconnect$: EventEmitter<String> = new EventEmitter<String>();
  private observer: Subscription;

  constructor(private _bluetoothSerial: BluetoothSerial, private appPreferences: AppPreferences, public alertCtrl: AlertController) {
    this._status = "Disconnected";
  }

  private _bluetoothDevices: any[];

  get bluetoothDevices(): any[] {
    return this._bluetoothDevices;
  }

  private _device: any;

  get device(): any {
    return this._device;
  }

  set device(device: any) {
    this._device = device;
    if (this.connected) {
      this.observer.unsubscribe();
    }
    this.connect();
    this.appPreferences.store("bluetooth-device", this._device);
  }

  private _status: String;

  get status(): String {
    return this._status;
  }

  get connected(): boolean {
    return this.observer && !this.observer.closed;
  }

  get bluetoothSerial(): BluetoothSerial {
    return this._bluetoothSerial;
  }

  init() {
    this._bluetoothSerial.isEnabled().then(() => this.search(), () => {
      this._bluetoothSerial.enable().then(() => this.search())
    })
  }

  search() {
    this._bluetoothSerial.list().then(devices => this._bluetoothDevices = devices);

    this.appPreferences.fetch("bluetooth-device").then((res) => {
      this._device = res;
      this.connect();
    });
  }

  write(data: Uint8Array): Promise<any> {
    if (!this.connected) return;
    return this._bluetoothSerial.write(data);
  }

  read(): Promise<any> {
    if (!this.connected) return new Promise<any>(() => []);
    return this._bluetoothSerial.read();
  }

  private connect() {
    this._status = "Connecting";
    if (this._device) {
      this.observer = this._bluetoothSerial.connect(this._device).subscribe(() => {
        this._status = "Connected";
        this.deviceConnect$.emit(this.device);
      }, ret => {
        this.showAlert(ret);
        this.deviceDisconnect$.emit(this.device);
      });
    }
  }

  private showAlert(message: any) {
    this._status = "Disconnected";
    const alert = this.alertCtrl.create({
      title: 'Error connecting to the selected bluetooth device',
      subTitle: "Error: " + message + "<br>Try connecting to another device, or power cycling the device you are trying to connect to.",
      buttons: ['OK']
    });
    alert.present();
  }
}
