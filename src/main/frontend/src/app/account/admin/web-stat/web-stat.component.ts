import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { SimpleTimer } from 'ng2-simple-timer';
import { MapService } from '../../../services/map.service';

@Component({
  selector: 'app-web-stat',
  templateUrl: './web-stat.component.html',
  styleUrls: ['./web-stat.component.css']
})
export class WebStatComponent implements OnInit, OnDestroy {
  // Web stats
  statTimerID: string;
  webStats = new Map([
    ['MD', 0],
    ['WV', 0],
    ['VA', 0]
  ]);

  public barChartOptions: any = {
    scaleShowVerticalLines: false,
    responsive: true,
    // offsetGridLines: false
  };
  public barChartLabels: string[] = ['States'];
  public barChartType = 'bar';
  public barChartLegend = true;

  public barChartData: any[] = [
    {data: [this.webStats.get('MD')], label: 'Maryland'},
    {data: [this.webStats.get('WV')], label: 'West Virginia'},
    {data: [this.webStats.get('VA')], label: 'Virginia'}
  ];

  constructor(private st: SimpleTimer, private mapService: MapService) {}

  ngOnInit() {
    this.st.newTimer('webStat', 5);
    this.st.subscribe('webStat', () => {
      this.mapService.getWebStats().subscribe(res => {
        const states = Object.keys(res);
        states.forEach(state => {
          this.webStats.set(state, res[state]);
        });
        // this.webStats = res;
        console.log(this.webStats);
      });
    });
  }

  ngOnDestroy() {
    this.st.delTimer('webStat');
  }

  // events
  public chartClicked(e: any): void {
    console.log(e);
  }

  public chartHovered(e: any): void {
    console.log(e);
  }
}
