import {EventEmitter, Injectable} from '@angular/core';
import {BluetoothSerial} from "@ionic-native/bluetooth-serial";
import {AppPreferences} from "@ionic-native/app-preferences";
import {Subscription} from "rxjs/Subscription";
import {AlertController} from "ionic-angular";

/*
  Generated class for the BluetoothProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class BluetoothProvider {

  public deviceConnect$: EventEmitter<String> = new EventEmitter<String>();
  public deviceDisconnect$: EventEmitter<String> = new EventEmitter<String>();
  private _bluetoothDevices: any[];
  private _device: any;
  private observer: Subscription;
  private _status: String;

  constructor(private _bluetoothSerial: BluetoothSerial, private appPreferences: AppPreferences, public alertCtrl: AlertController) {
    this._status = "Disconnected";
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

  write(data: Uint8Array): Promise<any> {
    if (!this.connected) return;
    return this._bluetoothSerial.write(data);
  }

  read(): Promise<any> {
    if (!this.connected) return new Promise<any>(() => []);
    return this._bluetoothSerial.read();
  }

  get bluetoothDevices(): any[] {
    return this._bluetoothDevices;
  }

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

  get status(): String {
    return this._status;
  }

  get connected(): boolean {
    return this.observer && !this.observer.closed;
  }

  get bluetoothSerial(): BluetoothSerial {
    return this._bluetoothSerial;
  }
}
