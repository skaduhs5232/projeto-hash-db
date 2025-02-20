import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LogService {
  private logs: string[] = [];
  private logsSubject = new BehaviorSubject<string[]>([]);

  addLog(message: string) {
    this.logs.push(`${new Date().toLocaleTimeString()} - ${message}`);
    this.logsSubject.next(this.logs);
  }

  getLogs() {
    return this.logsSubject.asObservable();
  }

  clearLogs() {
    this.logs = [];
    this.logsSubject.next(this.logs);
  }
}
