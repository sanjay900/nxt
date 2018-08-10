import {NgModule} from '@angular/core';
import {StatusComponent} from './status/status';
import {IonicModule} from "ionic-angular";

@NgModule({
	declarations: [StatusComponent],
	imports: [IonicModule],
	exports: [StatusComponent]
})
export class ComponentsModule {}
