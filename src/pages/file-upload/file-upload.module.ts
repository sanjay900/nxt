import {NgModule} from '@angular/core';
import {IonicPageModule} from 'ionic-angular';
import {FileUploadPage} from "./file-upload";
import {ProgressBarModule} from "angular-progress-bar";

@NgModule({
  declarations: [
    FileUploadPage,
  ],
  imports: [
    ProgressBarModule,
    IonicPageModule.forChild(FileUploadPage),
  ],
})
export class FileUploadModule {
}
