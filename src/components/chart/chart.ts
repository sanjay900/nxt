import { Component } from '@angular/core';

/**
 * Generated class for the ChartComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'chart',
  templateUrl: 'chart.html'
})
export class ChartComponent {

  text: string;

  constructor() {
    console.log('Hello ChartComponent Component');
    this.text = 'Hello World';
  }

}
