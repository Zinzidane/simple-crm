import { Component, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { AnalyticsService } from '../shared/services/analytics.service';
import { AnalyticsPage } from '../shared/interfaces';
import { Subscription } from 'rxjs';
import { Chart } from 'chart.js';

@Component({
  selector: 'app-analytics-page',
  templateUrl: './analytics-page.component.html',
  styleUrls: ['./analytics-page.component.css']
})
export class AnalyticsPageComponent implements AfterViewInit, OnDestroy {
  @ViewChild('gain') gainRef: ElementRef;
  @ViewChild('order') orderRef: ElementRef;

  aSub: Subscription;
  average: number;
  pending = true;

  constructor(private analyticsService: AnalyticsService) { }

  ngAfterViewInit() {
    const gainConfig: any = {
      label: 'Выручка',
      color: 'rgb(255, 99, 132)'
    };

    const orderConfig: any = {
      label: 'Заказы',
      color: 'rgb(54, 162, 235)'
    };

    this.aSub = this.analyticsService.getAnalytics().subscribe(
      (data: AnalyticsPage) => {
        this.average = data.average;

        // Temp data just for testing
        gainConfig.labels.push('29.08.2018');
        gainConfig.data.push(1000);
        gainConfig.labels.push('30.08.2018');
        gainConfig.data.push(500);
        orderConfig.labels.push('29.08.2018');
        orderConfig.data.push(100);
        orderConfig.labels.push('30.08.2018');
        orderConfig.data.push(900);

        gainConfig.labels = data.chart.map(item => item.label);
        gainConfig.data = data.chart.map(item => item.gain);

        orderConfig.labels = data.chart.map(item => item.label);
        orderConfig.data = data.chart.map(item => item.order);

        const gainContext = this.gainRef.nativeElement.getContext('2d');
        const orderContext = this.orderRef.nativeElement.getContext('2d');
        gainContext.canvas.height = '300px';
        orderContext.canvas.height = '300px';

        new Chart(gainContext, createChartConfig(gainConfig));
        new Chart(orderContext, createChartConfig(orderConfig));

        this.pending = false;
      }
    );
  }

  ngOnDestroy() {
    if (this.aSub) {
      this.aSub.unsubscribe();
    }
  }

}


function createChartConfig({labels, data, label, color}) {
  return {
    type: 'line',
    options: {
      responsive: true
    },
    data: {
      labels,
      datasets: [
        {
          label,
          data,
          borderColor: color,
          steppedLine: false,
          fill: false
        }
      ]
    }
  };
}
