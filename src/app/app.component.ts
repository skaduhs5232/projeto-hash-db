import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { DataLoaderComponent } from './data-loader/data-loader.component';
import { PagesDisplayComponent } from './pages-display/pages-display.component';
import { SearchComponent } from './search/search.component';
import { ResultsComponent } from './results/results.component';
import { StatisticsComponent } from './statistics/statistics.component';
import { DataService } from './data.service'; // Importe o DataService

@Component({
  standalone: true,
  selector: 'app-root',
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    DataLoaderComponent,
    PagesDisplayComponent,
    SearchComponent,
    ResultsComponent,
    StatisticsComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [DataService] // Forneça o DataService aqui
})
export class AppComponent {
  indexResult: any;
  tableScanResult: any;
  indexSearchTime: number = 0;
  tableScanTime: number = 0;

  onSearchCompleted(event: {
    indexResult: any,
    tableScanResult: any,
    indexSearchTime: number,
    tableScanTime: number
  }): void {
    this.indexResult = event.indexResult;
    this.tableScanResult = event.tableScanResult;
    this.indexSearchTime = event.indexSearchTime;
    this.tableScanTime = event.tableScanTime;
  }
}
