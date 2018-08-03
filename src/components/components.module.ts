import { NgModule } from '@angular/core';
import { StatusComponent } from './status/status';
import {IonicModule} from "ionic-angular";
@NgModule({
	declarations: [StatusComponent],
	imports: [IonicModule.forRoot(StatusComponent)],
	exports: [StatusComponent]
})
export class ComponentsModule {}
