export class Bucket {
  entries: Array<{key: string, page: number}> = [];
  overflow: Array<{key: string, page: number}> = [];
  
  // Contadores para estatísticas
  collisionCount: number = 0;
  overflowCount: number = 0;

  insert(entry: { key: string, page: number }, maxEntries: number): void {

    if (this.entries.length < maxEntries) {
      // Ainda há espaço no bucket principal
      this.entries.push(entry);
    } else {
      // Se for o primeiro registro que excede o limite, contabiliza a colisão
      if (this.overflow.length === 0) {
        this.collisionCount++; // Conta uma única colisão para este bucket
      }
      // Adiciona a entrada ao overflow
      this.overflow.push(entry);
      // Atualiza o contador de overflow
      this.overflowCount = this.overflow.length;
    }
  }
  
  
  // Método para obter o total de entradas no bucket
  getTotalEntries(): number {
    return this.entries.length + this.overflow.length;
  }
  
  // Método para verificar se o bucket está vazio
  isEmpty(): boolean {
    return this.entries.length === 0 && this.overflow.length === 0;
  }
  
  // Método para verificar se o bucket tem overflow
  hasOverflow(): boolean {
    return this.overflow.length > 0;
  }
  
  // Método para obter a taxa de ocupação do bucket principal
  getMainOccupancyRate(maxEntries: number): number {
    return maxEntries > 0 ? (this.entries.length / maxEntries) * 100 : 0;
  }
}
