import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { DataService } from '../data.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-data-loader',
  templateUrl: './data-loader.component.html',
  styleUrls: ['./data-loader.component.css'],
  imports: [CommonModule, FormsModule, HttpClientModule]
})
export class DataLoaderComponent implements OnInit {
  pageSize: number = 100;
  @Output() dataLoaded = new EventEmitter<void>();

  constructor(private dataService: DataService) {}

  ngOnInit(): void {}

  loadData(): void {
    this.dataService.loadData(this.pageSize).subscribe(() => {
      this.dataService.buildHashIndex();
      this.dataLoaded.emit();
    });
  }
}
