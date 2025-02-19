import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Page } from './models/page.model';
import { Bucket } from './models/bucket.model';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  pages: Page[] = [];
  buckets: Bucket[] = [];
  numBuckets: number = 0;
  totalRecords: number = 0;
  maxEntriesPerBucket: number = 5; // FR: pode ser ajustado

  constructor(private http: HttpClient) {}

  // Carrega o arquivo de palavras e cria as páginas
  loadData(pageSize: number): Observable<Page[]> {
    return this.http.get('assets/words.txt', { responseType: 'text' }).pipe(
      map(data => {
        const words = data.split('\n').filter(word => word.trim().length > 0);
        this.totalRecords = words.length;
        this.pages = [];
        let pageNumber = 1;
        for (let i = 0; i < words.length; i += pageSize) {
          const pageRecords = words.slice(i, i + pageSize);
          this.pages.push(new Page(pageNumber, pageRecords));
          pageNumber++;
        }
        return this.pages;
      })
    );
  }

  // Constrói o índice hash, criando os buckets e inserindo as entradas
  buildHashIndex(): void {
    this.numBuckets = Math.ceil(this.totalRecords / this.maxEntriesPerBucket) + 1;
    this.buckets = Array.from({ length: this.numBuckets }, () => new Bucket());
    for (let page of this.pages) {
      for (let record of page.records) {
        const bucketIndex = this.hash(record);
        this.buckets[bucketIndex].insert({ key: record, page: page.number }, this.maxEntriesPerBucket);
      }
    }
  }

  // Função hash simples (pode ser aprimorada)
  hash(key: string): number {
    let hashValue = 0;
    for (let i = 0; i < key.length; i++) {
      hashValue = (hashValue * 31 + key.charCodeAt(i)) % this.numBuckets;
    }
    return hashValue;
  }

  // Busca utilizando o índice hash
  searchByIndex(searchKey: string): { found: boolean, page: number, cost: number } {
    const bucketIndex = this.hash(searchKey);
    let cost = 1;
    const bucket = this.buckets[bucketIndex];
    let foundEntry = bucket.entries.find(e => e.key === searchKey);
    if (!foundEntry) {
      foundEntry = bucket.overflow.find(e => e.key === searchKey);
      cost++;
    }
    return foundEntry ? { found: true, page: foundEntry.page, cost } : { found: false, page: -1, cost };
  }

  // Busca realizando table scan (percorrendo todas as páginas)
  searchByTableScan(searchKey: string): { found: boolean, page: number, cost: number } {
    let cost = 0;
    for (let page of this.pages) {
      cost++;
      if (page.records.includes(searchKey)) {
        return { found: true, page: page.number, cost };
      }
    }
    return { found: false, page: -1, cost };
  }

  // Calcula as estatísticas: taxa de colisões e de overflows
  calculateStatistics(): { collisionRate: number, overflowRate: number } {
    let totalCollisions = 0;
    let totalOverflows = 0;
    for (let bucket of this.buckets) {
      if (bucket.entries.length > 1) {
        totalCollisions += (bucket.entries.length - 1);
      }
      totalOverflows += bucket.overflow.length;
    }
    const collisionRate = (totalCollisions / this.totalRecords) * 100;
    const overflowRate = (totalOverflows / this.totalRecords) * 100;
    return { collisionRate, overflowRate };
  }
}
