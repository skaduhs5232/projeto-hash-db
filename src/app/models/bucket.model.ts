export class Bucket {
  entries: Array<{key: string, page: number}> = [];
  overflow: Array<{key: string, page: number}> = [];
  
  // Contadores para estatísticas
  collisionCount: number = 0;
  overflowCount: number = 0;

  insert(entry: {key: string, page: number}, maxEntries: number): void {
    // Verificar se a entrada já existe (evitar duplicatas)
    if (this.entries.some(e => e.key === entry.key) || 
        this.overflow.some(e => e.key === entry.key)) {
      return;
    }
    
    // Se há espaço no bucket principal (ainda não atingiu maxEntries)
    if (this.entries.length < maxEntries) {
      this.entries.push(entry);
    } else {
      // O bucket principal está cheio (já tem 10 entradas)
      // Portanto, esta é uma colisão que causa overflow (a partir da 11ª entrada)
      this.collisionCount++;
      
      // A entrada vai para overflow
      this.overflow.push(entry);
      // Incrementa o contador de overflow
      this.overflowCount++;
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
