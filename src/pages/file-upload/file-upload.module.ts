import {NgModule} from '@angular/core';
import {IonicPageModule} from 'ionic-angular';
import {FileUploadPage} from "./file-upload";
import {ProgressBarModule} from "angular-progress-bar";
import {ComponentsModule} from "../../components/components.module";

@NgModule({
  declarations: [
    FileUploadPage,
  ],
  imports: [
    ProgressBarModule,
    IonicPageModule.forChild(FileUploadPage),
    ComponentsModule,
  ],
})
export class FileUploadModule {
}
