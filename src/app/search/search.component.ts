import { Component, Output, EventEmitter } from '@angular/core';
import { DataService } from '../data.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class SearchComponent {
  searchKey: string = '';
  indexResult: any;
  tableScanResult: any;
  indexSearchTime: number = 0;
  tableScanTime: number = 0;

  @Output() searchCompleted = new EventEmitter<{
    indexResult: any,
    tableScanResult: any,
    indexSearchTime: number,
    tableScanTime: number
  }>();

  constructor(private dataService: DataService) {}

  searchByIndex(): void {
    const start = performance.now();
    this.indexResult = this.dataService.searchByIndex(this.searchKey);
    this.indexSearchTime = performance.now() - start;
    this.emitResults();
  }

  searchByTableScan(): void {
    const start = performance.now();
    this.tableScanResult = this.dataService.searchByTableScan(this.searchKey);
    this.tableScanTime = performance.now() - start;
    this.emitResults();
  }

  emitResults(): void {
    this.searchCompleted.emit({
      indexResult: this.indexResult,
      tableScanResult: this.tableScanResult,
      indexSearchTime: this.indexSearchTime,
      tableScanTime: this.tableScanTime
    });
  }
}
