import {IDBPDatabase, openDB, deleteDB} from "idb";
import FeaturesPersistence from "src/features/persistence/FeaturesPersistence";

// TODO not needed (?)
class IndexedDbFeaturesPersistence implements FeaturesPersistence {

  private STORE_IDENT = 'features';

  private db: IDBPDatabase = null as unknown as IDBPDatabase

  getServiceName(): string {
    return "IndexedDbFeaturesStorage";
  }

  async init() {
    console.log(" ...initializing features (IndexedDbFeaturesStorage)" )
    this.db = await this.initDatabase()
    return Promise.resolve()
  }

  private async initDatabase(): Promise<IDBPDatabase> {
    console.debug(" about to initialize indexedDB (Features)")
    const ctx = this
    return await openDB("featuresDB", 1, {
      // upgrading see https://stackoverflow.com/questions/50193906/create-index-on-already-existing-objectstore
      upgrade(db) {
        if (!db.objectStoreNames.contains(ctx.STORE_IDENT)) {
          console.log("creating db " + ctx.STORE_IDENT)
          db.createObjectStore(ctx.STORE_IDENT);
        }
      }
    });
  }

  compactDb(): Promise<any> {
    return Promise.resolve(undefined);
  }

  getActiveFeatures(): Promise<string[]> {
    return this.db.getAll(this.STORE_IDENT)
  }

  saveActiveFeatures(val: string[]): any {
    // TODO
  }


}

export default new IndexedDbFeaturesPersistence()
