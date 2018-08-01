import { Component } from '@angular/core';

import { AboutPage } from '../about/about';
import { SensorPage } from '../sensors/sensor';
import { MainPage } from '../main/main';
import {SettingsPage} from "../settings/settings";
import {MotorStatusPage} from "../motor-status/motor-status";
import {KeyboardPage} from "../keyboard/keyboard";

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {

  tab1Root = MainPage;
  tab2Root = AboutPage;
  tab3Root = SensorPage;
  tab4Root = MotorStatusPage;
  tab5Root = SettingsPage;
  tab6Root = KeyboardPage

  constructor() {

  }
}
