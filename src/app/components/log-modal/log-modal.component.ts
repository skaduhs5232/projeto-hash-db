import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LogService } from '../../services/log.service';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { DragDropModule } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-log-modal',
  templateUrl: './log-modal.component.html',
  styleUrls: ['./log-modal.component.scss'],
  standalone: true,
  imports: [CommonModule, NgScrollbarModule, DragDropModule]
})
export class LogModalComponent implements OnInit {
  logs$;

  constructor(private logService: LogService) {
    this.logs$ = this.logService.getLogs();
  }

  ngOnInit(): void {
    this.logs$ = this.logService.getLogs();
  }

  clearLogs(): void {
    this.logService.clearLogs();
  }
}
