import {Component} from '@angular/core';
import {NavController, NavParams, Platform, ViewController} from 'ionic-angular';
import {NXTFile} from "../../providers/nxt/nxt";

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

  constructor(private platform:Platform, public viewCtrl: ViewController) {
    this.file = viewCtrl.data.file;
  }

  ionViewDidEnter() {
    //Disable the back button during this dialog
    this.unregister=this.platform.registerBackButtonAction( () => {}, 100);
  }
  ionViewDidLeave() {
    this.unregister();
  }
}
