import { Component, ElementRef, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
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
  @Input() searchWord: string = '';
  @Input() foundInPage: number = -1;
  
  @ViewChild('firstPageContainer') firstPageContainer?: ElementRef;
  @ViewChild('lastPageContainer') lastPageContainer?: ElementRef;
  
  firstPage: Page | null = null;
  lastPage: Page | null = null;
  isLoading = false;
  error: string | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    try {
      if (changes['pages']) {
        this.updatePages(this.pages);
      }
      
      // Se a página encontrada mudou, realizar o scroll
      if (changes['foundInPage'] && this.foundInPage !== -1) {
        this.scrollToFoundWord();
      }
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

  shouldHighlight(word: string): boolean {
    return this.searchWord !== '' && word.toLowerCase() === this.searchWord.toLowerCase();
  }

  scrollToFoundWord(): void {
    setTimeout(() => {
      if (this.foundInPage === this.firstPage?.number && this.firstPageContainer) {
        const element = this.firstPageContainer.nativeElement.querySelector('.highlighted');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      } else if (this.foundInPage === this.lastPage?.number && this.lastPageContainer) {
        const element = this.lastPageContainer.nativeElement.querySelector('.highlighted');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }, 100);
  }
}