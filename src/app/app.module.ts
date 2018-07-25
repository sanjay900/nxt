import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';

import { AboutPage } from '../pages/about/about';
import { ContactPage } from '../pages/contact/contact';
import { MainPage } from '../pages/main/main';
import { TabsPage } from '../pages/tabs/tabs';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import {SettingsPage} from "../pages/settings/settings";
import {AppPreferences} from "@ionic-native/app-preferences";
import {BluetoothSerial} from "@ionic-native/bluetooth-serial";
import {BluetoothProvider} from "../providers/bluetooth/bluetooth";
import {Gyroscope} from "@ionic-native/gyroscope";
import { NxtProvider } from '../providers/nxt/nxt';

@NgModule({
  declarations: [
    MyApp,
    AboutPage,
    ContactPage,
    MainPage,
    TabsPage,
    SettingsPage
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    AboutPage,
    ContactPage,
    MainPage,
    TabsPage,
    SettingsPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    AppPreferences,
    BluetoothSerial,
    Gyroscope,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    BluetoothProvider,
    NxtProvider
  ]
})
export class AppModule {}
