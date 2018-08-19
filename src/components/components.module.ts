import {NgModule} from '@angular/core';
import {StatusComponent} from './status/status';
import {IonicModule} from "ionic-angular";
import { JoystickComponent } from './joystick/joystick';
import { ChartComponent } from './chart/chart';

@NgModule({
	declarations: [StatusComponent,
    JoystickComponent,
    ChartComponent],
	imports: [IonicModule],
	exports: [StatusComponent,
    JoystickComponent,
    ChartComponent]
})
export class ComponentsModule {}
