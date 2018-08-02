import {NgModule} from '@angular/core';
import {IonicPageModule} from 'ionic-angular';
import {MotorGraphPage} from './motor-graph';

@NgModule({
  declarations: [
    MotorGraphPage,
  ],
  imports: [
    IonicPageModule.forChild(MotorGraphPage),
  ],
})
export class MotorGraphPageModule {
}
