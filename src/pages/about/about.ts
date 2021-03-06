import {Component} from '@angular/core';
import {AlertController} from 'ionic-angular';
import {NxtPacketProvider} from "../../providers/nxt/nxt-packet";
import {GetDeviceInfo} from "../../providers/nxt/packets/system/get-device-info";
import {GetFirmwareVersion} from "../../providers/nxt/packets/system/get-firmware-version";
import {SetBrickName} from "../../providers/nxt/packets/system/set-brick-name";
import {BluetoothProvider, ConnectionStatus} from "../../providers/bluetooth/bluetooth";
import {Subscription} from "rxjs";
import {GetBatteryLevel} from "../../providers/nxt/packets/direct/get-battery-level";
import {DirectCommand} from "../../providers/nxt/packets/direct-command";
import {SystemCommand} from "../../providers/nxt/packets/system-command";

@Component({
  selector: 'page-about',
  templateUrl: 'about.html'
})
export class AboutPage {

  public deviceInfo: GetDeviceInfo = new GetDeviceInfo();
  public deviceFirmware: GetFirmwareVersion = new GetFirmwareVersion();
  public batteryInfo: GetBatteryLevel = new GetBatteryLevel();
  private connectSubscribe: Subscription;

  constructor(private nxt: NxtPacketProvider, private alertCtrl: AlertController, private bluetooth: BluetoothProvider) {
    this.nxt.packetEvent$
      .filter(packet => packet.id == SystemCommand.GET_DEVICE_INFO)
      .subscribe(packet => {
        this.deviceInfo = packet as GetDeviceInfo;
      });
    this.nxt.packetEvent$
      .filter(packet => packet.id == DirectCommand.GET_BATTERY_LEVEL)
      .subscribe(packet => {
        this.batteryInfo = packet as GetBatteryLevel;
      });
    this.nxt.packetEvent$
      .filter(packet => packet.id == SystemCommand.GET_FIRMWARE_VERSION)
      .subscribe(packet => {
        this.deviceFirmware = packet as GetFirmwareVersion;
      });
    this.nxt.packetEvent$
      .filter(packet => packet.id == SystemCommand.SET_BRICK_NAME)
      .subscribe(this.loadInfo.bind(this));
  }

  ionViewDidEnter() {
    this.loadInfo();
    this.connectSubscribe = this.bluetooth.deviceStatus$
      .filter(status => status.status == ConnectionStatus.CONNECTED)
      .subscribe(this.loadInfo.bind(this));
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
            this.nxt.writePacket(true, SetBrickName.createPacket(name));
          }
        }
      ]
    });
    prompt.present();
  }

  private loadInfo() {
    this.nxt.writePacket(true, GetDeviceInfo.createPacket(), GetFirmwareVersion.createPacket(), GetBatteryLevel.createPacket());
  }
}
