
interface FeaturesPersistence {

  getServiceName(): string

  init(): Promise<any>

  getActiveFeatures(): Promise<string[]>

  saveActiveFeatures(val: string[]): any

  compactDb(): Promise<any>

}

export default FeaturesPersistence
