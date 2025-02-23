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

  bucketsUsed: number = 0;
  emptyBuckets: number = 0;
  averageEntriesPerBucket: number = 0;
  bucketDistribution: number[] = [];

  protected readonly isBrowser = typeof window !== 'undefined';

  constructor(
    private dataService: DataService,
    private logService: LogService
  ) {}

  ngOnInit(): void {
    this.logService.addLog('[StatisticsComponent] Componente inicializado');
    this.updateStatistics();
  }

  ngAfterViewInit() {
    if (typeof window === 'undefined') return; // Proteção SSR

    this.logService.addLog('[StatisticsComponent] Inicializando gráficos...');
    // Aumenta o delay para garantir que o DOM está completamente carregado
    setTimeout(() => {
      this.updateStatistics();
      this.initCharts();
    }, 100);
  }

  private initCharts() {
    // Verifica se está rodando no browser
    if (typeof window === 'undefined') {
      return; // Não executa no SSR
    }

    if (!this.barChartCanvas?.nativeElement || !this.pieChartCanvas?.nativeElement || !this.lineChartCanvas?.nativeElement) {
      this.logService.addLog('[StatisticsComponent] ERRO: Elementos Canvas não encontrados');
      return;
    }

    try {
      this.logService.addLog('[StatisticsComponent] Iniciando criação dos gráficos');
      this.destroyCharts();
      
      // Adiciona um pequeno delay para garantir que o DOM está pronto
      requestAnimationFrame(() => {
        this.initBarChart();
        this.initPieChart();
        this.initLineChart();
        this.logService.addLog('[StatisticsComponent] Gráficos criados com sucesso');
      });
    } catch (error) {
      this.logService.addLog(`[StatisticsComponent] Erro ao criar gráficos: ${error}`);
    }
  }

  private destroyCharts() {
    if (this.barChart) {
      this.barChart.destroy();
      this.barChart = undefined;
    }
    if (this.pieChart) {
      this.pieChart.destroy();
      this.pieChart = undefined;
    }
    if (this.lineChart) {
      this.lineChart.destroy();
      this.lineChart = undefined;
    }
  }

  private initBarChart() {
    if (typeof window === 'undefined') return; // Proteção SSR

    const canvas = this.barChartCanvas.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      this.logService.addLog('[StatisticsComponent] Erro: Contexto 2D não disponível');
      return;
    }

    this.barChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Taxa de Colisões', 'Taxa de Overflow'],
        datasets: [{
          label: 'Porcentagem %',
          data: [this.collisionRate, this.overflowRate],
          backgroundColor: ['rgba(54,162,235,0.5)', 'rgba(255,99,132,0.5)'],
          borderColor: ['rgb(54,162,235)', 'rgb(255,99,132)'],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Taxas de Colisão e Overflow'
          }
        },
        scales: {
          y: { beginAtZero: true }
        }
      }
    });
  }

  private initPieChart() {
    if (typeof window === 'undefined') return; // Proteção SSR

    const canvas = this.pieChartCanvas.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      this.logService.addLog('[StatisticsComponent] Erro: Contexto 2D não disponível');
      return;
    }

    this.pieChart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: ['Buckets Utilizados', 'Buckets Vazios'],
        datasets: [{
          data: [this.bucketsUsed, this.emptyBuckets],
          backgroundColor: ['rgba(75,192,192,0.5)', 'rgba(201,203,207,0.5)'],
          borderColor: ['rgb(75,192,192)', 'rgb(201,203,207)']
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: { display: true, text: 'Distribuição de Buckets' }
        }
      }
    });
  }

  private initLineChart() {
    if (typeof window === 'undefined') return; // Proteção SSR

    const canvas = this.lineChartCanvas.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      this.logService.addLog('[StatisticsComponent] Erro: Contexto 2D não disponível');
      return;
    }

    this.lineChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: this.bucketDistribution.map((_, i) => `Bucket ${i}`),
        datasets: [{
          label: 'Entradas por Bucket',
          data: this.bucketDistribution,
          borderColor: 'rgb(54,162,235)',
          tension: 0.1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: { display: true, text: 'Distribuição por Bucket' }
        },
        scales: { y: { beginAtZero: true } }
      }
    });
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

    this.logService.addLog(`[StatisticsComponent] Taxa de Colisões: ${this.collisionRate.toFixed(2)}%`);
    this.logService.addLog(`[StatisticsComponent] Taxa de Overflow: ${this.overflowRate.toFixed(2)}%`);
    this.logService.addLog(`[StatisticsComponent] Buckets Utilizados: ${this.bucketsUsed}`);
    this.logService.addLog(`[StatisticsComponent] Buckets Vazios: ${this.emptyBuckets}`);
    this.logService.addLog(`[StatisticsComponent] Média de Entradas por Bucket: ${this.averageEntriesPerBucket.toFixed(2)}`);

    if (this.barChart && this.pieChart && this.lineChart) {
      this.logService.addLog('[StatisticsComponent] Atualizando gráficos...');
      this.barChart.data.datasets[0].data = [this.collisionRate, this.overflowRate];
      this.barChart.update();
      
      this.pieChart.data.datasets[0].data = [this.bucketsUsed, this.emptyBuckets];
      this.pieChart.update();
      
      this.lineChart.data.labels = this.bucketDistribution.map((_, i) => `Bucket ${i}`);
      this.lineChart.data.datasets[0].data = this.bucketDistribution;
      this.lineChart.update();
    }
  }
}