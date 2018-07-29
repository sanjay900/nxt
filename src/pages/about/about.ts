import {Component} from '@angular/core';
import {AlertController, NavController} from 'ionic-angular';
import {NxtProvider} from "../../providers/nxt/nxt";
import {GetDeviceInfo} from "../../providers/nxt/packets/system/get-device-info";
import {SystemCommand} from "../../providers/nxt/nxt-constants";
import {GetFirmwareVersion} from "../../providers/nxt/packets/system/get-firmware-version";
import {SetBrickName} from "../../providers/nxt/packets/system/set-brick-name";
import {BluetoothProvider} from "../../providers/bluetooth/bluetooth";
import {Subscription} from "rxjs";

@Component({
  selector: 'page-about',
  templateUrl: 'about.html'
})
export class AboutPage {

  public deviceInfo: GetDeviceInfo = new GetDeviceInfo();
  public deviceFirmware: GetFirmwareVersion = new GetFirmwareVersion();
  private connectSubscribe: Subscription;

  constructor(public navCtrl: NavController, private nxt: NxtProvider, private alertCtrl: AlertController, public bluetooth: BluetoothProvider) {
    this.nxt.packetEvent$
      .filter(packet => packet.id == SystemCommand.GET_DEVICE_INFO)
      .subscribe(packet => {
        this.deviceInfo = packet as GetDeviceInfo;
        console.log(this.deviceInfo.name);
      });
    this.nxt.packetEvent$
      .filter(packet => packet.id == SystemCommand.GET_FIRMWARE_VERSION)
      .subscribe(packet => {
        this.deviceFirmware = packet as GetFirmwareVersion;
      });
  }

  ionViewDidEnter() {
    this.loadInfo();
    this.connectSubscribe = this.bluetooth.deviceConnect$.subscribe(this.loadInfo.bind(this));
  }

  ionViewDidLeave() {
    this.connectSubscribe.unsubscribe();
  }

  changeName() {
    const prompt = this.alertCtrl.create({
      title: 'Set Device name',
      message: "Enter a new name for this device (limited to 14 characters)",
      inputs: [
        {
          name: 'name'
        },
      ],
      buttons: [
        {
          text: 'Cancel'
        },
        {
          text: 'Set Name',
          handler: data => {
            let name: string = data.name;
            name = name.substring(0, Math.min(14, name.length));
            name = name.padEnd(15, '\0');
            this.nxt.writePacket(false, SetBrickName.createPacket(name));
            this.loadInfo();
          }
        }
      ]
    });
    prompt.present();
  }

  private loadInfo() {
    this.nxt.writePacket(true, GetDeviceInfo.createPacket(), GetFirmwareVersion.createPacket());
  }
}
