import {Component} from '@angular/core';
import {IonicPage, Platform, ViewController} from 'ionic-angular';
import {BluetoothProvider, ConnectionStatus} from "../../providers/bluetooth/bluetooth";
import {NXTFile, NXTFileState} from "../../providers/nxt/nxt-file";

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

  constructor(private platform: Platform, private viewCtrl: ViewController, public bluetooth: BluetoothProvider) {}

  ionViewDidEnter() {
    this.file = this.viewCtrl.data.file;
    this.file.uploadStatus$.subscribe((status: NXTFileState) => {
      if (status == NXTFileState.WRITTEN || status == NXTFileState.ERROR) {
        this.unregister();
      }
      this.status = this.file.status;
    });

    //Disable the back button during this dialog
    this.unregister = this.platform.registerBackButtonAction(() => {}, 100);
    this.bluetooth.deviceStatus$
      .filter(status => status.status == ConnectionStatus.DISCONNECTED)
      .subscribe(this.unregister.bind(this));
    this.file.writeFileToDevice();
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
    return this.status == NXTFileState.FILE_EXISTS;
  }
}
