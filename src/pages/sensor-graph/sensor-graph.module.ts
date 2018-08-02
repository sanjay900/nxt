import {NgModule} from '@angular/core';
import {IonicPageModule} from 'ionic-angular';
import {SensorGraphPage} from './sensor-graph';

@NgModule({
  declarations: [
    SensorGraphPage,
  ],
  imports: [
    IonicPageModule.forChild(SensorGraphPage),
  ],
})
export class SensorGraphPageModule {
}
