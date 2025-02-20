import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

interface SearchResult {
  found: boolean;
  page: number;
  cost: number;
}

@Component({
  standalone: true,
  selector: 'app-results',
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.scss'],
  imports: [CommonModule]
})
export class ResultsComponent {
  @Input() indexResult: SearchResult | null = null;
  @Input() tableScanResult: SearchResult | null = null;
  @Input() indexSearchTime: number = 0;
  @Input() tableScanTime: number = 0;

  getPerformanceComparison(): string {
    if (!this.indexResult?.found && !this.tableScanResult?.found) {
      return 'Nenhum método encontrou a chave.';
    }

    const timeDiff = this.tableScanTime - this.indexSearchTime;
    const percentage = (timeDiff / this.tableScanTime) * 100;

    if (percentage > 0) {
      return `Busca por índice foi ${percentage.toFixed(2)}% mais rápida.`;
    } else if (percentage < 0) {
      return `Table scan foi ${Math.abs(percentage).toFixed(2)}% mais rápido.`;
    }
    return 'Ambos os métodos tiveram performance similar.';
  }

  getCostComparison(): string {
    if (!this.indexResult || !this.tableScanResult) {
      return 'N/A';
    }
    const costDiff = this.indexResult.cost - this.tableScanResult.cost;
    return `${costDiff} acessos`;
  }

  getTimeDifference(): string {
    return Math.abs(this.tableScanTime - this.indexSearchTime).toFixed(2);
  }
}