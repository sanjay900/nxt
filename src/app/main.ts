import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';
import 'hammerjs';
import 'hammer-timejs';
import {AppModule} from './app.module';

platformBrowserDynamic().bootstrapModule(AppModule);
