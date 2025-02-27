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
        words.push('funfou');
        words.push('db');
        words.push('alan');

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
          `[DataService] Palavras de teste adicionadas`
        );
        return this.pages; // Retorna as páginas criadas
      })
    );
  }

  // Constrói o índice hash, criando os buckets e inserindo as entradas
  buildHashIndex(): void {
    // Ajustar número de buckets baseado no tamanho total de registros
    this.numBuckets = Math.ceil(this.totalRecords / (this.maxEntriesPerBucket * 0.7));
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
    
    // Calcular estatísticas
    const stats = this.calculateStatistics();
    this.logService.addLog('------------- Estatísticas do Índice Hash -------------');
    this.logService.addLog(`Total de registros: ${totalInserted}`);
    this.logService.addLog(`Taxa de Colisões: ${stats.collisionRate.toFixed(2)}% (${this.getTotalCollisions()} colisões)`);
    this.logService.addLog(`Taxa de Overflow: ${stats.overflowRate.toFixed(2)}% (${this.getTotalOverflows()} overflows)`);
    this.logService.addLog(`Buckets utilizados: ${stats.bucketsUsed}/${this.numBuckets} (${(stats.bucketsUsed/this.numBuckets*100).toFixed(2)}%)`);
    this.logService.addLog('----------------------------------------------------');
}

// Métodos auxiliares para obter totais
getTotalCollisions(): number {
    return this.buckets.reduce((sum, bucket) => sum + bucket.collisionCount, 0);
}

getTotalOverflows(): number {
    return this.buckets.reduce((sum, bucket) => sum + bucket.overflowCount, 0);
}

  // Função hash simples (pode ser aprimorada)
  hash(key: string): number {
    let hashValue = 0;
    for (let i = 0; i < key.length; i++) {
      hashValue = (Math.imul(31, hashValue) + (key.charCodeAt(i)) * 5) | 0;
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
    bucketUtilization: number;
    maxBucketSize: number;
  } {
    let totalEntries = 0;
    let totalCollisions = 0;
    let totalOverflows = 0;
    let bucketsUsed = 0;
    let emptyBuckets = 0;
    let maxBucketSize = 0;
    
    this.logService.addLog(`[DEBUG] Iniciando cálculo de estatísticas`);
    this.logService.addLog(`[DEBUG] Número total de buckets: ${this.numBuckets}`);
    this.logService.addLog(`[DEBUG] Tamanho máximo do bucket: ${this.maxEntriesPerBucket}`);

    // Conta buckets utilizados e vazios
    for (let i = 0; i < this.buckets.length; i++) {
        const bucket = this.buckets[i];
        const totalBucketEntries = bucket.getTotalEntries();
        
        // Atualiza o tamanho máximo do bucket
        if (totalBucketEntries > maxBucketSize) {
            maxBucketSize = totalBucketEntries;
        }
        
        totalEntries += totalBucketEntries;
        totalCollisions += bucket.collisionCount;
        totalOverflows += bucket.overflowCount;
        
        if (bucket.isEmpty()) {
            emptyBuckets++;
        } else {
            bucketsUsed++;
        }
    }

    // Estatísticas intermediárias para debug
    this.logService.addLog(`[DEBUG] Total de entradas: ${totalEntries}`);
    this.logService.addLog(`[DEBUG] Total de colisões: ${totalCollisions}`);
    this.logService.addLog(`[DEBUG] Total de overflows: ${totalOverflows}`);
    this.logService.addLog(`[DEBUG] Buckets usados: ${bucketsUsed}/${this.numBuckets}`);
    this.logService.addLog(`[DEBUG] Tamanho máximo de bucket encontrado: ${maxBucketSize}`);

    // Taxa de colisão = porcentagem de entradas que causaram colisão
    const collisionRate = totalEntries > 0 
        ? (totalCollisions / totalEntries) * 8
        : 0;
    
    // Taxa de overflow = porcentagem de entradas que foram para overflow
    const overflowRate = totalEntries > 0 
        ? (totalOverflows / totalEntries) * 100 
        : 0;
    
    const averageEntriesPerBucket = this.numBuckets > 0 
        ? totalEntries / this.numBuckets 
        : 0;
        
    const bucketUtilization = this.maxEntriesPerBucket > 0
        ? (averageEntriesPerBucket / this.maxEntriesPerBucket) * 100
        : 0;
    
    const bucketDistribution = this.buckets.map(
        bucket => bucket.getTotalEntries()
    );

    this.logService.addLog(`[DEBUG] Estatísticas finais:`);
    this.logService.addLog(`[DEBUG] - Taxa de colisão: ${collisionRate.toFixed(2)}%`);
    this.logService.addLog(`[DEBUG] - Taxa de overflow: ${overflowRate.toFixed(2)}%`);
    this.logService.addLog(`[DEBUG] - Média de entradas por bucket: ${averageEntriesPerBucket.toFixed(2)}`);
    this.logService.addLog(`[DEBUG] - Utilização dos buckets: ${bucketUtilization.toFixed(2)}%`);

    return {
        collisionRate,
        overflowRate,
        bucketsUsed,
        emptyBuckets,
        averageEntriesPerBucket,
        bucketDistribution,
        bucketUtilization,
        maxBucketSize
    };
  }
}
