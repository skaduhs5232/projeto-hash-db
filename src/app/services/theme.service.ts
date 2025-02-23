import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private isDarkTheme = new BehaviorSubject<boolean>(false);
  isDarkTheme$ = this.isDarkTheme.asObservable();
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
    if (this.isBrowser) {
      this.isDarkTheme = new BehaviorSubject<boolean>(this.getInitialTheme());
      this.updateBodyClass(this.isDarkTheme.value);
    }
  }

  private getInitialTheme(): boolean {
    if (!this.isBrowser) return false;
    
    const savedTheme = localStorage.getItem('darkTheme');
    if (savedTheme) {
      return JSON.parse(savedTheme);
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  toggleTheme() {
    if (!this.isBrowser) return;

    const newTheme = !this.isDarkTheme.value;
    this.isDarkTheme.next(newTheme);
    localStorage.setItem('darkTheme', JSON.stringify(newTheme));
    this.updateBodyClass(newTheme);
  }

  private updateBodyClass(isDark: boolean) {
    if (!this.isBrowser) return;

    const body = document.body;
    if (isDark) {
      body.classList.add('dark-theme');
    } else {
      body.classList.remove('dark-theme');
    }
  }
}
