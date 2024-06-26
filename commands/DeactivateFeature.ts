import Command from "src/core/domain/Command";
import {ExecutionResult} from "src/core/domain/ExecutionResult";
import {Feature} from "../models/Feature";
import {useFeaturesStore} from "../stores/featuresStore";


export class DeactivateFeatureCommand implements Command<any> {

  constructor(
    public featureIdentifier: string) {
  }


  async execute(): Promise<ExecutionResult<any>> {
    useFeaturesStore().deactivateFeature(this.featureIdentifier.toLowerCase())
    return Promise.resolve(
      new ExecutionResult(
        "done",
        `Feature ${this.featureIdentifier.toLowerCase()} was deactivated`))
  }

}

DeactivateFeatureCommand.prototype.toString = function cmdToString() {
  return `DeactivateFeatureCommand: {feature=${this.featureIdentifier}}`;
};
