export class Bucket {
    entries: { key: string, page: number }[] = [];
    overflow: { key: string, page: number }[] = [];
  
    insert(entry: { key: string, page: number }, maxEntries: number) {
      if (this.entries.length < maxEntries) {
        this.entries.push(entry);
      } else {
        this.overflow.push(entry);
      }
    }
  }
  