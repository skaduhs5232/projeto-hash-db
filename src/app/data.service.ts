import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Page } from './models/page.model';
import { Bucket } from './models/bucket.model';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { LogService } from './services/log.service';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  pages: Page[] = []; // Array para armazenar as páginas de dados
  buckets: Bucket[] = []; // Array para armazenar os buckets do índice hash
  numBuckets: number = 0; // Número de buckets no índice hash
  totalRecords: number = 0; // Total de registros carregados
  maxEntriesPerBucket: number = 10; // Máximo de entradas por bucket, aumentado para reduzir overflows

  constructor(
    private http: HttpClient, // Serviço HTTP para carregar dados
    private logService: LogService // Serviço de log para registrar atividades
  ) {}

  // Carrega o arquivo de palavras e cria as páginas
  loadData(pageSize: number): Observable<Page[]> {
    this.logService.addLog(
      `[DataService] Carregando dados com tamanho de página: ${pageSize}`
    );
    return this.http.get('assets/words.txt', { responseType: 'text' }).pipe(
      map((data) => {
        const words = data
          .split('\n')
          .map((word) => word.trim().toLowerCase()) // Normalizar palavras
          .filter((word) => word.length > 0);

        // Adicionar algumas palavras de teste garantidas
        words.push('teste123');
        words.push('palavra');
        words.push('buscar');
        words.push('encontrar');

        this.totalRecords = words.length; // Atualiza o total de registros
        this.pages = []; // Reinicia as páginas
        let pageNumber = 1;

        this.logService.addLog(
          `[DataService] Total de palavras: ${words.length}`
        );

        // Criar páginas
        for (let i = 0; i < words.length; i += pageSize) {
          const pageRecords = words.slice(i, i + pageSize);
          this.pages.push(new Page(pageNumber++, pageRecords));
        }

        this.logService.addLog(
          `[DataService] Palavras de teste adicionadas: teste123, palavra, buscar, encontrar`
        );
        return this.pages; // Retorna as páginas criadas
      })
    );
  }

  // Constrói o índice hash, criando os buckets e inserindo as entradas
  buildHashIndex(): void {
    // Ajustar número de buckets baseado no tamanho das páginas
    this.numBuckets = Math.ceil(
      this.totalRecords / (this.maxEntriesPerBucket * 2)
    );
    this.logService.addLog(
      `[HashIndex] Criando ${this.numBuckets} buckets (maxEntries=${this.maxEntriesPerBucket})`
    );

    this.buckets = Array.from({ length: this.numBuckets }, () => new Bucket());

    let totalInserted = 0;
    for (let page of this.pages) {
      for (let record of page.records) {
        const bucketIndex = this.hash(record); // Calcula o índice do bucket
        this.buckets[bucketIndex].insert(
          { key: record, page: page.number },
          this.maxEntriesPerBucket
        );
        totalInserted++;
      }
    }

    this.logService.addLog(
      `[HashIndex] Total de registros inseridos: ${totalInserted}`
    );
  }

  // Função hash simples (pode ser aprimorada)
  hash(key: string): number {
    let hashValue = 0;
    for (let i = 0; i < key.length; i++) {
      hashValue = (Math.imul(31, hashValue) + key.charCodeAt(i)) | 0;
    }
    return Math.abs(hashValue) % this.numBuckets; // Retorna o índice do bucket
  }

      //Com fibonacci
