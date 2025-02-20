import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { DataService } from '../data.service';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { LogService } from '../services/log.service';
import { Chart, ChartConfiguration, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.scss'],
  standalone: true,
  imports: [CommonModule, HttpClientModule]
})
export class StatisticsComponent implements OnInit, AfterViewInit {
  @ViewChild('barChartCanvas') barChartCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('pieChartCanvas') pieChartCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('lineChartCanvas') lineChartCanvas!: ElementRef<HTMLCanvasElement>;
  
  private barChart?: Chart;
  private pieChart?: Chart;
  private lineChart?: Chart;
  collisionRate: number = 0;
  overflowRate: number = 0;

  // Adicionar novas propriedades para dados estatísticos
  bucketsUsed: number = 0;
  emptyBuckets: number = 0;
  averageEntriesPerBucket: number = 0;
  bucketDistribution: number[] = [];

  constructor(
    private dataService: DataService,
    private logService: LogService
  ) {}

  ngOnInit(): void {
    this.logService.addLog('[StatisticsComponent] Componente inicializado');
  }

  ngAfterViewInit() {
    // Aguardar o DOM estar pronto
    setTimeout(() => {
      this.updateStatistics();
      this.initCharts();
    }, 100);
  }

  private initCharts() {
    try {
      this.logService.addLog('[Statistics] Iniciando criação dos gráficos...');
      
      if (this.barChartCanvas?.nativeElement) {
        this.initBarChart();
      }
      
      if (this.pieChartCanvas?.nativeElement) {
        this.initPieChart();
      }
      
      if (this.lineChartCanvas?.nativeElement) {
        this.initLineChart();
      }
      
      this.logService.addLog('[Statistics] Gráficos criados com sucesso');
    } catch (error) {
      this.logService.addLog(`[Statistics] Erro ao criar gráficos: ${error}`);
    }
  }

  private initBarChart() {
    if (!this.barChartCanvas) return;
    const ctx = this.barChartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    try {
      this.barChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['Taxa de Colisões', 'Taxa de Overflow'],
          datasets: [{
            label: 'Porcentagem %',
            data: [this.collisionRate, this.overflowRate],
            backgroundColor: ['rgba(54, 162, 235, 0.5)', 'rgba(255, 99, 132, 0.5)'],
            borderColor: ['rgb(54, 162, 235)', 'rgb(255, 99, 132)'],
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: 'Estatísticas do Hash'
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              max: 100
            }
          }
        }
      });
      this.logService.addLog('[Statistics] Gráfico de barras criado');
    } catch (error) {
      this.logService.addLog(`[Statistics] Erro ao criar gráfico de barras: ${error}`);
    }
  }

  private initPieChart() {
    if (!this.pieChartCanvas) return;
    const ctx = this.pieChartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    try {
      this.pieChart = new Chart(ctx, {
        type: 'pie',
        data: {
          labels: ['Buckets Utilizados', 'Buckets Vazios'],
          datasets: [{
            data: [this.bucketsUsed, this.emptyBuckets],
            backgroundColor: [
              'rgba(75, 192, 192, 0.5)',
              'rgba(201, 203, 207, 0.5)'
            ],
            borderColor: [
              'rgb(75, 192, 192)',
              'rgb(201, 203, 207)'
            ],
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: 'Distribuição de Buckets'
            },
            legend: {
              position: 'bottom'
            }
          }
        }
      });
      this.logService.addLog('[Statistics] Gráfico de pizza criado');
    } catch (error) {
      this.logService.addLog(`[Statistics] Erro ao criar gráfico de pizza: ${error}`);
    }
  }

  private initLineChart() {
    if (!this.lineChartCanvas) return;
    const ctx = this.lineChartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    try {
      this.lineChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: this.bucketDistribution.map((_, i) => `Bucket ${i}`),
          datasets: [{
            label: 'Entradas por Bucket',
            data: this.bucketDistribution,
            borderColor: 'rgb(54, 162, 235)',
            tension: 0.1,
            fill: false
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: 'Distribuição de Entradas por Bucket'
            }
          },
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
      this.logService.addLog('[Statistics] Gráfico de linha criado');
    } catch (error) {
      this.logService.addLog(`[Statistics] Erro ao criar gráfico de linha: ${error}`);
    }
  }

  updateStatistics(): void {
    this.logService.addLog('[StatisticsComponent] Atualizando estatísticas...');
    const stats = this.dataService.calculateStatistics();
    this.collisionRate = stats.collisionRate;
    this.overflowRate = stats.overflowRate;
    this.bucketsUsed = stats.bucketsUsed;
    this.emptyBuckets = stats.emptyBuckets;
    this.averageEntriesPerBucket = stats.averageEntriesPerBucket;
    this.bucketDistribution = stats.bucketDistribution;

    // Atualizar gráficos com delay para garantir que foram inicializados
    setTimeout(() => {
      if (this.barChart) {
        this.barChart.data.datasets[0].data = [
          Number(this.collisionRate.toFixed(2)),
          Number(this.overflowRate.toFixed(2))
        ];
        this.barChart.update();
      }

      if (this.pieChart) {
        this.pieChart.data.datasets[0].data = [this.bucketsUsed, this.emptyBuckets];
        this.pieChart.update();
      }

      if (this.lineChart) {
        this.lineChart.data.labels = this.bucketDistribution.map((_, i) => `Bucket ${i}`);
        this.lineChart.data.datasets[0].data = this.bucketDistribution;
        this.lineChart.update();
      }
    }, 100);
  }
}
