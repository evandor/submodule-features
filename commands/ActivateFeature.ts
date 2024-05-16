import Command from "../../../domain/Command";
import {ExecutionResult} from "src/domain/ExecutionResult";
import {Feature} from "../models/Feature";
import {useFeaturesStore} from "../stores/featuresStore";


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
