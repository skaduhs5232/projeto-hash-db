import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.css'],
  imports: [CommonModule, HttpClientModule]
})
export class StatisticsComponent implements OnInit {
  collisionRate: number = 0;
  overflowRate: number = 0;

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    const stats = this.dataService.calculateStatistics();
    this.collisionRate = stats.collisionRate;
    this.overflowRate = stats.overflowRate;
  }
}
