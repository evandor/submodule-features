import Command from "src/domain/Command";
import {ExecutionResult} from "src/domain/ExecutionResult";
import {Feature} from "../models/Feature";
import {useFeaturesStore} from "../stores/featuresStore";


export class DeactivateFeatureCommand implements Command<any> {

  constructor(
    public feature: Feature) {
  }


  async execute(): Promise<ExecutionResult<any>> {
    useFeaturesStore().deactivateFeature(this.feature.ident.toLowerCase())
    return Promise.resolve(
      new ExecutionResult(
        "done",
        `Feature ${this.feature.ident.toLowerCase()} was deactivated`))
  }

}

DeactivateFeatureCommand.prototype.toString = function cmdToString() {
  return `DeactivateFeatureCommand: {feature=${this.feature.ident}}`;
};
