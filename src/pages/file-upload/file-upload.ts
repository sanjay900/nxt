import {Component} from '@angular/core';
import {IonicPage, Platform, ViewController} from 'ionic-angular';
import {BluetoothProvider} from "../../providers/bluetooth/bluetooth";
import {
  ConnectionStatus,
  NXTFile,
  NXTFileState,
  SystemCommand,
  SystemCommandResponse
} from "../../providers/nxt/nxt.model";
import {NxtProvider} from "../../providers/nxt/nxt";
import {OpenWrite} from "../../providers/nxt/packets/system/open-write";
import {Subscription} from "rxjs";
import {Write} from "../../providers/nxt/packets/system/write";
import {Close} from "../../providers/nxt/packets/system/close";
import {StartProgram} from "../../providers/nxt/packets/direct/start-program";

@IonicPage({
  name: "file-upload"
})
@Component({
  selector: 'page-file-upload',
  templateUrl: 'file-upload.html',
})
export class FileUploadPage {
  public unregister: Function;
  private file: NXTFile = new NXTFile("");
  private status: NXTFileState = NXTFileState.OPENING;
  private writeSubscription: Subscription;

  constructor(private platform: Platform, private viewCtrl: ViewController, public bluetooth: BluetoothProvider, private nxt: NxtProvider) {}

  ionViewDidEnter() {
    this.file = this.viewCtrl.data.file;
    this.file.uploadStatus$.subscribe((status: NXTFileState) => {
      if (status == NXTFileState.WRITTEN || status == NXTFileState.ERROR) {
        this.unregister();
      }
      this.status = this.file.status;
    });
    let subscription: Subscription = this.nxt.packetEvent$
      .filter(packet => packet.id == SystemCommand.OPEN_WRITE)
      .filter((packet: OpenWrite) => packet.file == this.file)
      .subscribe(packet => {
        subscription.unsubscribe();
        if (packet.status != SystemCommandResponse.SUCCESS) {
          return;
        }
        this.writeSubscription = this.nxt.packetEvent$
          .filter(packet => packet.id == SystemCommand.WRITE)
          .filter((packet: Write) => packet.file == this.file)
          .subscribe(this.write.bind(this));
        this.write();
      });
    this.nxt.writePacket(true, OpenWrite.createPacket(this.file));
    //Disable the back button during this dialog
    this.unregister = this.platform.registerBackButtonAction(() => {}, 100);
    this.bluetooth.deviceStatus$
      .filter(status => status.status == ConnectionStatus.DISCONNECTED)
      .subscribe(this.unregister.bind(this));
  }

  ionViewDidLeave() {
    this.unregister();
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

  getColor() {
    if (this.file.status == NXTFileState.WRITTEN) {
      return "#5cb85c";
    } else if (this.bluetooth.connected && !this.file.hasError()) {
      return "#5bc0de";
    } else {
      return "#d9534f";
    }
  }

  canDismiss() {
    return !this.bluetooth.connected || this.file.hasError() || this.isWritten();
  }

  isWritten() {
    return this.status == NXTFileState.WRITTEN;
  }

  isExisting() {
    return this.file.status == NXTFileState.FILE_EXISTS;
  }

  private write() {
    if (this.file.size == this.file.writtenBytes) {
      this.writeSubscription.unsubscribe();
      this.nxt.writePacket(true, Close.createPacket(this.file));
      let subscription: Subscription = this.nxt.packetEvent$
        .filter(packet => packet.id == SystemCommand.CLOSE)
        .filter((packet: Close) => packet.file == this.file)
        .subscribe(() => {
          subscription.unsubscribe();
          if (this.file.autoStart) {
            this.nxt.writePacket(true, StartProgram.createPacket(this.file.name));
          }
        });
      return;
    }
    this.nxt.writePacket(true, Write.createPacket(this.file));
  }
}