/*   hash(key: string): number {
    let hashValue = 0;
    for (let i = 0; i < key.length; i++) {
      hashValue = (Math.imul(31, hashValue) + key.charCodeAt(i)) | 0;
    }
    // dispersão de Fibonacci para melhorar a distribuição
    const goldenRatio = (Math.sqrt(5) - 1) / 2;
    hashValue = Math.floor(this.numBuckets * ((hashValue * goldenRatio) % 1));
    return Math.abs(hashValue) % this.numBuckets; // Retorna o índice do bucket
  } */

  // Busca utilizando o índice hash
  searchByIndex(searchKey: string): {
    found: boolean;
    page: number;
    cost: number;
  } {
    const bucketIndex = this.hash(searchKey); // Calcula o índice do bucket
    let cost = 1;
    this.logService.addLog(`[Índice Hash] Buscando chave: "${searchKey}"`);
    this.logService.addLog(`[Índice Hash] Hash calculado: ${bucketIndex}`);
    this.logService.addLog(`[Índice Hash] Acessando bucket ${bucketIndex}`);

    const bucket = this.buckets[bucketIndex];
    this.logService.addLog(
      `[Índice Hash] Entradas no bucket: ${bucket.entries.length}`
    );
    this.logService.addLog(
      `[Índice Hash] Overflow entries: ${bucket.overflow.length}`
    );

    let foundEntry = bucket.entries.find((e) => e.key === searchKey); // Busca nas entradas principais
    if (!foundEntry) {
      this.logService.addLog(
        '[Índice Hash] Chave não encontrada nas entradas principais, verificando overflow'
      );
      foundEntry = bucket.overflow.find((e) => e.key === searchKey); // Busca nas entradas de overflow
      cost++;
    }

    if (foundEntry) {
      this.logService.addLog(
        `[Índice Hash] Chave encontrada na página ${foundEntry.page}`
      );
    } else {
      this.logService.addLog('[Índice Hash] Chave não encontrada');
    }

    return foundEntry
      ? { found: true, page: foundEntry.page, cost }
      : { found: false, page: -1, cost };
  }

  // Busca realizando table scan (percorrendo todas as páginas)
  searchByTableScan(searchKey: string): {
    found: boolean;
    page: number;
    cost: number;
  } {
    let cost = 0;
    this.logService.addLog(`[Table Scan] Iniciando busca por: "${searchKey}"`);

    for (let page of this.pages) {
      cost++;
      this.logService.addLog(`[Table Scan] Verificando página ${page.number}`);

      if (page.records.includes(searchKey)) {
        this.logService.addLog(
          `[Table Scan] Chave encontrada na página ${page.number}`
        );
        return { found: true, page: page.number, cost };
      }
    }

    this.logService.addLog(
      `[Table Scan] Chave não encontrada após verificar ${cost} páginas`
    );
    return { found: false, page: -1, cost };
  }

  // Calcula as estatísticas: taxa de colisões e de overflows
  calculateStatistics(): {
    collisionRate: number;
    overflowRate: number;
    bucketsUsed: number;
    emptyBuckets: number;
    averageEntriesPerBucket: number;
    bucketDistribution: number[];
  } {
    let totalEntries = 0;
    let totalCollisions = 0;
    let totalOverflows = 0;
    let bucketsUsed = 0;
    let emptyBuckets = 0;

    this.logService.addLog(
      '[Statistics] Calculando estatísticas detalhadas...'
    );

    for (let i = 0; i < this.buckets.length; i++) {
      const bucket = this.buckets[i];
      const entriesInBucket = bucket.entries.length;
      const overflowCount = bucket.overflow.length;

      if (entriesInBucket === 0 && overflowCount === 0) {
        emptyBuckets++;
        continue;
      }

      bucketsUsed++;
      totalEntries += entriesInBucket;
      totalOverflows += overflowCount;

      // Uma colisão ocorre quando há mais de uma entrada no mesmo bucket
      if (entriesInBucket > 1) {
        totalCollisions += entriesInBucket - 1;
      }

      this.logService.addLog(
        `[Statistics] Bucket ${i}: ${entriesInBucket} entradas principais, ` +
          `${overflowCount} overflows`
      );
    }

    const totalRecordsProcessed = totalEntries + totalOverflows;

    // Calcular taxas
    const collisionRate = (totalCollisions / totalRecordsProcessed) * 100;
    const overflowRate = (totalOverflows / totalRecordsProcessed) * 100;

    this.logService.addLog(
      `[Statistics] Buckets vazios: ${emptyBuckets}/${this.numBuckets}`
    );
    this.logService.addLog(
      `[Statistics] Buckets utilizados: ${bucketsUsed}/${this.numBuckets}`
    );
    this.logService.addLog(`[Statistics] Entradas principais: ${totalEntries}`);
    this.logService.addLog(`[Statistics] Entradas overflow: ${totalOverflows}`);
    this.logService.addLog(`[Statistics] Total colisões: ${totalCollisions}`);
    this.logService.addLog(
      `[Statistics] Total registros: ${totalRecordsProcessed}`
    );
    this.logService.addLog(
      `[Statistics] Média de entradas por bucket: ${(
        totalRecordsProcessed / bucketsUsed
      ).toFixed(2)}`
    );
    this.logService.addLog(
      `[Statistics] Taxa de colisões: ${collisionRate.toFixed(2)}%`
    );
    this.logService.addLog(
      `[Statistics] Taxa de overflows: ${overflowRate.toFixed(2)}%`
    );

    const bucketDistribution = this.buckets.map(
      (bucket) => bucket.entries.length + bucket.overflow.length
    );

    return {
      collisionRate,
      overflowRate,
      bucketsUsed,
      emptyBuckets,
      averageEntriesPerBucket: totalRecordsProcessed / bucketsUsed,
      bucketDistribution,
    };
  }
}
