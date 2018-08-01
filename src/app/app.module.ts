import {ErrorHandler, NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {IonicApp, IonicErrorHandler, IonicModule} from 'ionic-angular';
import {MyApp} from './app.component';

import {AboutPage} from '../pages/about/about';
import {SensorPage} from '../pages/sensors/sensor';
import {MainPage} from '../pages/main/main';
import {TabsPage} from '../pages/tabs/tabs';

import {StatusBar} from '@ionic-native/status-bar';
import {SplashScreen} from '@ionic-native/splash-screen';
import {SettingsPage} from "../pages/settings/settings";
import {AppPreferences} from "@ionic-native/app-preferences";
import {BluetoothSerial} from "@ionic-native/bluetooth-serial";
import {BluetoothProvider} from "../providers/bluetooth/bluetooth";
import {Gyroscope} from "@ionic-native/gyroscope";
import {NxtProvider} from '../providers/nxt/nxt';
import {File} from '@ionic-native/file';
import {MotorStatusPage} from "../pages/motor-status/motor-status";
import {FileUploadModule} from "../pages/file-upload/file-upload.module";
import { ChartProvider } from '../providers/chart/chart';
import {KeyboardPage} from "../pages/keyboard/keyboard";

@NgModule({
  declarations: [
    MyApp,
    AboutPage,
    SensorPage,
    MainPage,
    TabsPage,
    SettingsPage,
    MotorStatusPage,
    KeyboardPage
  ],
  imports: [
    BrowserModule,
    FileUploadModule,
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    AboutPage,
    SensorPage,
    MainPage,
    TabsPage,
    SettingsPage,
    MotorStatusPage,
    KeyboardPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    AppPreferences,
    BluetoothSerial,
    Gyroscope,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    BluetoothProvider,
    NxtProvider,
    File,
    ChartProvider,
  ]
})
export class AppModule {}
