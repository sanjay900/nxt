import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {NxtProvider} from "../../providers/nxt/nxt";

/**
 * Generated class for the MotorStatusPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-motor-status',
  templateUrl: 'motor-status.html',
})
export class MotorStatusPage {

  constructor(public navCtrl: NavController, public navParams: NavParams, public nxt: NxtProvider) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad MotorStatusPage');
  }

}
