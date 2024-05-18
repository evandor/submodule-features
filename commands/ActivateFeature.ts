import Command from "src/domain/Command";
import {Feature} from "src/features/models/Feature";
import {ExecutionResult} from "src/domain/ExecutionResult";
import {useFeaturesStore} from "stores/linkedFeaturesStore";

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
