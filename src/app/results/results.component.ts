import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-results',
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.css'],
  imports: [CommonModule]
})
export class ResultsComponent {
  @Input() indexResult: any;
  @Input() tableScanResult: any;
  @Input() indexSearchTime: number = 0;
  @Input() tableScanTime: number = 0;
}
