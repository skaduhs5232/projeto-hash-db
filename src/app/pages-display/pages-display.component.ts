import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Page {
  number: number;
  records: string[];
}

@Component({
  standalone: true,
  selector: 'app-pages-display',
  templateUrl: './pages-display.component.html',
  styleUrls: ['./pages-display.component.scss'],
  imports: [CommonModule]
})
export class PagesDisplayComponent implements OnChanges {
  @Input() pages: Page[] = [];
  firstPage: Page | null = null;
  lastPage: Page | null = null;
  isLoading = false;
  error: string | null = null;

  ngOnChanges(): void {
    try {
      this.updatePages(this.pages);
    } catch (err) {
      this.error = 'Erro ao atualizar páginas';
      console.error(err);
    }
  }

  updatePages(pages: Page[]): void {
    if (pages.length) {
      this.firstPage = pages[0];
      this.lastPage = pages[pages.length - 1];
      this.error = null;
    } else {
      this.firstPage = null;
      this.lastPage = null;
    }
  }

  getRecordCount(page: Page | null): number {
    return page?.records?.length || 0;
  }
}