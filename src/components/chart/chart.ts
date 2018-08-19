import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {Chart} from 'chart.js';

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
export class ChartComponent implements OnInit {
  chart: Chart;
  @ViewChild('chartCanvas') canvas;
  @Input('columnCount') maxLength;
  private currentColumn: number = 0;

  addData(data: number) {
    this.chart.data.labels.push(this.currentColumn++);
    this.chart.data.datasets.forEach((dataset) => {
      dataset.data.push(data);
      if (dataset.data.length > this.maxLength) {
        dataset.data.shift();
        this.chart.data.labels.shift();
      }
    });
    this.chart.update();
  }
  ngOnInit(): void {
    this.chart = new Chart(this.canvas.nativeElement, {
      type: 'line',
      options: {
        legend: {
          display: false
        }, tooltips: {
          enabled: false
        }
      }, data: {
        datasets: [
          {
            fill: false,
            lineTension: 0.1,
            backgroundColor: "rgba(75,192,192,0.4)",
            borderColor: "rgba(75,192,192,1)",
            borderCapStyle: 'butt',
            borderDash: [],
            borderDashOffset: 0.0,
            borderJoinStyle: 'miter',
            pointBorderColor: "rgba(75,192,192,1)",
            pointBackgroundColor: "#fff",
            pointBorderWidth: 1,
            pointRadius: 1,
            pointHitRadius: 10,
            data: [],
            spanGaps: false,
          }
        ]
      }
    });
  }
}
