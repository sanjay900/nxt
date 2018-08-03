import {NgModule} from '@angular/core';
import {IonicPageModule} from 'ionic-angular';
import {MotorGraphPage} from './motor-graph';
import {ComponentsModule} from "../../components/components.module";

@NgModule({
  declarations: [
    MotorGraphPage,
  ],
  imports: [
    IonicPageModule.forChild(MotorGraphPage),
    ComponentsModule,
  ],
})
export class MotorGraphPageModule {
}
