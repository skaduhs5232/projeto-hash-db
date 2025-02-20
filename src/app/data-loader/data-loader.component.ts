import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { DataService } from '../data.service';
import { LogService } from '../services/log.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-data-loader',
  templateUrl: './data-loader.component.html',
  styleUrls: ['./data-loader.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule]
})
export class DataLoaderComponent implements OnInit {
  pageSize: number = 1000; // valor inicial mais razoável
  minPageSize: number = 10;
  maxPageSize: number = 5000;
  isValidPageSize: boolean = true;
  recommendedPageSize: number = 500;
  maxRecommendedPages: number = 2000; // aumentando o limite de páginas permitidas
  @Output() dataLoaded = new EventEmitter<void>();

  constructor(
    private dataService: DataService,
    private logService: LogService
  ) {}

  ngOnInit(): void {
    this.validatePageSize(this.pageSize);
  }

  onPageSizeChange(newSize: number): void {
    this.validatePageSize(newSize);
  }

  validatePageSize(size: number): void {
    // Simplificar a validação
    this.isValidPageSize = size >= this.minPageSize && size <= this.maxPageSize;
    
    if (!this.isValidPageSize) {
      this.logService.addLog(`[DataLoader] Tamanho de página deve estar entre ${this.minPageSize} e ${this.maxPageSize}`);
    }
  }

  loadData(): void {
    if (!this.isValidPageSize) {
      const minimumRecommended = Math.ceil(466557 / this.maxRecommendedPages);
      this.logService.addLog(
        `[DataLoader] Tamanho de página inválido: ${this.pageSize}. ` +
        `Use um valor entre ${Math.max(this.minPageSize, minimumRecommended)} e ${this.maxPageSize}`
      );
      return;
    }

    this.logService.addLog(`[DataLoader] Iniciando carregamento com tamanho de página: ${this.pageSize}`);
    
    this.dataService.loadData(this.pageSize).subscribe(() => {
      this.logService.addLog(`[DataLoader] Dados carregados em ${this.dataService.pages.length} páginas`);
      this.logService.addLog('[DataLoader] Construindo índice hash...');
      this.dataService.buildHashIndex();
      this.logService.addLog('[DataLoader] Índice hash construído');
      this.dataLoaded.emit();
    });
  }
}
