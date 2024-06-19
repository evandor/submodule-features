import {useAuthStore} from "stores/authStore";
import {collection, deleteDoc, doc, getDoc, getDocs, setDoc, updateDoc} from "firebase/firestore";
import FirebaseServices from "src/services/firebase/FirebaseServices";
import FeaturesPersistence from "src/features/persistence/FeaturesPersistence";
import {uid} from "quasar";

const STORE_IDENT = 'features';

function featureDoc(id: string) {
  return doc(FirebaseServices.getFirestore(), "users", useAuthStore().user.uid, STORE_IDENT, id)
}

function featuresCollection() {
  return collection(FirebaseServices.getFirestore(), "users", useAuthStore().user.uid, STORE_IDENT)
}

class FirestoreFeaturesPersistence implements FeaturesPersistence {

  getServiceName(): string {
    return this.constructor.name
  }

  async init() {
    //console.debug(" ...initializing GitPersistenceService")
    //this.indexedDB = useDB(undefined).db as typeof IndexedDbPersistenceService
    return Promise.resolve("")
  }

  compactDb(): Promise<any> {
    return Promise.resolve(undefined);
  }

  migrate(): any {
    // no op for firestore
  }

  clear(name: string): void {
  }

  async getActiveFeatures(): Promise<string[]> {

    // const querySnapshot = await getDocs(collection(FirebaseServices.getFirestore(), "users", useAuthStore().user.uid, STORE_IDENT));
    // querySnapshot.forEach((doc) => {
    //   // doc.data() is never undefined for query doc snapshots
    //   console.log(doc.id, " => ", doc.data());
    // });

    // collection(FirebaseServices.getFirestore(), "users", useAuthStore().user.uid, STORE_IDENT)
    const docs = await getDocs(featuresCollection())
    console.log("docs", docs)

    const res: string[] = []
    docs.forEach((doc) => {
      // doc.data() is never undefined for query doc snapshots
      //console.log(doc.id, " => ", doc.data())
      res.push(doc.data()['feature'])
    });
    return Promise.resolve(res)


    // if (docs) {
    //   return _.map(docs, (doc: any) => {
    //     console.log("doc", doc)
    //     const d = doc.data() as string
    //     console.log("d",d)
    //     return d ? d : ''
    //   })
    // }
  }

  async saveActiveFeatures(activeFeatures: string[]) {
    const docs = await getDocs(featuresCollection())
    //_.map(docs, (doc: any) => doc.data() as string)
    docs.forEach(async (doc: any) => {
      console.log("deleting document", doc)
      await deleteDoc(featureDoc(doc.id))
    })
    activeFeatures.forEach((feature: string) => {
      setDoc(featureDoc(uid()), {feature})
    })

  }


}

export default new FirestoreFeaturesPersistence()
