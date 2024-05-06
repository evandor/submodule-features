
interface FeaturesPersistence {

  getServiceName(): string

  init(): Promise<any>

  getActiveFeatures(): Promise<string[]>

  compactDb(): Promise<any>

}

export default FeaturesPersistence
