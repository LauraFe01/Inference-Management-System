// Definisce un'interfaccia generica Dao con un parametro di tipo T
export interface Dao<T> {
  /**
   * Recupera un singolo oggetto di tipo T dal database usando il suo ID.
   * @param id - L'ID dell'oggetto da recuperare.
   * @returns Una Promise che risolve a un oggetto di tipo T o null se non trovato.
   */
  get(id: string): Promise<T | null>;

  /**
   * Recupera tutti gli oggetti di tipo T dal database.
   * @returns Una Promise che risolve a un array di oggetti di tipo T.
   */
  getAll(): Promise<T[]>;

  /**
   * Salva un nuovo oggetto di tipo T nel database.
   * @param t - L'oggetto di tipo T da salvare.
   * @returns Una Promise che si risolve quando l'oggetto è stato salvato.
   */
  save(t: T): Promise<void>;

  /**
   * Aggiorna un oggetto esistente di tipo T nel database.
   * @param t - L'oggetto di tipo T da aggiornare.
   * @param params - Altri parametri che potrebbero essere necessari per l'aggiornamento.
   * @returns Una Promise che si risolve quando l'oggetto è stato aggiornato.
   */
  update(t: T, ...params: any[]): Promise<void>;

  /**
   * Elimina un oggetto di tipo T dal database.
   * @param t - L'oggetto di tipo T da eliminare.
   * @returns Una Promise che si risolve quando l'oggetto è stato eliminato.
   */
  delete(t: T): Promise<void>;
}
