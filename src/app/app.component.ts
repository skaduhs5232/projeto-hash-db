import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { DataLoaderComponent } from './data-loader/data-loader.component';
import { PagesDisplayComponent } from './pages-display/pages-display.component';
import { SearchComponent } from './search/search.component';
import { ResultsComponent } from './results/results.component';
import { StatisticsComponent } from './statistics/statistics.component';
import { DataService } from './data.service'; // Importe o DataService
import { LogModalComponent } from './components/log-modal/log-modal.component';
import { LogService } from './services/log.service';

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
    StatisticsComponent,
    LogModalComponent
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

  @ViewChild(StatisticsComponent) statisticsComponent?: StatisticsComponent;

  constructor(private logService: LogService) {}

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

  onDataLoaded() {
    this.logService.addLog('[AppComponent] Dados carregados com sucesso!');
    if (this.statisticsComponent) {
      this.logService.addLog('[AppComponent] Atualizando estatísticas...');
      this.statisticsComponent.updateStatistics();
    } else {
      this.logService.addLog('[AppComponent] ERRO: StatisticsComponent não encontrado!');
    }
  }
}
