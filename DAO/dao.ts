export interface Dao<T> {
    get(id: string): Promise<T | null>;
    getAll(): Promise<T[]>;
    save(t: T): Promise<void>;
    update(t: T, ...params: any[]): Promise<void>;
    delete(t: T): Promise<void>;
  }