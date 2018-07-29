import { Component } from '@angular/core';

import { AboutPage } from '../about/about';
import { ContactPage } from '../contact/contact';
import { MainPage } from '../main/main';
import {SettingsPage} from "../settings/settings";
import {MotorStatusPage} from "../motor-status/motor-status";

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {

  tab1Root = MainPage;
  tab2Root = AboutPage;
  tab3Root = ContactPage;
  tab4Root = MotorStatusPage;
  tab5Root = SettingsPage;

  constructor() {

  }
}
