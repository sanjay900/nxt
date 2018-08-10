import {NgModule} from '@angular/core';
import {IonicModule, IonicPageModule} from 'ionic-angular';
import {MotorGraphPage} from './motor-graph';
import {ComponentsModule} from "../../components/components.module";

@NgModule({
  declarations: [
    MotorGraphPage,
  ],
  imports: [
    IonicPageModule.forChild(MotorGraphPage),
    ComponentsModule,
    IonicModule
  ],
})
export class MotorGraphPageModule {
}
