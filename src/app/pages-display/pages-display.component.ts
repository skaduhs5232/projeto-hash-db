import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Page } from '../models/page.model';

@Component({
  standalone: true,
  selector: 'app-pages-display',
  templateUrl: './pages-display.component.html',
  styleUrls: ['./pages-display.component.css'],
  imports: [CommonModule]  // Importa diretivas como *ngIf, pipes (json, number, etc.)
})
export class PagesDisplayComponent {
  firstPage: Page | null = null;
  lastPage: Page | null = null;

  // Lógica para atualizar as páginas, por exemplo:
  updatePages(pages: Page[]): void {
    if (pages.length) {
      this.firstPage = pages[0];
      this.lastPage = pages[pages.length - 1];
    }
  }
}
