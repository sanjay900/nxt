import {Component} from '@angular/core';
import {Platform, ViewController} from 'ionic-angular';
import {BluetoothProvider} from "../../providers/bluetooth/bluetooth";
import {NXTFile, NXTFileState} from "../../providers/nxt/nxt-constants";

/**
 * Generated class for the FileUploadPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-file-upload',
  templateUrl: 'file-upload.html',
})
export class FileUploadPage {
  private file: NXTFile;
  public unregister: Function;

  constructor(private platform:Platform, public viewCtrl: ViewController, public bluetooth: BluetoothProvider) {
    this.file = viewCtrl.data.file;
    this.file.uploadStatus$.subscribe((status: NXTFileState) => {
      if (status == NXTFileState.DONE || status == NXTFileState.ERROR) {
        this.unregister();
      }
    });
  }

  ionViewDidEnter() {
    //Disable the back button during this dialog
    this.unregister=this.platform.registerBackButtonAction( () => {}, 100);
    this.bluetooth.deviceDisconnect$.subscribe(()=>this.unregister());
  }
  ionViewDidLeave() {
    this.unregister();
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

  getColor() {
    if (this.file.status == NXTFileState.DONE) {
      return "#5cb85c";
    } else if (this.bluetooth.connected && !this.file.hasError()) {
      return "#5bc0de";
    } else {
      return "#d9534f";
    }
  }

  canDismiss() {
    return this.file.isFinished || !this.bluetooth.connected || this.file.hasError();
  }

  getStatus() {
    return this.file.status;
  }

  isExisting() {
    return this.file.status == NXTFileState.FILE_EXISTS;
  }
}
