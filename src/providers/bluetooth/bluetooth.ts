import {Injectable} from '@angular/core';
import {BluetoothSerial} from "@ionic-native/bluetooth-serial";
import {AppPreferences} from "@ionic-native/app-preferences";
import {Subscription} from "rxjs/Subscription";
import {ConnectionStatus, ConnectionUpdate} from "../nxt/nxt.model";
import {BehaviorSubject, Subject} from "rxjs";

/**
 * This provider facilitates connections over bluetooth, handling emitting connect and disconnect events, and
 * provides an alert dialog to the user if the bluetooth device is disconnected.
 */
@Injectable()
export class BluetoothProvider {

  public deviceStatus$: Subject<ConnectionUpdate> = new BehaviorSubject<ConnectionUpdate>(new ConnectionUpdate(ConnectionStatus.DISCONNECTED));
  private observer: Subscription;

  constructor(private _bluetoothSerial: BluetoothSerial, private appPreferences: AppPreferences) {}

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

  get connected(): boolean {
    return this.observer && !this.observer.closed;
  }

  get bluetoothSerial(): BluetoothSerial {
    return this._bluetoothSerial;
  }

  init() {
    this._bluetoothSerial.isEnabled().then(
      this.search.bind(this),
      () => this._bluetoothSerial.enable().then(this.search.bind(this))
    )
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
    this.deviceStatus$.next(new ConnectionUpdate(ConnectionStatus.CONNECTING));
    if (this._device) {
      this.observer = this._bluetoothSerial.connect(this._device).subscribe(() => {
        this.deviceStatus$.next(new ConnectionUpdate(ConnectionStatus.CONNECTED));
      }, reason => {
        this.deviceStatus$.next(new ConnectionUpdate(ConnectionStatus.DISCONNECTED, reason));
      });
    }
  }
}
