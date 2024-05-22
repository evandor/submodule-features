import Command from "src/core/domain/Command";
import {Feature} from "src/features/models/Feature";
import {ExecutionResult} from "src/core/domain/ExecutionResult";
import {useFeaturesStore} from "src/features/stores/featuresStore";

export class ActivateFeatureCommand implements Command<any> {

  constructor(
    public featureIdentifier: string) {
  }

  async execute(): Promise<ExecutionResult<any>> {
    useFeaturesStore().activateFeature(this.featureIdentifier.toLowerCase())
    return Promise.resolve(
      new ExecutionResult(
        "done",
        `Feature ${this.featureIdentifier.toLowerCase()} was activated`))
  }

}

ActivateFeatureCommand.prototype.toString = function cmdToString() {
  return `ActivateFeatureCommand: {feature=${this.featureIdentifier}}`;
};
