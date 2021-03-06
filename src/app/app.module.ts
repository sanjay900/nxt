import {ErrorHandler, NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {IonicApp, IonicErrorHandler, IonicModule} from 'ionic-angular';
import {MyApp} from './app.component';

import {AboutPage} from '../pages/about/about';
import {SensorStatusPage} from '../pages/sensors/sensor-status';
import {MainPage} from '../pages/main/main';
import {TabsPage} from '../pages/tabs/tabs';

import {StatusBar} from '@ionic-native/status-bar';
import {SplashScreen} from '@ionic-native/splash-screen';
import {SettingsPage} from "../pages/settings/settings";
import {AppPreferences} from "@ionic-native/app-preferences";
import {BluetoothSerial} from "@ionic-native/bluetooth-serial";
import {BluetoothProvider} from "../providers/bluetooth/bluetooth";
import {Gyroscope} from "@ionic-native/gyroscope";
import {NxtPacketProvider} from '../providers/nxt/nxt-packet';
import {File} from '@ionic-native/file';
import {MotorStatusPage} from "../pages/motor-status/motor-status";
import {FileUploadModule} from "../pages/file-upload/file-upload.module";
import {KeyboardPage} from "../pages/keyboard/keyboard";
import {SensorProvider} from '../providers/sensor/sensor';
import {ComponentsModule} from "../components/components.module";
import {Toast} from "@ionic-native/toast";
import {MotorProvider} from '../providers/motor/motor';
import {FileOpener} from "@ionic-native/file-opener";

@NgModule({
  declarations: [
    MyApp,
    AboutPage,
    SensorStatusPage,
    MainPage,
    TabsPage,
    SettingsPage,
    MotorStatusPage,
    KeyboardPage
  ],
  imports: [
    BrowserModule,
    FileUploadModule,
    ComponentsModule,
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    AboutPage,
    SensorStatusPage,
    MainPage,
    TabsPage,
    SettingsPage,
    MotorStatusPage,
    KeyboardPage
  ],
  providers: [
    NxtPacketProvider,
    MotorProvider,
    StatusBar,
    SplashScreen,
    AppPreferences,
    BluetoothSerial,
    Gyroscope,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    BluetoothProvider,
    File,
    SensorProvider,
    Toast,
    FileOpener
  ]
})
export class AppModule {
}
