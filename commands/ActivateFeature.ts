import Command from "src/core/domain/Command";
import {Feature} from "src/features/models/Feature";
import {ExecutionResult} from "src/core/domain/ExecutionResult";
import {useFeaturesStore} from "src/features/stores/featuresStore";

export class ActivateFeatureCommand implements Command<any> {

  constructor(
    public feature: Feature) {
  }

  async execute(): Promise<ExecutionResult<any>> {
    useFeaturesStore().activateFeature(this.feature.ident.toLowerCase())
    return Promise.resolve(
      new ExecutionResult(
        "done",
        `Feature ${this.feature.ident.toLowerCase()} was activated`))
  }

}

ActivateFeatureCommand.prototype.toString = function cmdToString() {
  return `ActivateFeatureCommand: {feature=${this.feature.ident}}`;
};
