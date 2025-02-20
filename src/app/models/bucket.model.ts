export class Bucket {
  entries: Array<{key: string, page: number}> = [];
  overflow: Array<{key: string, page: number}> = [];

  insert(entry: {key: string, page: number}, maxEntries: number): void {
    // Verificar se a entrada já existe (evitar duplicatas)
    if (this.entries.some(e => e.key === entry.key) || 
        this.overflow.some(e => e.key === entry.key)) {
      return;
    }

    // Se há espaço no bucket principal
    if (this.entries.length < maxEntries) {
      this.entries.push(entry);
    } else {
      // Senão, vai para overflow
      this.overflow.push(entry);
    }
  }
}
