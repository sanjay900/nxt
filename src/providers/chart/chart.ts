import {Chart} from 'chart.js';

export class ChartProvider {

  static addData(chart: Chart, data: number, column: string, maxLength: number) {
    chart.data.labels.push(column);
    chart.data.datasets.forEach((dataset) => {
      dataset.data.push(data);
      if (dataset.data.length > maxLength) {
        dataset.data.shift();
        chart.data.labels.shift();
      }
    });
    chart.update();

  }
  static createLineChart(nativeElement): Chart {
    return new Chart(nativeElement, {
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
