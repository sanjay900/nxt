import {NgModule} from '@angular/core';
import {IonicPageModule} from 'ionic-angular';
import {SensorGraphPage} from './sensor-graph';
import {ComponentsModule} from "../../components/components.module";

@NgModule({
  declarations: [
    SensorGraphPage,
  ],
  imports: [
    IonicPageModule.forChild(SensorGraphPage),
    ComponentsModule,
  ],
})
export class SensorGraphPageModule {
}
