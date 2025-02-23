import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button class="theme-toggle" (click)="toggleTheme()" [attr.aria-label]="(isDark$ | async) ? 'Ativar modo claro' : 'Ativar modo escuro'">
      <i class="material-icons">{{ (isDark$ | async) ? 'light_mode' : 'dark_mode' }}</i>
    </button>
  `,
  styles: [`
    .theme-toggle {
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background: var(--primary-color);
      border: none;
      color: white;
      cursor: pointer;
      box-shadow: 0 2px 5px rgba(0,0,0,0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      transition: transform 0.3s;

      &:hover {
        transform: scale(1.1);
      }
    }
  `]
})
export class ThemeToggleComponent implements OnInit {
  isDark$;

  constructor(private themeService: ThemeService) {
    this.isDark$ = this.themeService.isDarkTheme$;
  }

  ngOnInit() {}

  toggleTheme() {
    this.themeService.toggleTheme();
  }
}
